import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import InboxesClient from "./InboxesClient";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons";
import { revealSecret } from "@/lib/encryption";

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

    console.log('[Inboxes] Sample inbox before decryption:', inboxes[0]?.email, 'password:', inboxes[0]?.password);

    // Decrypt passwords before passing to client
    const inboxesWithDecryptedPasswords = inboxes.map((inbox) => ({
      ...inbox,
      password: inbox.password ? revealSecret(inbox.password) : null,
    }));

    console.log('[Inboxes] Sample inbox after decryption:', inboxesWithDecryptedPasswords[0]?.email, 'password:', inboxesWithDecryptedPasswords[0]?.password);

    return <InboxesClient inboxes={inboxesWithDecryptedPasswords} />;
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
