import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import DashboardClient from "./DashboardClient";

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

  try {
    orders = await prisma.onboardingData.findMany({
      where: { clerkUserId: user.id },
      include: {
        order: {
          include: {
            inboxes: true,
            domains: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[Dashboard] Failed to load orders", error);
    fetchError = error instanceof Error ? error.message : "Unknown error occurred";
    orders = [];
  }

  const totalInboxes = orders.reduce((sum, record) => {
    const order = record.order;
    if (!order) return sum;
    if (order.inboxes?.length) return sum + order.inboxes.length;
    return sum + (order.quantity ?? 0);
  }, 0);

  const domainSet = new Set<string>();
  orders.forEach((record) => {
    record.order?.domains?.forEach((domain) => domainSet.add(domain.domain));
  });
  const totalDomains = domainSet.size;

  const totalMonthlySpend = orders.reduce((sum, record) => {
    const amount = record.order?.totalAmount ?? 0;
    return sum + amount;
  }, 0);

  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : user.fullName || user.emailAddresses?.[0]?.emailAddress || "there";

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
