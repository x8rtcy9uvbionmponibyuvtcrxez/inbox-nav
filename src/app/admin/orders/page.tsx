import Link from "next/link";
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { auth, clerkClient } from "@clerk/nextjs/server";

type StatusTone = {
  bg: string;
  ring: string;
  glow: string;
  label: string;
};

const STATUS_THEME: Record<OrderStatus, StatusTone> = {
  [OrderStatus.FULFILLED]: {
    bg: "from-emerald-400/20 to-emerald-500/10",
    ring: "ring-emerald-400/30",
    glow: "shadow-[0_0_25px_rgba(52,211,153,0.25)]",
    label: "Fulfilled",
  },
  [OrderStatus.PAID]: {
    bg: "from-sky-400/20 to-sky-500/10",
    ring: "ring-sky-400/30",
    glow: "shadow-[0_0_25px_rgba(56,189,248,0.25)]",
    label: "Paid",
  },
  [OrderStatus.PENDING]: {
    bg: "from-amber-400/20 to-amber-500/10",
    ring: "ring-amber-400/30",
    glow: "shadow-[0_0_25px_rgba(251,191,36,0.25)]",
    label: "Pending",
  },
  [OrderStatus.PENDING_DOMAIN_PURCHASE]: {
    bg: "from-purple-400/20 to-purple-500/10",
    ring: "ring-purple-400/30",
    glow: "shadow-[0_0_25px_rgba(192,132,252,0.25)]",
    label: "Domain Purchase",
  },
  [OrderStatus.CANCELLED]: {
    bg: "from-rose-500/30 to-rose-500/10",
    ring: "ring-rose-400/30",
    glow: "shadow-[0_0_25px_rgba(244,114,182,0.25)]",
    label: "Cancelled",
  },
};

