import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getCachedData } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if we have a cache header
    const ifModifiedSince = request.headers.get('if-modified-since');
    const lastModified = new Date();
    
    if (ifModifiedSince) {
      const ifModifiedSinceDate = new Date(ifModifiedSince);
      // If data is less than 1 minute old, return 304
      if (lastModified.getTime() - ifModifiedSinceDate.getTime() < 60000) {
        return new NextResponse(null, { status: 304 });
      }
    }

    const domains = await getCachedData(
      `domains:${userId}`,
      async () => {
        return await prisma.domain.findMany({
          where: {
            order: {
              clerkUserId: userId,
            },
          },
          select: {
            id: true,
            orderId: true,
            domain: true,
            status: true,
            tags: true,
            inboxCount: true,
            forwardingUrl: true,
            businessName: true,
            fulfilledAt: true,
            createdAt: true,
            updatedAt: true,
            order: {
              select: {
                id: true,
                productType: true,
                quantity: true,
                status: true,
                subscriptionStatus: true,
                cancelledAt: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
        });
      },
      300 // 5 minutes cache
    );

    return NextResponse.json(domains, {
      headers: {
        'Cache-Control': 'private, max-age=300', // 5 minutes
        'Last-Modified': lastModified.toUTCString(),
        'ETag': `"domains-${userId}-${lastModified.getTime()}"`,
      }
    });
  } catch (error) {
    console.error('[Cached Domains] Failed to load domains', error);
    return NextResponse.json(
      { error: 'Failed to load domains' },
      { status: 500 }
    );
  }
}
