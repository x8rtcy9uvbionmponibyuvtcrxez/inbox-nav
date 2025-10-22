import { prisma } from '@/lib/prisma';
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
        order: {
          select: {
            id: true,
            status: true,
            productType: true,
            quantity: true,
            totalAmount: true,
            subscriptionStatus: true,
            inboxes: {
              select: {
                id: true,
                status: true,
              },
            },
            domains: {
              select: {
                id: true,
                domain: true,
                status: true,
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
    
    // Calculate monthly spend with aggregation
    prisma.order.aggregate({
      where: {
        onboardingData: {
          clerkUserId: userId,
        },
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
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

// Cached version with Redis-like caching
export async function getCachedDashboardData(userId: string) {
  const cacheKey = `dashboard:${userId}`;
  
  // In a real implementation, you'd check Redis here
  // For now, we'll use the optimized query
  return getDashboardData(userId);
}
