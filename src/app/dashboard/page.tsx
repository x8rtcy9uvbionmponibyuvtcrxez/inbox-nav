import { currentUser } from "@clerk/nextjs/server";
import { getCachedDashboardData } from "@/lib/queries/optimized-dashboard";
import DashboardClient from "./DashboardClient";

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
    subscriptionStatus: string;
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
    
    // Use optimized query function with caching
    const { orders: ordersData, totalInboxes: inboxCount, totalDomains: domainCount, totalMonthlySpend: totalSpend } = await getCachedDashboardData(user.id);

    orders = ordersData;
    totalInboxes = inboxCount;
    totalDomains = domainCount;
    totalMonthlySpend = totalSpend;
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
    <DashboardClient
      orders={orders}
      displayName={displayName}
      totalInboxes={totalInboxes}
      totalDomains={totalDomains}
      totalMonthlySpend={totalMonthlySpend}
      fetchError={fetchError}
    />
  );
}
