import Link from "next/link";
import { prisma } from '@/lib/prisma';
import { auth } from "@clerk/nextjs/server";
import type { Prisma } from "@prisma/client";

type StatusTone = {
  bg: string;
  ring: string;
  glow: string;
  label: string;
};

const STATUS_THEME: Record<string, StatusTone> = {
  FULFILLED: {
    bg: "from-emerald-400/20 to-emerald-500/10",
    ring: "ring-emerald-400/30",
    glow: "shadow-[0_0_25px_rgba(52,211,153,0.25)]",
    label: "Fulfilled",
  },
  PAID: {
    bg: "from-sky-400/20 to-sky-500/10",
    ring: "ring-sky-400/30",
    glow: "shadow-[0_0_25px_rgba(56,189,248,0.25)]",
    label: "Paid",
  },
  PENDING: {
    bg: "from-amber-400/20 to-amber-500/10",
    ring: "ring-amber-400/30",
    glow: "shadow-[0_0_25px_rgba(251,191,36,0.25)]",
    label: "Pending",
  },
  PENDING_DOMAIN_PURCHASE: {
    bg: "from-purple-400/20 to-purple-500/10",
    ring: "ring-purple-400/30",
    glow: "shadow-[0_0_25px_rgba(192,132,252,0.25)]",
    label: "Domain Purchase",
  },
  CANCELLED: {
    bg: "from-rose-500/30 to-rose-500/10",
    ring: "ring-rose-400/30",
    glow: "shadow-[0_0_25px_rgba(244,114,182,0.25)]",
    label: "Cancelled",
  },
};

