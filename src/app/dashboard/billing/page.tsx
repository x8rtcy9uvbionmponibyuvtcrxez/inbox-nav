import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import BillingClient from "./BillingClient";

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    inboxes: {
      where: { isActive: true };
    };
    domains: true;
  };
}>;

export default async function BillingPage() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-white/60">Please sign in to view your billing.</p>
      </div>
    );
  }

  let orders: OrderWithRelations[] = [];
  let fetchError: string | null = null;

  try {
    orders = await prisma.order.findMany({
      where: { 
        clerkUserId: user.id,
        stripeSubscriptionId: { not: null },
      },
      include: {
        inboxes: {
          where: { isActive: true },
        },
        domains: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[Billing] Failed to load orders", error);
    fetchError = error instanceof Error ? error.message : "Unknown error occurred";
    orders = [];
  }

  const displayName =
    (user.firstName && user.firstName.trim()) ||
    (user.fullName ? user.fullName.split(" ")[0] : undefined) ||
    user.emailAddresses?.[0]?.emailAddress ||
    "there";

  return (
    <BillingClient
      orders={orders}
      displayName={displayName}
      fetchError={fetchError}
    />
  );
}
