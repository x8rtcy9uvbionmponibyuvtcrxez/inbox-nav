import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import PageTransition from "@/components/animations/PageTransition";

type OrderWithRelations = {
  id: string;
  createdAt: Date;
  businessType?: string | null;
  website?: string | null;
  order: {
    id: string;
    productType: string;
    quantity: number;
    totalAmount: number;
    createdAt: Date;
    status?: string | null;
    subscriptionStatus?: string | null;
    stripeSubscriptionId?: string | null;
    cancelledAt?: Date | null;
    cancellationReason?: string | null;
    inboxes: { id: string; forwardingDomain?: string }[];
    domains: { id: string; domain: string; forwardingUrl?: string }[];
  };
};

export default async function Dashboard() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-white/60">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  let orders: OrderWithRelations[] = [];
  let fetchError: string | null = null;
  let totalInboxes = 0;
  let totalDomains = 0;
  let totalMonthlySpend = 0;

  try {
    console.log('Dashboard query for user:', user.id);
    
    // Optimized query with parallel data fetching
    const [ordersData, inboxCount, domainCount, totalSpend] = await Promise.all([
      prisma.onboardingData.findMany({
        where: { clerkUserId: user.id },
        select: {
          id: true,
          createdAt: true,
          businessType: true,
          website: true,
          order: {
            select: {
              id: true,
              productType: true,
              quantity: true,
              totalAmount: true,
              createdAt: true,
              status: true,
              subscriptionStatus: true,
              stripeSubscriptionId: true,
              cancelledAt: true,
              cancellationReason: true,
              inboxes: {
                select: { id: true }
              },
              domains: {
                select: { id: true, domain: true }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 10, // Limit to recent orders for dashboard
      }),
      // Get total inbox count efficiently
      prisma.order.aggregate({
        where: {
          onboardingData: {
            clerkUserId: user.id
          }
        },
        _sum: {
          quantity: true
        }
      }),
      // Get unique domain count
      prisma.domain.findMany({
        where: {
          order: {
            onboardingData: {
              clerkUserId: user.id
            }
          }
        },
        select: { domain: true },
        distinct: ['domain']
      }),
      // Get total spend
      prisma.order.aggregate({
        where: {
          onboardingData: {
            clerkUserId: user.id
          }
        },
        _sum: {
          totalAmount: true
        }
      })
    ]);

    orders = ordersData;
    console.log('Dashboard orders data:', ordersData.map(o => ({
      id: o.id,
      orderId: o.order.id,
      status: o.order.status,
      subscriptionStatus: o.order.subscriptionStatus,
      stripeSubscriptionId: o.order.stripeSubscriptionId
    })));
    
    // Use optimized data from parallel queries
    totalInboxes = inboxCount._sum.quantity || 0;
    totalDomains = domainCount.length;
    totalMonthlySpend = totalSpend._sum.totalAmount || 0;
  } catch (error) {
    console.error("[Dashboard] Failed to load orders", error);
    fetchError = error instanceof Error ? error.message : "Unknown error occurred";
    orders = [];
  }

  const displayName =
    (user.firstName && user.firstName.trim()) ||
    (user.fullName ? user.fullName.split(" ")[0] : undefined) ||
    user.emailAddresses?.[0]?.emailAddress ||
    "there";

  return (
    <PageTransition>
      <DashboardClient
        orders={orders}
        displayName={displayName}
        totalInboxes={totalInboxes}
        totalDomains={totalDomains}
        totalMonthlySpend={totalMonthlySpend}
        fetchError={fetchError}
      />
    </PageTransition>
  );
}