function prettyStatus(value: OrderStatus) {
  return STATUS_THEME[value]?.label ?? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const key = status;
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
      pendingInvites: true,
    },
  });

  // Prisma connection managed by singleton

  const uniqueUserIds = Array.from(
    new Set(
      orders
        .map((order) => order.clerkUserId)
        .filter((id): id is string => Boolean(id))
    )
  );
  const userProfiles = new Map<string, { name: string; email: string }>();

  if (uniqueUserIds.length > 0) {
    try {
      const client = await clerkClient();
      const usersResponse = await client.users.getUserList({
        userId: uniqueUserIds,
        limit: uniqueUserIds.length,
      });

      for (const user of usersResponse.data) {
        const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
        const emailAddress =
          user.primaryEmailAddress?.emailAddress ??
          user.emailAddresses?.[0]?.emailAddress ??
          "";

        userProfiles.set(user.id, {
          name: fullName,
          email: emailAddress,
        });
      }
    } catch (error) {
      console.error('[ADMIN_ORDERS] Failed to load Clerk user profiles:', error);
    }
  }

  const totalInboxes = orders.reduce((sum, order) => sum + (order.inboxes?.length ?? 0), 0);
  const totalDomains = orders.reduce((sum, order) => sum + (order.domains?.length ?? 0), 0);
  const fulfilled = orders.filter((o) => o.status === "FULFILLED").length;
  const pending = orders.filter((o) => o.status.includes("PENDING")).length;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="app-shell space-y-12">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-[12px] border border-[var(--border-subtle)] bg-[rgba(254,254,254,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Control center
            </span>
            <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Admin orders dashboard</h1>
            <p className="max-w-xl text-sm text-[var(--text-secondary)]">
              Monitor incoming orders, fulfillment velocity, and subscription health at a glance. Use the filters or search by customer to dive deeper.
            </p>
          </div>
          <div className="flex w-full max-w-sm flex-col gap-3 md:w-auto">
            <form
              className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)] focus-within:border-[var(--border-medium)]"
              method="GET"
              action="/admin/orders"
            >
              <div className="flex items-center gap-3">
                <span className="text-[var(--text-muted)]">Search</span>
                <input
                  className="flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                  placeholder="clerkUserId…"
                  name="q"
                  defaultValue={q}
                />
                <input type="hidden" name="status" value={currentStatus} />
                <button className="rounded-[10px] border border-[var(--border-medium)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)]">
                  Go
                </button>
              </div>
            </form>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total orders", value: orders.length.toString() },
            { label: "Pending review", value: pending.toString() },
            { label: "Fulfilled orders", value: fulfilled.toString() },
            { label: "Assets under mgmt", value: `${totalInboxes} inboxes · ${totalDomains} domains` },
          ].map((card) => (
            <div key={card.label} className="surface-card space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {card.label}
              </p>
              <p className="text-2xl font-semibold text-[var(--text-primary)]">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => {
            const isActive = currentStatus === status;
            return (
              <Link
                key={status}
                href={buildUrl(status, q)}
                className={`inline-flex items-center gap-2 rounded-[10px] border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                  isActive
                    ? "border-[var(--border-strong)] bg-[rgba(254,254,254,0.14)] text-[var(--text-primary)]"
                    : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
                }`}
              >
                {status.replace(/_/g, " ")}
              </Link>
            );
          })}
        </section>

        <section className="overflow-hidden rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border-subtle)] text-sm text-[var(--text-secondary)]">
              <thead className="bg-[rgba(254,254,254,0.05)] text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
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
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {orders.length === 0 && (
                <tr>
                    <td colSpan={10} className="px-6 py-10 text-center text-sm text-[var(--text-muted)]">
                      No orders found for this filter. Adjust the scope to broaden your view.
                    </td>
                </tr>
              )}
                {orders.map((order) => {
                  const isCancelled = order.status === OrderStatus.CANCELLED;
                  const hasSubscription = Boolean(order.stripeSubscriptionId);
                  const provisionedInboxes = order.inboxes?.length ?? 0;
                  const domainTotal = order.domains?.length ?? 0;
                  const profile = order.clerkUserId ? userProfiles.get(order.clerkUserId) : undefined;
                  const inviteEmail = order.pendingInvites?.[0]?.email ?? "";
                  const businessName = (order.businessName ?? "").trim();
                  const customerLines: string[] = [];

                  if (profile?.name) customerLines.push(profile.name);

                  for (const candidate of [profile?.email, inviteEmail]) {
                    if (candidate && !customerLines.includes(candidate)) {
                      customerLines.push(candidate);
                    }
                  }

                  if (!profile?.name && businessName && !customerLines.includes(businessName)) {
                    customerLines.push(businessName);
                  }

                  if (order.clerkUserId) {
                    const idLabel = `ID: ${order.clerkUserId}`;
                    if (!customerLines.includes(idLabel)) {
                      customerLines.push(idLabel);
                    }
                  }

                  if (customerLines.length === 0) {
                    customerLines.push("—");
                  }

                  const [primaryCustomer, ...otherCustomerDetails] = customerLines;
                  const inboxDisplayCount = provisionedInboxes > 0 ? provisionedInboxes : order.quantity;
                  let inboxSecondary: string | undefined;
                  if (provisionedInboxes === 0) {
                    inboxSecondary = "Purchased (pending provisioning)";
                  } else if (provisionedInboxes !== order.quantity) {
                    inboxSecondary = `${provisionedInboxes}/${order.quantity} live`;
                  }

                  return (
                    <tr
                      key={order.id}
                      className={`transition hover:bg-[rgba(254,254,254,0.04)] ${isCancelled ? "opacity-60" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-[var(--text-muted)]">{order.id.slice(0, 10)}…</span>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--border-subtle)] bg-[rgba(254,254,254,0.06)] px-3 py-1 text-xs font-medium text-[var(--text-primary)]/80 transition hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">
                        <div className="flex flex-col">
                          <span
                            className={
                              primaryCustomer === "—" || primaryCustomer.startsWith("ID: ")
                                ? "text-[var(--text-muted)]"
                                : "font-medium text-[var(--text-primary)]"
                            }
                          >
                            {primaryCustomer}
                          </span>
                          {otherCustomerDetails.map((detail) => (
                            <span key={detail} className="text-xs text-[var(--text-muted)]">
                              {detail}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">{order.productType}</td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">{order.quantity}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">
                        <div className="space-y-1">
                          <p>{hasSubscription ? (isCancelled ? "Cancelled" : "Active") : "—"}</p>
                          {hasSubscription && !isCancelled ? (
                            <p className="font-mono text-[11px] text-[var(--text-muted)]">{order.stripeSubscriptionId?.slice(0, 14)}…</p>
                          ) : null}
                          {isCancelled && order.cancelledAt ? (
                            <p className="text-xs text-[var(--text-muted)]">Ended {formatDate(order.cancelledAt)}</p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">
                        <div className="flex flex-col">
                          <span className="font-medium text-[var(--text-primary)]">{inboxDisplayCount}</span>
                          {inboxSecondary ? (
                            <span className="text-xs text-[var(--text-muted)]">{inboxSecondary}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">{domainTotal}</td>
                      <td className="px-6 py-4 text-[var(--text-muted)]">{formatDate(order.createdAt)}</td>
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
