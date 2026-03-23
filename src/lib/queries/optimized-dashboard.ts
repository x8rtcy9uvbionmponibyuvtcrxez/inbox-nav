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

const ORDER_SELECT = {
  id: true,
  status: true,
  productType: true,
  quantity: true,
  totalAmount: true,
  subscriptionStatus: true,
  stripeSubscriptionId: true,
  stripeSessionId: true,
  cancelledAt: true,
  businessName: true,
  createdAt: true,
  inboxes: {
    select: {
      id: true,
      email: true,
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
} as const;

export async function getDashboardData(userId: string) {
  // Use Promise.all for parallel queries instead of sequential
  const [orders, pendingOrders, inboxesCount, domainsCount, monthlySpend] = await Promise.all([
    // Orders with completed onboarding
    prisma.onboardingData.findMany({
      where: { clerkUserId: userId },
      select: {
        id: true,
        createdAt: true,
        businessType: true,
        website: true,
        domainPreferences: true,
        personas: true,
        domainRegistrar: true,
        registrarUsername: true,
        registrarPassword: true,
        domainSource: true,
        providedDomains: true,
        inboxesPerDomain: true,
        calculatedDomainCount: true,
        specialRequirements: true,
        order: { select: ORDER_SELECT },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),

    // Orders WITHOUT onboarding data (paid but never completed onboarding)
    prisma.order.findMany({
      where: {
        clerkUserId: userId,
        onboardingData: null,
        status: { not: 'CANCELLED' },
      },
      select: ORDER_SELECT,
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    
    // Count LIVE and PENDING inboxes (excluding DELETED and CANCELLED)
    prisma.inbox.count({
      where: {
        status: {
          in: ['LIVE', 'PENDING']
        },
        order: {
          onboardingData: {
            clerkUserId: userId,
          },
        },
      },
    }),
    
    // Count LIVE and PENDING domains (excluding DELETED, DECOMMISSIONED, and CANCELLED)
    prisma.domain.count({
      where: {
        status: {
          in: ['LIVE', 'PENDING']
        },
        order: {
          onboardingData: {
            clerkUserId: userId,
          },
        },
      },
    }),
    
    // Calculate monthly spend as sum of all CURRENTLY ACTIVE subscriptions
    // Exclude any cancelled orders (status CANCELLED or subscriptionStatus indicates cancellation)
    prisma.order.aggregate({
      where: {
        onboardingData: {
          clerkUserId: userId,
        },
        status: {
          not: 'CANCELLED',
        },
        subscriptionStatus: {
          notIn: ['cancelled', 'canceled', 'cancel_at_period_end'],
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
  ]);

  // Convert pending orders (no onboarding) into the same shape as onboarded orders
  const pendingAsOnboarded = pendingOrders.map((order) => ({
    id: `pending-${order.id}`,
    createdAt: order.createdAt,
    businessType: order.businessName || null,
    website: null,
    domainPreferences: null,
    personas: null,
    domainRegistrar: null,
    registrarUsername: null,
    registrarPassword: null,
    domainSource: null,
    providedDomains: null,
    inboxesPerDomain: null,
    calculatedDomainCount: null,
    specialRequirements: null,
    needsOnboarding: true,
    order,
  }));

  // Merge and sort by date descending
  const allOrders = [...orders, ...pendingAsOnboarded].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    orders: allOrders as OrderWithRelations[],
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
