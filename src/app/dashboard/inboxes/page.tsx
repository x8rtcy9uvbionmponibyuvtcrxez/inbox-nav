import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import InboxesClient from "./InboxesClient";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons";

async function InboxesContent() {
  const { userId } = await auth();

  if (!userId) {
    return <InboxesClient inboxes={[]} error="UNAUTHORIZED" />;
  }

  try {
    const inboxes = await prisma.inbox.findMany({
      where: {
        order: {
          clerkUserId: userId,
        },
      },
      include: {
        order: true
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit to 100 most recent inboxes
    });

    return <InboxesClient inboxes={inboxes} />;
  } catch (error) {
    console.error("[Inboxes] Failed to load inboxes", error);
    return <InboxesClient inboxes={[]} error="FAILED" />;
  }
}

export default function InboxesPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <InboxesContent />
    </Suspense>
  );
}
