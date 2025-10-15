import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import DomainsClient from "./DomainsClient";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons";

async function DomainsContent() {
  const { userId } = await auth();

  if (!userId) {
    return <DomainsClient domains={[]} error="UNAUTHORIZED" />;
  }

  try {
    const domains = await prisma.domain.findMany({
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
      take: 50, // Limit to 50 most recent domains
    });

    return <DomainsClient domains={domains} />;
  } catch (error) {
    console.error("[Domains] Failed to load domains", error);
    return <DomainsClient domains={[]} error="FAILED" />;
  }
}

export default function DomainsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <DomainsContent />
    </Suspense>
  );
}