function prettyStatus(value: string) {
  const upper = value.toUpperCase();
  return STATUS_THEME[upper]?.label ?? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatusBadge({ status }: { status: string }) {
  const key = status.toUpperCase();
  const theme = STATUS_THEME[key] ?? {
    bg: "from-slate-400/20 to-slate-500/10",
    ring: "ring-slate-400/30",
    glow: "shadow-[0_0_25px_rgba(148,163,184,0.25)]",
    label: prettyStatus(status),
  };

  return (
    <span
      className={`relative inline-flex items-center gap-2 rounded-full bg-gradient-to-br px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/90 ring-1 ${theme.bg} ${theme.ring} ${theme.glow} transition`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
      {prettyStatus(status)}
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

const STATUS_FILTERS = ["ALL", "PENDING", "PENDING_DOMAIN_PURCHASE", "PAID", "FULFILLED", "CANCELLED"];

function buildUrl(status: string, q: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  return `/admin/orders?${params.toString()}`;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; q?: string }>;
}) {
  const { userId } = await auth();
  const adminIds = (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!userId || !adminIds.includes(userId)) {
    return <div className="mt-20 text-center text-red-400">You don&rsquo;t have access to this dashboard.</div>;
  }

  const resolvedSearchParams = await searchParams;
  const currentStatus = resolvedSearchParams?.status || "ALL";
  const q = resolvedSearchParams?.q || "";

  // Using shared Prisma instance

  const where: Record<string, unknown> = {};
  if (currentStatus && currentStatus !== "ALL") {
    where.status = currentStatus;
  }
  if (q) {
    where.clerkUserId = { contains: q, mode: "insensitive" };
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      onboardingData: true,
      inboxes: { select: { id: true, status: true } },
      domains: { select: { id: true, status: true } },
    },
  });

  // Prisma connection managed by singleton

  const totalInboxes = orders.reduce((sum, order) => sum + (order.inboxes?.length ?? 0), 0);
  const totalDomains = orders.reduce((sum, order) => sum + (order.domains?.length ?? 0), 0);
  const fulfilled = orders.filter((o) => o.status === "FULFILLED").length;
  const pending = orders.filter((o) => o.status.includes("PENDING")).length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-80 w-80 animate-pulse rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-96 w-96 animate-[pulse_8s_ease-in-out_infinite] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
              Control Center
            </span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Admin Orders Dashboard</h1>
            <p className="mt-3 max-w-xl text-sm text-white/50">
              Monitor incoming orders, fulfillment velocity, and subscription health at a glance. Tap into the filters
              or search for a specific customer to dive deeper.
            </p>
          </div>
          <div className="flex w-full max-w-sm flex-col gap-3 md:w-auto">
            <form
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 transition focus-within:border-indigo-400/60 focus-within:bg-white/[0.04]"
              method="GET"
              action="/admin/orders"
            >
              <div className="absolute -top-24 right-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl transition group-focus-within:bg-indigo-500/20" />
              <div className="relative flex items-center gap-2 text-sm text-white/60">
                <span className="text-white/40">Search</span>
            <input
                  className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none"
                  placeholder="clerkUserId…"
              name="q"
              defaultValue={q}
            />
            <input type="hidden" name="status" value={currentStatus} />
                <button className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-white shadow-[0_10px_30px_-20px_rgba(129,140,248,0.8)] transition hover:scale-[1.02] hover:shadow-[0_12px_35px_-18px_rgba(168,85,247,0.7)]">
                  Go
            </button>
              </div>
          </form>
        </div>
        </header>

        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Orders", value: orders.length.toString(), accent: "from-indigo-400/30 to-indigo-500/10" },
            { label: "Pending Review", value: pending.toString(), accent: "from-amber-400/30 to-amber-500/10" },
            { label: "Fulfilled Orders", value: fulfilled.toString(), accent: "from-emerald-400/30 to-emerald-500/10" },
            { label: "Assets Under Mgmt", value: `${totalInboxes} inboxes · ${totalDomains} domains`, accent: "from-sky-400/30 to-sky-500/10" },
          ].map((card) => (
            <div
              key={card.label}
              className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${card.accent} p-[1px] shadow-[0_20px_60px_-45px_rgba(15,118,255,0.6)]`}
            >
              <div className="relative h-full w-full rounded-[calc(1.5rem-1px)] bg-slate-950/70 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">{card.label}</p>
                <p className="mt-4 text-2xl font-semibold text-white">{card.value}</p>
      </div>
      </div>
          ))}
        </section>

        <section className="mt-12 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => {
            const isActive = currentStatus === status;
            return (
              <Link
                key={status}
                href={buildUrl(status, q)}
                className={`group relative inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wide transition ${
                  isActive
                    ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-100 shadow-[0_12px_40px_-25px_rgba(129,140,248,0.9)]"
                    : "border-white/10 bg-white/5 text-white/50 hover:border-white/30 hover:text-white/80"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    isActive ? "bg-indigo-300 shadow-[0_0_10px_rgba(129,140,248,0.9)]" : "bg-white/40 group-hover:bg-white/70"
                  }`}
                />
                {status.replace(/_/g, " ")}
              </Link>
            );
          })}
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_-60px_rgba(0,0,0,0.9)] backdrop-blur">
          <div className="relative overflow-x-auto">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <table className="min-w-full divide-y divide-white/10 text-sm text-white/80">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/50">
                <tr>
                  <th className="px-6 py-4 text-left">Order</th>
                  <th className="px-6 py-4 text-left">Customer</th>
                  <th className="px-6 py-4 text-left">Product</th>
                  <th className="px-6 py-4 text-left">Qty</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Subscription</th>
                  <th className="px-6 py-4 text-left">Inboxes</th>
                  <th className="px-6 py-4 text-left">Domains</th>
                  <th className="px-6 py-4 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.length === 0 && (
                <tr>
                    <td colSpan={10} className="px-6 py-10 text-center text-sm text-white/40">
                      No orders found for this filter. Adjust the scope to broaden your view.
                    </td>
                </tr>
              )}
                {orders.map((order) => {
                  const isCancelled = order.status === "CANCELLED";
                  const hasSubscription = Boolean(order.stripeSubscriptionId);
                  const inboxTotal = order.inboxes?.length ?? 0;
                  const domainTotal = order.domains?.length ?? 0;

                  return (
                    <tr
                      key={order.id}
                      className={`transition hover:bg-white/6 ${isCancelled ? "opacity-60" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-indigo-200">{order.id.slice(0, 10)}…</span>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 transition hover:border-white/40 hover:text-white"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/70">{order.clerkUserId}</td>
                      <td className="px-6 py-4 text-white/70">{order.productType}</td>
                      <td className="px-6 py-4 text-white/70">{order.quantity}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-white/60">
                        <div className="space-y-1">
                          <p>{hasSubscription ? (isCancelled ? "Cancelled" : "Active") : "—"}</p>
                          {hasSubscription && !isCancelled ? (
                            <p className="font-mono text-[11px] text-white/40">{order.stripeSubscriptionId?.slice(0, 14)}…</p>
                          ) : null}
                          {isCancelled && order.cancelledAt ? (
                            <p className="text-xs text-rose-300">Ended {formatDate(order.cancelledAt)}</p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/70">{inboxTotal}</td>
                      <td className="px-6 py-4 text-white/70">{domainTotal}</td>
                      <td className="px-6 py-4 text-white/50">{formatDate(order.createdAt)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        </section>
      </div>
    </div>
  );
}
