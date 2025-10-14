import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { GlobeAltIcon, ShieldCheckIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

type DomainRecord = Awaited<ReturnType<typeof prisma.domain.findMany>>[number] & {
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

export default async function DomainsPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-white/10 bg-white/10/5 px-10 py-16 text-center text-white/70">
        Sign in to review the domains under management.
      </div>
    );
  }

  let domains: DomainRecord[] = [];
  let error: string | null = null;

  try {
    domains = await prisma.domain.findMany({
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
    console.error("[Domains] Failed to load domains", err);
    error = err instanceof Error ? err.message : "Unknown error";
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10 px-10 py-16 text-center text-red-200">
        <h2 className="text-lg font-semibold text-red-200">We couldn’t load your domains.</h2>
        <p className="mt-3 max-w-md text-sm text-red-200/80">{error}</p>
        <button
          onClick={() => globalThis.location?.reload()}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-red-200/40 px-5 py-2 text-sm font-medium text-red-200 transition hover:border-red-200/60"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (!domains.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5/10 px-10 py-16 text-center text-white/70">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
          <GlobeAltIcon className="h-8 w-8 text-white/70" />
        </div>
        <h2 className="text-2xl font-semibold text-white">No domains yet</h2>
        <p className="mt-3 max-w-sm text-sm text-white/50">
          Once we fulfill your order, managed domains appear here with forwarding targets and inbox counts.
        </p>
        <Link
          href="/dashboard/products"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          <ShoppingCartIcon className="h-4 w-4" />
          Create inboxes
        </Link>
      </div>
    );
  }

  const liveDomains = domains.filter((domain) => domain.status === "LIVE").length;
  const warmingDomains = domains.filter((domain) => domain.status === "PENDING").length;
  const totalInboxSlots = domains.reduce((sum, domain) => sum + domain.inboxCount, 0);

  return (
    <div className="space-y-10 text-white">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Domain portfolio</h1>
          <p className="mt-2 max-w-xl text-sm text-white/50">
            Track every sending domain, forwarding target, and the inbox capacity we’ve associated with it.
          </p>
        </div>
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white"
        >
          <ShieldCheckIcon className="h-5 w-5" />
          Provision more domains
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.6)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Total domains</p>
          <p className="mt-3 text-3xl font-semibold text-white">{domains.length}</p>
          <p className="mt-1 text-xs text-white/40">Across all packages</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.6)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Live & reputationally safe</p>
          <p className="mt-3 text-3xl font-semibold text-white">{liveDomains}</p>
          <p className="mt-1 text-xs text-white/40">Ready to route campaigns</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.6)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Inbox slots attached</p>
          <p className="mt-3 text-3xl font-semibold text-white">{totalInboxSlots}</p>
          <p className="mt-1 text-xs text-white/40">Capacity across domains</p>
        </div>
      </div>

      {warmingDomains > 0 && (
        <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 px-6 py-4 text-sm text-amber-100">
          {warmingDomains} domain{warmingDomains === 1 ? "" : "s"} are still warming. We’ll notify you when their reputation is stable.
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_30px_60px_-45px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Domains under management</h2>
            <p className="text-xs text-white/50">Forwarding configuration, inbox allocation, and status at a glance.</p>
          </div>
          <button className="text-xs font-medium text-white/50 transition hover:text-white">
            Export roster
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5 text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">Domain</th>
                <th scope="col" className="px-6 py-3 text-left">Status</th>
                <th scope="col" className="px-6 py-3 text-left">Inbox count</th>
                <th scope="col" className="px-6 py-3 text-left">Forwarding URL</th>
                <th scope="col" className="px-6 py-3 text-left">Tags</th>
                <th scope="col" className="px-6 py-3 text-left">Order</th>
                <th scope="col" className="px-6 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {domains.map((domain) => (
                <tr key={domain.id} className="transition hover:bg-white/[0.04]">
                  <td className="px-6 py-4 font-mono text-xs text-white/80">{domain.domain}</td>
                  <td className="px-6 py-4">
                    <StatusPill status={domain.status} />
                  </td>
                  <td className="px-6 py-4 text-white/70">{domain.inboxCount}</td>
                  <td className="px-6 py-4 text-white/60">{domain.forwardingUrl || "—"}</td>
                  <td className="px-6 py-4 text-white/60">
                    {domain.tags.length ? domain.tags.slice(0, 3).join(", ") : <span className="text-white/30">—</span>}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-white/50">{domain.order.id.slice(0, 8)}…</td>
                  <td className="px-6 py-4 text-white/60">{formatDate(domain.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
