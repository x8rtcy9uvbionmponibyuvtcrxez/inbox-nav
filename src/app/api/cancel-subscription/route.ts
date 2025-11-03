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
        OR: [
          { clerkUserId: userId },
          { onboardingData: { clerkUserId: userId } },
        ],
      },
      include: {
        onboardingData: {
          select: {
            clerkUserId: true,
          },
        },
      },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const stripe = getStripe()
    const subId = order.stripeSubscriptionId ?? undefined
    let stripeError: string | null = null
    let stripeSuccess = false
    let alreadyCancelledInStripe = false
    
    if (subId) {
      if (!stripe) {
        console.error('[Cancel] Stripe secret key missing while cancelling subscription', { orderId: order.id })
        return NextResponse.json(
          { error: 'Unable to cancel subscription because Stripe is not configured. Please contact support.' },
          { status: 500 },
        )
      }

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
        const errorMessage = err instanceof Error ? err.message : 'Unknown Stripe error'
        console.error('[Cancel] Stripe cancel failed:', errorMessage)
        stripeError = errorMessage
        
        if (err instanceof Error && (
          errorMessage.includes('No such subscription') ||
          errorMessage.includes('already canceled')
        )) {
          alreadyCancelledInStripe = true
          console.log(`[Cancel] Subscription ${subId} already cancelled in Stripe, updating local record`)
        } else {
          return NextResponse.json(
            { error: `Stripe cancellation failed: ${errorMessage}` },
            { status: 502 },
          )
        }
      }
    } else {
      console.warn(`[Cancel] Order ${order.id} has no Stripe subscription ID, cancelling locally only`)
    }

    // Update order status in database (only after Stripe success or safe fallback)
    await prisma.order.update({
      where: { id: order.id },
      data: {
        subscriptionStatus: 'cancel_at_period_end',
        cancellationReason: reason || 'User initiated cancellation',
        cancelledAt: new Date(),
      },
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

    const message = alreadyCancelledInStripe
      ? 'Subscription was already cancelled in Stripe. Local records synced.'
      : subId
        ? 'Subscription cancelled successfully'
        : 'Subscription record updated locally'

    if (!stripeSuccess && !alreadyCancelledInStripe && subId) {
      stripeError = stripeError ?? 'Unknown Stripe error'
    }

    return NextResponse.json({ 
      success: true, 
      message, 
      stripeError: stripeError || undefined,
      stripeSuccess: stripeSuccess || alreadyCancelledInStripe || !subId 
    })
  } catch (error) {
    console.error('[Cancel] error:', error)
    return NextResponse.json({ error: 'Unable to cancel subscription. Please contact support.' }, { status: 500 })
  }
}
