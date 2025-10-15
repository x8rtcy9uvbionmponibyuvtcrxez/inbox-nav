import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

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
    const payload = await request.text()
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

          console.log(`[Stripe Webhook] Updated ${inboxUpdateResult.count} inboxes and ${domainUpdateResult.count} domains to DELETED`)
        })

        console.log(`[Stripe Webhook] Successfully processed subscription deletion for order: ${order.id}`)
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

        console.log(`[Stripe Webhook] Processing subscription update: ${subId}, status: ${subscriptionStatus}`)

        const order = await prisma.order.findFirst({ where: { stripeSubscriptionId: subId } })
        if (!order) {
          console.warn(`[Stripe Webhook] Order not found for subscription: ${subId}`)
          return NextResponse.json({ received: true })
        }

        console.log(`[Stripe Webhook] Found order: ${order.id}, updating subscription status to: ${subscriptionStatus}`)

        // Update subscription status and handle cancellation
        const isCanceled = subscriptionStatus === 'canceled'
        const cancelledAt = subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null

        await prisma.order.update({
          where: { id: order.id },
          data: {
            subscriptionStatus: subscriptionStatus,
            cancelledAt: isCanceled ? cancelledAt ?? new Date() : cancelledAt,
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
