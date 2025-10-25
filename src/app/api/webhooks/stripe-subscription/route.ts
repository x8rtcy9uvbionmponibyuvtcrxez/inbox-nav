import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { notifySubscriptionCancelled } from '@/lib/notifications';
import { logger } from '@/lib/logger';

const log = logger.prefixed('Stripe Webhook');

export async function POST(request: NextRequest) {
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  if (!sig || !webhookSecret) {
    log.error('Missing webhook signature or secret');
    return NextResponse.json({ error: 'Missing webhook configuration' }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    log.error('Stripe secret key missing');
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    // Get the raw body as a Buffer to preserve the exact format
    const body = await request.arrayBuffer();
    const payload = Buffer.from(body).toString('utf8');

    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    log.info(`Received event: ${event.type}`);
  } catch (err) {
    log.error('Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subId: string | undefined = subscription?.id;

        if (!subId) {
          log.warn('No subscription ID in deleted event');
          break;
        }

        log.info(`Processing subscription deletion: ${subId}`);

        const order = await prisma.order.findFirst({ where: { stripeSubscriptionId: subId } });
        if (!order) {
          log.warn(`Order not found for subscription: ${subId}`);
          return NextResponse.json({ received: true });
        }

        log.info(`Found order: ${order.id}, updating status to CANCELLED`);

        const now = new Date();
        let inboxCount = 0;
        let domainCount = 0;

        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: {
              subscriptionStatus: 'cancelled',
              cancelledAt: now,
              status: 'CANCELLED',
            },
          });

          const inboxUpdateResult = await tx.inbox.updateMany({
            where: { orderId: order.id },
            data: { status: 'DELETED' },
          });

          const domainUpdateResult = await tx.domain.updateMany({
            where: { orderId: order.id },
            data: { status: 'DELETED' },
          });

          inboxCount = inboxUpdateResult.count;
          domainCount = domainUpdateResult.count;

          log.debug(`Updated ${inboxCount} inboxes and ${domainCount} domains to DELETED`);
        });

        log.info(`Successfully processed subscription deletion for order: ${order.id}`);

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
          log.info('Subscription cancelled notification sent');
        } catch (notificationError) {
          log.error('Failed to send subscription cancelled notification:', notificationError);
          // Don't fail the main flow if notification fails
        }

        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subId: string | undefined = subscription?.id;
        const subscriptionStatus = subscription?.status;

        if (!subId || !subscriptionStatus) {
          log.warn('Missing subscription ID or status in updated event');
          break;
        }

        log.info(`Processing subscription update: ${subId}, status: ${subscriptionStatus}`);

        const order = await prisma.order.findFirst({ where: { stripeSubscriptionId: subId } });
        if (!order) {
          log.warn(`Order not found for subscription: ${subId}`);
          return NextResponse.json({ received: true });
        }

        log.info(`Found order: ${order.id}, updating subscription status to: ${subscriptionStatus}`);

        // Update subscription status and handle cancellation
        const isCanceled = subscriptionStatus === 'canceled';
        const cancelledAt = subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null;

        await prisma.order.update({
          where: { id: order.id },
          data: {
            subscriptionStatus: subscriptionStatus,
            cancelledAt: isCanceled ? cancelledAt ?? new Date() : cancelledAt,
            status: isCanceled ? 'CANCELLED' : order.status,
          },
        });

        // If subscription is actually cancelled, mark related items as deleted
        if (isCanceled) {
          await prisma.inbox.updateMany({
            where: { orderId: order.id },
            data: { status: 'DELETED' },
          });
          await prisma.domain.updateMany({
            where: { orderId: order.id },
            data: { status: 'DELETED' },
          });
        }

        log.info(`Successfully updated subscription status for order: ${order.id}`);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // Type-safe access to subscription ID
        const subscriptionId: string | undefined = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.toString();

        if (!subscriptionId) {
          log.warn('No subscription ID in payment failed event');
          break;
        }

        log.info(`Processing payment failure for subscription: ${subscriptionId}`);

        const order = await prisma.order.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (!order) {
          log.warn(`Order not found for subscription: ${subscriptionId}`);
          return NextResponse.json({ received: true });
        }

        log.info(`Found order: ${order.id}, updating subscription status to past_due`);

        await prisma.order.update({
          where: { id: order.id },
          data: { subscriptionStatus: 'past_due' },
        });

        log.info(`Successfully updated subscription status to past_due for order: ${order.id}`);
        break;
      }
      default:
        log.debug(`Unhandled event type: ${event.type}`);
        break;
    }
  } catch (err) {
    log.error('Error processing webhook:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
