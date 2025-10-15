import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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

    // Using shared Prisma instance

    const order = await prisma.order.findUnique({
      where: { id: resolvedParams.id },
      include: {
        onboardingData: true,
        domains: true,
        inboxes: true,
      }
    });

    // Prisma connection managed by singleton

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let clerkUserName: string | null = null;
    let clerkUserEmail: string | null = null;
    if (order.clerkUserId) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(order.clerkUserId);
        clerkUserName =
          user.fullName?.trim() ||
          [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
          user.username ||
          null;
        const primaryEmailId = user.primaryEmailAddressId;
        const primaryEmail = user.emailAddresses?.find((addr) => addr.id === primaryEmailId);
        clerkUserEmail =
          primaryEmail?.emailAddress ??
          user.emailAddresses?.[0]?.emailAddress ??
          null;
      } catch (lookupError) {
        console.warn('[Admin Order] Failed to fetch Clerk user metadata', lookupError);
      }
    }

    // Convert dates to strings for JSON serialization
    const serializedOrder = {
      ...order,
      clerkUserName,
      clerkUserEmail,
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
