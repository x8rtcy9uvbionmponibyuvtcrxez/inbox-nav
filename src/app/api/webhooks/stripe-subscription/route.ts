import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { invalidateCache } from '@/lib/redis'
import { notifySubscriptionCancelled } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  if (!sig || !webhookSecret) {
    console.error('[Stripe Webhook] Missing webhook signature or secret')
    return NextResponse.json({ error: 'Missing webhook configuration' }, { status: 400 })
  }

  const stripe = getStripe()
  if (!stripe) {
    console.error('[Stripe Webhook] Stripe secret key missing')
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  let event: Stripe.Event
  try {
    // Get the raw body as a Buffer to preserve the exact format
    const body = await request.arrayBuffer()
    const payload = Buffer.from(body).toString('utf8')
    
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret)
    console.log(`[Stripe Webhook] Received event: ${event.type}`)
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const subId: string | undefined = subscription?.id
        
        if (!subId) {
          console.warn('[Stripe Webhook] No subscription ID in deleted event')
          break
        }

        console.log(`[Stripe Webhook] Processing subscription deletion: ${subId}`)

        const order = await prisma.order.findFirst({ where: { stripeSubscriptionId: subId } })
        if (!order) {
          console.warn(`[Stripe Webhook] Order not found for subscription: ${subId}`)
          return NextResponse.json({ received: true })
        }

        console.log(`[Stripe Webhook] Found order: ${order.id}, updating status to CANCELLED`)

        const now = new Date()
        let inboxCount = 0;
        let domainCount = 0;
        
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { 
              subscriptionStatus: 'cancelled',
              cancelledAt: now, 
              status: 'CANCELLED' 
            },
          })
          
          const inboxUpdateResult = await tx.inbox.updateMany({ 
            where: { orderId: order.id }, 
            data: { status: 'DELETED' } 
          })
          
          const domainUpdateResult = await tx.domain.updateMany({ 
            where: { orderId: order.id }, 
            data: { status: 'DELETED' } 
          })

          inboxCount = inboxUpdateResult.count;
          domainCount = domainUpdateResult.count;

          console.log(`[Stripe Webhook] Updated ${inboxCount} inboxes and ${domainCount} domains to DELETED`)
        })

        console.log(`[Stripe Webhook] Successfully processed subscription deletion for order: ${order.id}`)

        // Invalidate dashboard cache for the affected user
        if (order.clerkUserId) {
          await invalidateCache(`dashboard:${order.clerkUserId}`)
        }

        // Send subscription cancelled notification
        try {
          const affectedCounts = {
            inboxes: inboxCount,
            domains: domainCount,
          };

          const orderData = {
            id: order.id,
            productType: order.productType,
            quantity: order.quantity,
            totalAmount: order.totalAmount,
            clerkUserId: order.clerkUserId,
            createdAt: order.createdAt,
            businessName: order.businessName,
          };

          const subscriptionData = {
            id: subscription.id,
            status: subscription.status,
            canceled_at: subscription.canceled_at,
            cancel_reason: (subscription as { cancel_reason?: string }).cancel_reason,
          };

          await notifySubscriptionCancelled(orderData, subscriptionData, affectedCounts);
          console.log('[NOTIFICATION] Subscription cancelled notification sent');
        } catch (notificationError) {
          console.error('[NOTIFICATION] Failed to send subscription cancelled notification:', notificationError);
          // Don't fail the main flow if notification fails
        }

        break
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const subId: string | undefined = subscription?.id
        const subscriptionStatus = subscription?.status

        if (!subId || !subscriptionStatus) {
          console.warn('[Stripe Webhook] Missing subscription ID or status in updated event')
          break
        }

        console.log(`[Stripe Webhook] Processing subscription update: ${subId}, status: ${subscriptionStatus}, cancel_at_period_end: ${subscription.cancel_at_period_end}`)

        const order = await prisma.order.findFirst({ where: { stripeSubscriptionId: subId } })
        if (!order) {
          console.warn(`[Stripe Webhook] Order not found for subscription: ${subId}`)
          return NextResponse.json({ received: true })
        }

        // Check if subscription is scheduled for cancellation at period end
        const isCancelScheduled = subscription.cancel_at_period_end === true

        // Determine the correct subscription status:
        // If cancel_at_period_end is true, use 'cancel_at_period_end' to preserve cancellation state
        // Otherwise, use the actual Stripe subscription status
        const newSubscriptionStatus = isCancelScheduled ? 'cancel_at_period_end' : subscriptionStatus

        console.log(`[Stripe Webhook] Found order: ${order.id}, updating subscription status to: ${newSubscriptionStatus}`)

        // Update subscription status and handle cancellation
        const isCanceled = subscriptionStatus === 'canceled'
        const cancelledAt = subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null

        await prisma.order.update({
          where: { id: order.id },
          data: {
            subscriptionStatus: newSubscriptionStatus,
            cancelledAt: isCanceled ? cancelledAt ?? new Date() : (isCancelScheduled ? order.cancelledAt || new Date() : cancelledAt),
            status: isCanceled ? 'CANCELLED' : order.status,
          },
        })

        // If subscription is actually cancelled, mark related items as deleted
        if (isCanceled) {
          await prisma.inbox.updateMany({
            where: { orderId: order.id },
            data: { status: 'DELETED' },
          })
          await prisma.domain.updateMany({
            where: { orderId: order.id },
            data: { status: 'DELETED' },
          })
        }

        // Invalidate dashboard cache for the affected user
        if (order.clerkUserId) {
          await invalidateCache(`dashboard:${order.clerkUserId}`)
        }

        console.log(`[Stripe Webhook] Successfully updated subscription status for order: ${order.id}`)
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscriptionId: string | undefined = (invoice as any).subscription ? String((invoice as any).subscription) : undefined
        
        if (!subscriptionId) {
          console.warn('[Stripe Webhook] No subscription ID in payment failed event')
          break
        }

        console.log(`[Stripe Webhook] Processing payment failure for subscription: ${subscriptionId}`)

        const order = await prisma.order.findFirst({
          where: { stripeSubscriptionId: subscriptionId }
        })

        if (!order) {
          console.warn(`[Stripe Webhook] Order not found for subscription: ${subscriptionId}`)
          return NextResponse.json({ received: true })
        }

        console.log(`[Stripe Webhook] Found order: ${order.id}, updating subscription status to past_due`)

        await prisma.order.update({
          where: { id: order.id },
          data: { subscriptionStatus: 'past_due' },
        })

        // Invalidate dashboard cache for the affected user
        if (order.clerkUserId) {
          await invalidateCache(`dashboard:${order.clerkUserId}`)
        }

        console.log(`[Stripe Webhook] Successfully updated subscription status to past_due for order: ${order.id}`)
        break
      }
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
        break
    }
  } catch (err) {
    console.error('[Stripe Webhook] Error processing webhook:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
