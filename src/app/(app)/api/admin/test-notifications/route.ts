import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { notifyOrderCreated } from '@/lib/notifications';

export async function POST() {
  const { userId } = await auth();
  const adminIds = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

  if (!userId || !adminIds.includes(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const testOrders = [
    {
      id: `test-${Date.now()}-1`,
      productType: 'RESELLER',
      quantity: 25,
      totalAmount: 7500, // $75.00
      clerkUserId: userId,
      createdAt: new Date(),
      businessName: 'Test Order - Acme Corp',
    },
    {
      id: `test-${Date.now()}-2`,
      productType: 'EDU',
      quantity: 50,
      totalAmount: 7500, // $75.00
      clerkUserId: userId,
      createdAt: new Date(),
      businessName: 'Test Order - ShipTurtle Demo',
    },
  ];

  const testUser = {
    id: userId,
    email: 'test@inboxnavigator.com',
    firstName: 'Test',
    lastName: 'Notification',
  };

  const results = [];
  for (const order of testOrders) {
    try {
      await notifyOrderCreated(order, testUser);
      results.push({ orderId: order.id, status: 'sent' });
    } catch (error) {
      results.push({ orderId: order.id, status: 'failed', error: String(error) });
    }
  }

  return NextResponse.json({ message: 'Test notifications sent', results });
}
