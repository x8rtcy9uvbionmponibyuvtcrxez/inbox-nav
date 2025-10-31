import { prisma } from '@/lib/prisma';
import { getCachedData } from '@/lib/redis';
import type { Prisma } from '@prisma/client';

type OrderWithRelations = Prisma.OnboardingDataGetPayload<{
  include: {
    order: {
      include: {
        inboxes: true;
        domains: true;
      };
    };
  };
}>;

export async function getDashboardData(userId: string) {
  // Use Promise.all for parallel queries instead of sequential
  const [orders, inboxesCount, domainsCount, monthlySpend] = await Promise.all([
    // Optimized orders query with selective fields
    prisma.onboardingData.findMany({
      where: { clerkUserId: userId },
      select: {
        id: true,
        createdAt: true,
        businessType: true,
        website: true,
        order: {
          select: {
            id: true,
            status: true,
            productType: true,
            quantity: true,
            totalAmount: true,
            subscriptionStatus: true,
            businessName: true,
            inboxes: {
              select: {
                id: true,
                status: true,
                businessName: true,
                forwardingDomain: true,
              },
            },
            domains: {
              select: {
                id: true,
                domain: true,
                status: true,
                businessName: true,
                forwardingUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to recent 50 orders for performance
    }),
    
    // Count inboxes directly
    prisma.inbox.count({
      where: {
        order: {
          onboardingData: {
            clerkUserId: userId,
          },
        },
      },
    }),
    
    // Count unique domains
    prisma.domain.count({
      where: {
        order: {
          onboardingData: {
            clerkUserId: userId,
          },
        },
      },
    }),
    
    // Calculate monthly spend as sum of all CURRENTLY ACTIVE subscriptions
    // Exclude ANY cancelled orders (status CANCELLED OR subscriptionStatus indicates cancellation)
    prisma.order.aggregate({
      where: {
        onboardingData: {
          clerkUserId: userId,
        },
        // Exclude orders where status is CANCELLED OR subscriptionStatus indicates cancellation
        AND: [
          {
            status: {
              not: 'CANCELLED',
            },
          },
          {
            OR: [
              { subscriptionStatus: null },
              { subscriptionStatus: { notIn: ['cancelled', 'canceled', 'cancel_at_period_end'] } }
            ]
          }
        ],
      },
      _sum: {
        totalAmount: true,
      },
    }),
  ]);

  return {
    orders: orders as OrderWithRelations[],
    totalInboxes: inboxesCount,
    totalDomains: domainsCount,
    totalMonthlySpend: monthlySpend._sum.totalAmount || 0,
  };
}

// Cached version with Redis caching
export async function getCachedDashboardData(userId: string) {
  const cacheKey = `dashboard:${userId}`;
  
  return await getCachedData(
    cacheKey,
    () => getDashboardData(userId),
    60 // 1 minute cache to reflect plan changes quickly
  );
}
