import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Verify order ownership
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId, 
        clerkUserId: userId,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get billing events for this order
    const billingEvents = await prisma.billingEvent.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    // Get notifications related to this order
    const notifications = await prisma.notification.findMany({
      where: { 
        orderId,
        clerkUserId: userId,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Combine and format events
    const history = [
      ...billingEvents.map(event => ({
        id: event.id,
        type: 'billing_event',
        eventType: event.eventType,
        title: getEventTitle(event.eventType),
        description: event.description || '',
        amount: event.amount,
        metadata: event.metadata,
        createdAt: event.createdAt,
      })),
      ...notifications.map(notification => ({
        id: notification.id,
        type: 'notification',
        eventType: notification.type,
        title: notification.title,
        description: notification.message,
        amount: null,
        metadata: null,
        createdAt: notification.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ history });
  } catch (error) {
    console.error('[Subscription History] error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription history' }, { status: 500 });
  }
}

function getEventTitle(eventType: string): string {
  switch (eventType) {
    case 'payment_succeeded':
      return 'Payment Received';
    case 'partial_cancellation':
      return 'Inboxes Cancelled';
    case 'subscription_updated':
      return 'Subscription Updated';
    case 'subscription_cancelled':
      return 'Subscription Cancelled';
    default:
      return 'Billing Event';
  }
}
