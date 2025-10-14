import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

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

    const order = await prisma.order.findFirst({ where: { id: orderId, clerkUserId: userId } })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const subId = order.stripeSubscriptionId ?? undefined
    let stripeError: string | null = null
    if (subId && stripe && typeof stripe.subscriptions === 'object') {
      try {
        // End-of-period cancellation per product policy
        await stripe.subscriptions.update(subId, { cancel_at_period_end: true })
      } catch (err) {
        console.error('[Cancel] Stripe cancel failed:', err)
        stripeError = err instanceof Error ? err.message : 'Unknown Stripe error'
        // proceed to mark cancelled locally even if Stripe indicates already cancelled
      }
    } else if (subId) {
      stripeError = 'Stripe not configured - subscription will be cancelled locally only'
    }

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
    })

    return NextResponse.json({ success: true, message: 'Subscription cancelled successfully', stripeError })
  } catch (error) {
    console.error('[Cancel] error:', error)
    return NextResponse.json({ error: 'Unable to cancel subscription. Please contact support.' }, { status: 500 })
  }
}
