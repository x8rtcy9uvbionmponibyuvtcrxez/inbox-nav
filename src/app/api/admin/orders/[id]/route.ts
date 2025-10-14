import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    // Check admin access
    const { userId } = await auth();
    const adminIds = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    
    if (!userId || !adminIds.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = new PrismaClient();
    await prisma.$connect();

    const order = await prisma.order.findUnique({
      where: { id: resolvedParams.id },
      include: {
        onboardingData: true,
        domains: true,
        inboxes: true,
      }
    });

    await prisma.$disconnect();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Convert dates to strings for JSON serialization
    const serializedOrder = {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      inboxes: order.inboxes.map(inbox => ({
        ...inbox,
        createdAt: inbox.createdAt.toISOString(),
        updatedAt: inbox.updatedAt.toISOString(),
      })),
      domains: order.domains.map(domain => ({
        ...domain,
        createdAt: domain.createdAt.toISOString(),
        updatedAt: domain.updatedAt.toISOString(),
      })),
    };

    return NextResponse.json(serializedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
