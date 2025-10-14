import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import DomainsClient from "./DomainsClient";

export default async function DomainsPage() {
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
      include: {
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
    });

    return <DomainsClient domains={domains} />;
  } catch (error) {
    console.error("[Domains] Failed to load domains", error);
    return <DomainsClient domains={[]} error="FAILED" />;
  }
}
