"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EnvelopeIcon, SparklesIcon, InboxIcon, GlobeAltIcon, CurrencyDollarIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import OrderDetailsModal from "./OrderDetailsModal";
import { OrderSkeleton, StatsSkeleton } from "@/components/skeletons";
import type { Prisma } from "@prisma/client";
import { Button } from "@/components/ui/Button";

type OrderWithRelations = Prisma.OnboardingDataGetPayload<{
  include: {
    order: {
      include: {
        inboxes: true;
        domains: true;
      };
    };
  };
}>;

type DashboardClientProps = {
  orders: OrderWithRelations[];
  displayName: string;
  totalInboxes: number;
  totalDomains: number;
  totalMonthlySpend: number;
  fetchError: string | null;
  isLoading?: boolean;
};

const statusStyles: Record<string, string> = {
  FULFILLED: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  PAID: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  PENDING: "bg-amber-400/20 text-amber-200 border border-amber-400/40",
  PENDING_DOMAIN_PURCHASE: "bg-purple-500/15 text-purple-200 border border-purple-500/30",
  CANCELLED: "bg-red-500/15 text-red-300 border border-red-500/30",
  DEFAULT: "bg-white/10 text-brand-muted border border-white/10",
};

const cardAccent: Record<"inboxes" | "domains" | "revenue", string> = {
  inboxes: "from-indigo-500/30 to-indigo-500/10 border-indigo-500/30",
  domains: "from-cyan-500/20 to-sky-500/5 border-cyan-500/25",
  revenue: "from-emerald-500/25 to-emerald-500/5 border-emerald-500/25",
};

function formatCurrency(amountInCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amountInCents / 100);
}

function formatDate(input: Date | string | null | undefined) {
  if (!input) return "—";
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function toTitle(value: string | null | undefined) {
  if (!value) return "Unknown";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof InboxIcon;
  accent: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br p-[1px] ${accent}`}>
      <div className="relative h-full w-full rounded-[calc(1.5rem-1px)] bg-black/40 px-6 py-5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted-strong">{label}</p>
            <p className="mt-3 text-2xl font-semibold text-brand-primary">{value}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-brand-primary">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? statusStyles.DEFAULT;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium tracking-wide ${style}`}>
      {status === "FULFILLED" ? "Fulfilled" : status === "PENDING" ? "Pending" : status === "CANCELLED" ? "Cancelled" : toTitle(status)}
    </span>
  );
}

