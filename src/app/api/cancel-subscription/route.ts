import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { invalidateCache } from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, reason } = await request.json() as { orderId?: string; reason?: string }
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const order = await prisma.order.findFirst({ 
      where: { 
        id: orderId,
        onboardingData: {
          clerkUserId: userId
        }
      },
      include: {
        onboardingData: {
          select: {
            clerkUserId: true
          }
        }
      }
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const stripe = getStripe()
    const subId = order.stripeSubscriptionId ?? undefined
    let stripeError: string | null = null
    let stripeSuccess = false
    
    if (subId && stripe) {
      try {
        // End-of-period cancellation per product policy
        const updated = await stripe.subscriptions.update(subId, { 
          cancel_at_period_end: true 
        })
        stripeSuccess = true
        console.log(`[Cancel] Stripe subscription ${subId} scheduled for cancellation at period end`)
        
        // Verify the update was successful
        if (!updated.cancel_at_period_end) {
          console.warn(`[Cancel] Warning: cancel_at_period_end not set on subscription ${subId}`)
        }
      } catch (err) {
        console.error('[Cancel] Stripe cancel failed:', err)
        const errorMessage = err instanceof Error ? err.message : 'Unknown Stripe error'
        stripeError = errorMessage
        
        // Check if subscription doesn't exist or is already cancelled
        if (err instanceof Error && (
          err.message.includes('No such subscription') ||
          err.message.includes('already canceled')
        )) {
          console.log(`[Cancel] Subscription ${subId} already cancelled or doesn't exist, proceeding with local update`)
          // Continue to update locally
        } else {
          // For other errors, we still update locally but return the error
          console.warn('[Cancel] Stripe error, but proceeding with local cancellation')
        }
      }
    } else if (subId) {
      stripeError = 'Stripe not configured - subscription will be cancelled locally only'
      console.warn('[Cancel] Stripe not configured, cancelling locally only')
    } else {
      console.warn(`[Cancel] Order ${order.id} has no Stripe subscription ID, cancelling locally only`)
    }

    // Update order status in database
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          subscriptionStatus: 'cancel_at_period_end',
          cancellationReason: reason || 'User initiated cancellation',
          cancelledAt: new Date(),
        },
      })
      // We don't delete inboxes/domains until Stripe confirms via webhook
      // This happens once the subscription actually ends.
      // We also don't update order.status to CANCELLED until the period ends
    })

    // Invalidate dashboard cache so the UI updates immediately
    // Get clerkUserId from order.clerkUserId, onboardingData, or use auth userId
    const clerkUserId = order.clerkUserId || order.onboardingData?.clerkUserId || userId
    if (clerkUserId) {
      try {
        await invalidateCache(`dashboard:${clerkUserId}`)
        console.log(`[Cancel] Invalidated dashboard cache for user ${clerkUserId}`)
      } catch (cacheError) {
        console.error('[Cancel] Failed to invalidate cache:', cacheError)
        // Don't fail the request if cache invalidation fails
      }
    } else {
      console.warn(`[Cancel] No clerkUserId found for order ${order.id}, cache not invalidated`)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription cancelled successfully', 
      stripeError: stripeError || undefined,
      stripeSuccess 
    })
  } catch (error) {
    console.error('[Cancel] error:', error)
    return NextResponse.json({ error: 'Unable to cancel subscription. Please contact support.' }, { status: 500 })
  }
}
