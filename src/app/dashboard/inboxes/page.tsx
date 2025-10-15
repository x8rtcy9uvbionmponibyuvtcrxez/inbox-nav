import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import InboxesClient from "./InboxesClient";

export default async function InboxesPage() {
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
        order: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return <InboxesClient inboxes={inboxes} />;
  } catch (error) {
    console.error("[Inboxes] Failed to load inboxes", error);
    return <InboxesClient inboxes={[]} error="FAILED" />;
  }
}
