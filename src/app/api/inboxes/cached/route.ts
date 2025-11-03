import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getCachedData } from '@/lib/redis';
import { revealSecret } from '@/lib/encryption';

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

    const inboxes = await getCachedData(
      `inboxes:${userId}`,
      async () => {
        return await prisma.inbox.findMany({
          where: {
            order: {
              clerkUserId: userId,
            },
          },
          select: {
            id: true,
            orderId: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
            espPlatform: true,
            tags: true,
            businessName: true,
            forwardingDomain: true,
            password: true,
            fulfilledAt: true,
            createdAt: true,
            updatedAt: true,
            order: {
              select: {
                id: true,
                clerkUserId: true,
                productType: true,
                quantity: true,
                totalAmount: true,
                status: true,
                stripeSessionId: true,
                stripeCustomerId: true,
                stripeSubscriptionId: true,
                subscriptionStatus: true,
                cancelledAt: true,
                cancellationReason: true,
                businessName: true,
                externalId: true,
                createdAt: true,
                updatedAt: true,
              }
            }
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 100,
        });
      },
      300 // 5 minutes cache
    );

    // Decrypt passwords before returning
    const inboxesWithDecryptedPasswords = inboxes.map((inbox) => ({
      ...inbox,
      password: inbox.password ? revealSecret(inbox.password) : null,
    }));

    return NextResponse.json(inboxesWithDecryptedPasswords, {
      headers: {
        'Cache-Control': 'private, max-age=300', // 5 minutes
        'Last-Modified': lastModified.toUTCString(),
        'ETag': `"inboxes-${userId}-${lastModified.getTime()}"`,
      }
    });
  } catch (error) {
    console.error('[Cached Inboxes] Failed to load inboxes', error);
    return NextResponse.json(
      { error: 'Failed to load inboxes' },
      { status: 500 }
    );
  }
}
