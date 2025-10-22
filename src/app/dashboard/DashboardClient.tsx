"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EnvelopeIcon, SparklesIcon, InboxIcon, GlobeAltIcon, CurrencyDollarIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import OrderDetailsModal from "./OrderDetailsModal";
import { OrderSkeleton, StatsSkeleton } from "@/components/skeletons";
import type { Prisma } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import FadeIn from "@/components/animations/FadeIn";
import StaggeredList from "@/components/animations/StaggeredList";
import IntercomLauncher from "@/components/IntercomLauncher";

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
      {status === "FULFILLED" ? "Active" : status === "PENDING" ? "Pending" : status === "CANCELLED" ? "Completed" : toTitle(status)}
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
      <div className="space-y-8 text-brand-primary">
        {/* Hero Section */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 max-w-2xl">
            <p className="text-base text-brand-secondary mb-2">
              {hasVisited ? `Welcome back, ${displayName}.` : "Welcome to Inbox Navigator"}
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-brand-primary mb-4">
              {hasVisited ? 'Your control center for every inbox.' : "Let's launch your inbox fleet."}
            </h1>
            <p className="text-lg text-brand-secondary leading-relaxed">
              No orders yet — spin up your first inbox by placing your first order and finishing onboarding in less than 5 minutes.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-stretch lg:min-w-[200px]">
            <Button asChild variant="primary" size="lg" className="gap-3 shadow-[0_10px_30px_-15px_rgba(255,255,255,0.8)] hover:shadow-[0_15px_40px_-15px_rgba(255,255,255,0.9)] transition-all duration-200">
              <Link href="/dashboard/products">
                <SparklesIcon className="h-5 w-5" />
                Place your first order
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <SummaryCard label="Live inboxes" value="0" icon={InboxIcon} accent={cardAccent.inboxes} />
          <SummaryCard label="Managed domains" value="0" icon={GlobeAltIcon} accent={cardAccent.domains} />
          <SummaryCard label="Monthly total" value="$0" icon={CurrencyDollarIcon} accent={cardAccent.revenue} />
        </div>

        {fetchError ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            We had trouble syncing the latest data. The view below may be stale. Refresh the page or reach out if this persists.
          </div>
        ) : null}

        {/* Order History Section */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_40px_80px_-60px_rgba(7,7,7,0.9)] backdrop-blur-xl">
          <div className="border-b border-white/5 px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-brand-primary">Recent Orders</h2>
                <p className="mt-1 text-sm text-brand-secondary">Monitor fulfillment and account activity in real time.</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5/10 px-6 py-12 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <SparklesIcon className="h-6 w-6 text-brand-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-brand-primary">No orders yet</h3>
              <p className="mt-2 text-sm text-brand-secondary">Your order history will appear here once you place your first order.</p>
            </div>
          </div>
        </div>

        {/* Inboxes Section */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_40px_80px_-60px_rgba(7,7,7,0.9)] backdrop-blur-xl">
          <div className="border-b border-white/5 px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-brand-primary">Inbox Inventory</h2>
                <p className="mt-1 text-sm text-brand-secondary">Manage your email inboxes and forwarding settings.</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5/10 px-6 py-12 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <InboxIcon className="h-6 w-6 text-brand-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-brand-primary">No inboxes yet</h3>
              <p className="mt-2 text-sm text-brand-secondary">Your inboxes will appear here once your orders are fulfilled.</p>
            </div>
          </div>
        </div>

        {/* Domains Section */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_40px_80px_-60px_rgba(7,7,7,0.9)] backdrop-blur-xl">
          <div className="border-b border-white/5 px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-brand-primary">Domain Management</h2>
                <p className="mt-1 text-sm text-brand-secondary">Track and manage your email domains.</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5/10 px-6 py-12 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <GlobeAltIcon className="h-6 w-6 text-brand-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-brand-primary">No domains yet</h3>
              <p className="mt-2 text-sm text-brand-secondary">Your domains will appear here once your orders are fulfilled.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-brand-primary">
      {/* Hero Section */}
      <FadeIn delay={0.1}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 max-w-2xl">
            <p className="text-base text-brand-secondary mb-2">
              {hasVisited ? `Welcome back, ${displayName}.` : "Welcome to Inbox Nav — we're excited to have you here!"}
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-brand-primary mb-4">
              {hasVisited ? 'Your control center for every inbox.' : "Let's launch your inbox fleet."}
            </h1>
            <p className="text-lg text-brand-secondary leading-relaxed">
              Track orders, manage domains, and launch inboxes — all in one place.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-stretch lg:min-w-[200px]">
            <Button asChild variant="primary" size="lg" className="gap-3 shadow-[0_10px_30px_-15px_rgba(255,255,255,0.8)] hover:shadow-[0_15px_40px_-15px_rgba(255,255,255,0.9)] transition-all duration-200">
              <Link href="/dashboard/products">
                <SparklesIcon className="h-5 w-5" />
                Create Inbox
              </Link>
            </Button>
          <IntercomLauncher className="gap-3 hover:bg-white/5 transition-all duration-200">
            <Button variant="outline" size="lg" className="gap-3 hover:bg-white/5 transition-all duration-200">
              <EnvelopeIcon className="h-5 w-5" />
              Contact Support
            </Button>
          </IntercomLauncher>
          </div>
        </div>
      </FadeIn>

      {/* Stats Cards */}
      <StaggeredList className="grid gap-6 md:grid-cols-3">
        <SummaryCard label="Live inboxes" value={totalInboxes.toString()} icon={InboxIcon} accent={cardAccent.inboxes} />
        <SummaryCard label="Managed domains" value={totalDomains.toString()} icon={GlobeAltIcon} accent={cardAccent.domains} />
        <SummaryCard label="Monthly total" value={formatCurrency(totalMonthlySpend)} icon={CurrencyDollarIcon} accent={cardAccent.revenue} />
      </StaggeredList>

      {fetchError ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          We had trouble syncing the latest data. The view below may be stale. Refresh the page or reach out if this persists.
        </div>
      ) : null}

      {/* Order History Section */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_40px_80px_-60px_rgba(7,7,7,0.9)] backdrop-blur-xl">
        <div className="border-b border-white/5 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-brand-primary">Recent Orders</h2>
              <p className="mt-1 text-sm text-brand-secondary">Monitor fulfillment and account activity in real time.</p>
            </div>
            <div className="text-xs text-brand-muted">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5 text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-brand-muted">
              <tr>
                <th scope="col" className="px-6 py-4 text-left font-semibold">URL</th>
                <th scope="col" className="px-6 py-4 text-left font-semibold">Brand</th>
                <th scope="col" className="px-6 py-4 text-left font-semibold">Product</th>
                <th scope="col" className="px-6 py-4 text-left font-semibold">Volume</th>
                <th scope="col" className="px-6 py-4 text-left font-semibold">Amount</th>
                <th scope="col" className="px-6 py-4 text-left font-semibold">Date</th>
                <th scope="col" className="px-6 py-4 text-left font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 text-left font-semibold">View</th>
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
                  <tr key={record.id} className={`group transition-all duration-200 hover:bg-white/5 ${isCancelled ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-5">
                      <div className="max-w-[240px] truncate text-sm text-brand-primary font-medium" title={forwardingLabel}>
                        {forwardingLabel}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-base font-semibold text-brand-primary">{businessLabel}</div>
                      <div className="text-xs text-brand-muted mt-1">{record.website ? record.website : "—"}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-brand-primary">
                        {order?.productType ? toTitle(order.productType) : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-lg font-semibold text-brand-primary">{inboxCount}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-lg font-semibold text-brand-primary">{formatCurrency(totalCost)}</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-brand-muted">{formatDate(record.createdAt)}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        {order?.subscriptionStatus === 'cancel_at_period_end' || order?.status === 'CANCELLED' ? (
                          <span className="rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide bg-red-500/15 text-red-300 border border-red-500/30">
                            Cancelled
                          </span>
                        ) : order?.status ? (
                          <StatusBadge status={order.status} />
                        ) : (
                          <span className="text-xs text-brand-muted">Unknown</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Button size="sm" variant="secondary" onClick={() => handleOpenOrderDetails(record)} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