export default function DashboardClient({ 
  orders, 
  displayName, 
  totalInboxes, 
  totalDomains, 
  totalMonthlySpend, 
  fetchError,
  isLoading = false
}: DashboardClientProps) {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasVisited, setHasVisited] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('inbox-nav:visited');
      if (stored === 'true') {
        setHasVisited(true);
      } else {
        window.localStorage.setItem('inbox-nav:visited', 'true');
      }
    } catch {
      // noop – localStorage unavailable
    }
  }, []);

  const handleOpenOrderDetails = (order: OrderWithRelations) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-brand-primary">Welcome back, {displayName}</h1>
            <p className="mt-2 text-base text-brand-secondary">Here&rsquo;s what&rsquo;s happening with your inbox fleet</p>
          </div>
        </div>

        <StatsSkeleton />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-brand-primary">Recent Orders</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => <OrderSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5/10 px-10 py-16 text-center backdrop-blur-xl">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
          <SparklesIcon className="h-8 w-8 text-brand-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-brand-primary">Welcome to Inbox Navigator</h2>
        <p className="mt-3 max-w-md text-base text-brand-secondary">
          {fetchError
            ? "We hit a snag loading your workspace. Refresh or drop us a note and we&rsquo;ll take a look immediately."
            : "You don&rsquo;t have any active orders yet. Grab your first inbox package to kick things off."}
        </p>
        {fetchError ? (
          <p className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            {fetchError}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="primary" size="md" className="gap-2">
            <Link href="/dashboard/products">
              <ShoppingCartIcon className="h-4 w-4" />
              Create inboxes
            </Link>
          </Button>
          <Button asChild variant="outline" size="md" className="gap-2">
            <a href="mailto:contact@inboxnavigator.com">
              <EnvelopeIcon className="h-4 w-4" />
              Talk to support
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-brand-primary">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-base text-brand-secondary">
            {hasVisited ? `Welcome back, ${displayName}.` : "Welcome to Inbox Nav — we're excited to have you here!"}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-brand-primary">
            {hasVisited ? 'Your mission control for every inbox.' : 'Let’s launch your inbox fleet.'}
          </h1>
          <p className="mt-3 text-base text-brand-secondary">
            Track fulfillment in real time, review order history, and spin up new inboxes whenever you&rsquo;re ready.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary" className="gap-2 shadow-[0_10px_30px_-15px_rgba(255,255,255,0.8)]">
            <Link href="/dashboard/products">
              <SparklesIcon className="h-5 w-5" />
              Create Inboxes
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <a href="mailto:contact@inboxnavigator.com">
              <EnvelopeIcon className="h-5 w-5" />
              Talk to Support
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <SummaryCard label="Total inboxes live" value={totalInboxes.toString()} icon={InboxIcon} accent={cardAccent.inboxes} />
        <SummaryCard label="Domains under management" value={totalDomains.toString()} icon={GlobeAltIcon} accent={cardAccent.domains} />
        <SummaryCard label="Monthly subscription" value={formatCurrency(totalMonthlySpend)} icon={CurrencyDollarIcon} accent={cardAccent.revenue} />
      </div>

      {fetchError ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          We had trouble syncing the latest data. The view below may be stale. Refresh the page or reach out if this persists.
        </div>
      ) : null}

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_40px_80px_-60px_rgba(7,7,7,0.9)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-brand-primary">Order history</h2>
            <p className="text-sm text-brand-secondary">Your most recent onboarding submissions and fulfillment progress.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5 text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-brand-muted">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">Forwarding URL</th>
                <th scope="col" className="px-6 py-3 text-left">Business</th>
                <th scope="col" className="px-6 py-3 text-left">Product</th>
                <th scope="col" className="px-6 py-3 text-left">Inboxes</th>
                <th scope="col" className="px-6 py-3 text-left">Total</th>
                <th scope="col" className="px-6 py-3 text-left">Submitted</th>
                <th scope="col" className="px-6 py-3 text-left">Status</th>
                <th scope="col" className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((record) => {
                const order = record.order;
                const businessLabel = record.businessType || record.website || "Untitled order";
                const inboxCount = order?.inboxes && order.inboxes.length > 0
                  ? order.inboxes.length
                  : (order?.quantity ?? 0);
                const totalCost = order?.totalAmount ?? inboxCount * 300;
                const isCancelled = order?.status === 'CANCELLED' || order?.subscriptionStatus === 'cancel_at_period_end';
                const forwardingLabel =
                  record.website ||
                  order?.inboxes?.find((inbox) => inbox.forwardingDomain && inbox.forwardingDomain !== "-")?.forwardingDomain ||
                  order?.domains?.find((domain) => domain.forwardingUrl)?.forwardingUrl ||
                  "—";
                
                return (
                  <tr key={record.id} className={`transition hover:bg-white/5 ${isCancelled ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="max-w-[240px] truncate text-xs text-brand-muted" title={forwardingLabel}>
                        {forwardingLabel}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-base text-brand-primary">{businessLabel}</div>
                      <div className="text-xs text-brand-muted">{record.website ? record.website : "—"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-brand-secondary">
                        {order?.productType ? toTitle(order.productType) : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-secondary">{inboxCount}</td>
                    <td className="px-6 py-4 text-brand-secondary">{formatCurrency(totalCost)}</td>
                    <td className="px-6 py-4 text-brand-muted">{formatDate(record.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {order?.subscriptionStatus === 'cancel_at_period_end' || order?.status === 'CANCELLED' ? (
                          <span className="rounded-full px-3 py-1 text-xs font-medium tracking-wide bg-red-500/15 text-red-300 border border-red-500/30">
                            Cancelled
                          </span>
                        ) : order?.status ? (
                          <StatusBadge status={order.status} />
                        ) : (
                          <span className="text-xs text-brand-muted">Unknown</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Button size="sm" variant="secondary" onClick={() => handleOpenOrderDetails(record)}>
                        View Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder!}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
