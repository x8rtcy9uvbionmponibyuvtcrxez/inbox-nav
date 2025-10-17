import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';
import { createNotification, createBillingEvent } from '@/lib/notification-helpers';
import { notifyPartialCancellation } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, inboxIds, reason } = await request.json();

    if (!orderId || !inboxIds || !Array.isArray(inboxIds) || inboxIds.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get order and verify ownership
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId, 
        clerkUserId: userId,
        stripeSubscriptionId: { not: null },
      },
      include: {
        inboxes: {
          where: { isActive: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found or not accessible' }, { status: 404 });
    }

    // Verify inboxes belong to this order and are active
    const inboxesToCancel = await prisma.inbox.findMany({
      where: {
        id: { in: inboxIds },
        orderId: orderId,
        isActive: true,
      },
    });

    if (inboxesToCancel.length !== inboxIds.length) {
      return NextResponse.json({ error: 'Some inboxes not found or already cancelled' }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // Calculate new quantity
    const newQuantity = order.activeInboxCount - inboxIds.length;
    if (newQuantity < 0) {
      return NextResponse.json({ error: 'Cannot cancel more inboxes than active' }, { status: 400 });
    }

    // Update Stripe subscription quantity
    await stripe.subscriptions.update(order.stripeSubscriptionId!, {
      items: [{
        id: (await stripe.subscriptions.retrieve(order.stripeSubscriptionId!)).items.data[0].id,
        quantity: newQuantity,
      }],
      proration_behavior: 'create_prorations',
    });

    // Update database
    await prisma.$transaction(async (tx) => {
      // Mark inboxes as cancelled
      await tx.inbox.updateMany({
        where: { id: { in: inboxIds } },
        data: {
          isActive: false,
          cancelledAt: new Date(),
          cancelReason: reason || 'User initiated partial cancellation',
        },
      });

      // Update order active count
      await tx.order.update({
        where: { id: orderId },
        data: { activeInboxCount: newQuantity },
      });
    });

    // Create billing event
    await createBillingEvent(
      orderId,
      'partial_cancellation',
      undefined,
      `Cancelled ${inboxIds.length} inboxes`,
      {
        cancelledInboxIds: inboxIds,
        newQuantity,
        reason,
      }
    );

    // Get user info for notification
    const user = await prisma.onboardingData.findFirst({
      where: { orderId },
      select: { clerkUserId: true },
    });

    if (user) {
      // Create in-app notification
      await createNotification({
        clerkUserId: user.clerkUserId,
        type: 'PARTIAL_CANCELLATION',
        title: 'Inboxes Cancelled',
        message: `Successfully cancelled ${inboxIds.length} inboxes. Changes take effect next billing cycle.`,
        orderId,
        actionUrl: `/dashboard/inboxes`,
      });

      // Send email notification
      const cancelledEmails = inboxesToCancel.map(inbox => inbox.email);
      const remainingCount = newQuantity;
      const newMonthlyCost = newQuantity * (order.totalAmount / order.quantity); // Approximate

      await notifyPartialCancellation(
        order,
        { id: user.clerkUserId, email: '', firstName: '', lastName: '' }, // Will be filled by notification function
        cancelledEmails,
        remainingCount,
        newMonthlyCost
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Partial cancellation successful',
      newQuantity,
      cancelledCount: inboxIds.length,
    });
  } catch (error) {
    console.error('[Partial Cancel] error:', error);
    return NextResponse.json({ error: 'Failed to process partial cancellation' }, { status: 500 });
  }
}
