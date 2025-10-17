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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const notifications = await prisma.notification.findMany({
      where: { clerkUserId: userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        order: {
          select: {
            id: true,
            productType: true,
            businessName: true,
          },
        },
      },
    });

    const totalCount = await prisma.notification.count({
      where: { clerkUserId: userId },
    });

    const unreadCount = await prisma.notification.count({
      where: { 
        clerkUserId: userId,
        isRead: false,
      },
    });

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error('[Notifications] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId, markAllAsRead } = await request.json();

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: { 
          clerkUserId: userId,
          isRead: false,
        },
        data: { isRead: true },
      });
    } else if (notificationId) {
      await prisma.notification.updateMany({
        where: { 
          id: notificationId,
          clerkUserId: userId,
        },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Notifications] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (notificationId) {
      await prisma.notification.deleteMany({
        where: { 
          id: notificationId,
          clerkUserId: userId,
        },
      });
    } else {
      // Delete all read notifications
      await prisma.notification.deleteMany({
        where: { 
          clerkUserId: userId,
          isRead: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Notifications] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 });
  }
}
