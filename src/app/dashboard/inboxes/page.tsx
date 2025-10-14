import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { InboxIcon, SparklesIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

type InboxRecord = {
  id: string;
  email: string;
  personaName: string;
  status: string;
  tags: string[];
  businessName: string | null;
  forwardingDomain: string | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
  order: {
    id: string;
    productType: string;
    quantity: number;
    status: string;
  };
};

const STATUS_COLORS: Record<string, string> = {
  LIVE: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  PENDING: "bg-amber-400/25 text-amber-100 border border-amber-300/40",
  DELETED: "bg-red-500/15 text-red-300 border border-red-500/30",
  DEFAULT: "bg-white/10 text-white/50 border border-white/10",
};

function StatusPill({ status }: { status: string }) {
  const pillClass = STATUS_COLORS[status.toUpperCase()] ?? STATUS_COLORS.DEFAULT;
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${pillClass}`}>
      {status.toLowerCase()}
    </span>
  );
}

function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function InboxesPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-white/10 bg-white/10/5 px-10 py-16 text-center text-white/70">
        Sign in to view your inbox inventory.
      </div>
    );
  }

  let inboxes: InboxRecord[] = [];
  let error: string | null = null;

  try {
    inboxes = await prisma.inbox.findMany({
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (err) {
    console.error("[Inboxes] Failed to load inboxes", err);
    error = err instanceof Error ? err.message : "Unknown error";
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10 px-10 py-16 text-center text-red-200">
        <h2 className="text-lg font-semibold text-red-200">We couldn’t load your inboxes.</h2>
        <p className="mt-3 max-w-md text-sm text-red-200/80">{error}</p>
        <button
          onClick={() => globalThis.location?.reload()}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-red-200/40 px-5 py-2 text-sm font-medium text-red-200 transition hover:border-red-200/60"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!inboxes.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5/10 px-10 py-16 text-center text-white/70">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
          <InboxIcon className="h-8 w-8 text-white/70" />
        </div>
        <h2 className="text-2xl font-semibold text-white">No inboxes yet</h2>
        <p className="mt-3 max-w-sm text-sm text-white/50">
          Your inboxes appear here once fulfillment is complete. Launch a package to start building out your fleet.
        </p>
        <Link
          href="/dashboard/products"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          <SparklesIcon className="h-4 w-4" />
          Create inboxes
        </Link>
      </div>
    );
  }

  const inboxCount = inboxes.length;
  const liveCount = inboxes.filter((inbox) => inbox.status === "LIVE").length;
  const pendingCount = inboxes.filter((inbox) => inbox.status === "PENDING").length;
  const uniqueDomains = new Set<string>();
  inboxes.forEach((inbox) => {
    if (inbox.forwardingDomain) uniqueDomains.add(inbox.forwardingDomain);
  });

  return (
    <div className="space-y-10 text-white">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Inbox inventory</h1>
          <p className="mt-2 max-w-xl text-sm text-white/50">
            Every sender you’ve provisioned, plus their current delivery status, tags, and linked orders.
          </p>
        </div>
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white"
        >
          <ShoppingCartIcon className="h-5 w-5" />
          Add more inboxes
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.6)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Total inboxes</p>
          <p className="mt-3 text-3xl font-semibold text-white">{inboxCount}</p>
          <p className="mt-1 text-xs text-white/40">Across all active orders</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.6)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Live senders</p>
          <p className="mt-3 text-3xl font-semibold text-white">{liveCount}</p>
          <p className="mt-1 text-xs text-white/40">Ready for campaigns</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.6)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Domains forwarding</p>
          <p className="mt-3 text-3xl font-semibold text-white">{uniqueDomains.size}</p>
          <p className="mt-1 text-xs text-white/40">Connected forwarding hosts</p>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 px-6 py-4 text-sm text-amber-100">
          {pendingCount} inbox{pendingCount === 1 ? "" : "es"} are still warming. We’ll move them to “Live” automatically once the reputation is stable.
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_30px_60px_-45px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Inbox roster</h2>
            <p className="text-xs text-white/50">Export tags, passwords, and domains for this workspace.</p>
          </div>
          <button className="text-xs font-medium text-white/50 transition hover:text-white">
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5 text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">Email</th>
                <th scope="col" className="px-6 py-3 text-left">Persona</th>
                <th scope="col" className="px-6 py-3 text-left">Status</th>
                <th scope="col" className="px-6 py-3 text-left">Tags</th>
                <th scope="col" className="px-6 py-3 text-left">Business</th>
                <th scope="col" className="px-6 py-3 text-left">Forwarding</th>
                <th scope="col" className="px-6 py-3 text-left">Order</th>
                <th scope="col" className="px-6 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inboxes.map((inbox) => (
                <tr key={inbox.id} className="transition hover:bg-white/[0.04]">
                  <td className="px-6 py-4 font-mono text-xs text-white/80">{inbox.email}</td>
                  <td className="px-6 py-4 text-white/70">{inbox.personaName}</td>
                  <td className="px-6 py-4">
                    <StatusPill status={inbox.status} />
                  </td>
                  <td className="px-6 py-4 text-white/60">
                    {inbox.tags.length ? inbox.tags.slice(0, 3).join(", ") : <span className="text-white/30">—</span>}
                  </td>
                  <td className="px-6 py-4 text-white/70">
                    {inbox.businessName || "—"}
                  </td>
                  <td className="px-6 py-4 text-white/60">{inbox.forwardingDomain || "—"}</td>
                  <td className="px-6 py-4 font-mono text-xs text-white/50">{inbox.order.id.slice(0, 8)}…</td>
                  <td className="px-6 py-4 text-white/60">{formatDate(inbox.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
