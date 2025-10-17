import { prisma } from './prisma';

export interface CreateNotificationData {
  clerkUserId: string;
  type: 'ORDER_RECEIVED' | 'ORDER_FULFILLED' | 'SUBSCRIPTION_CANCELLED' | 'PARTIAL_CANCELLATION';
  title: string;
  message: string;
  orderId?: string;
  actionUrl?: string;
}

export async function createNotification(data: CreateNotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        clerkUserId: data.clerkUserId,
        orderId: data.orderId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
      },
    });

    return notification;
  } catch (error) {
    console.error('[Notification] Failed to create notification:', error);
    throw error;
  }
}

export async function createBillingEvent(orderId: string, eventType: string, amount?: number, description?: string, metadata?: Record<string, unknown>) {
  try {
    const billingEvent = await prisma.billingEvent.create({
      data: {
        orderId,
        eventType,
        amount,
        description,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: (metadata || {}) as any,
      },
    });

    return billingEvent;
  } catch (error) {
    console.error('[BillingEvent] Failed to create billing event:', error);
    throw error;
  }
}
