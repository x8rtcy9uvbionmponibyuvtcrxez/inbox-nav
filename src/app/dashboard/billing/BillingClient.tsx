"use client";

import Link from "next/link";
import { 
  CurrencyDollarIcon, 
  InboxIcon, 
  CalendarIcon,
  EyeIcon,
  CogIcon
} from "@heroicons/react/24/outline";
import type { Prisma } from "@prisma/client";

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    inboxes: {
      where: { isActive: true };
    };
    domains: true;
  };
}>;

type BillingClientProps = {
  orders: OrderWithRelations[];
  displayName: string;
  fetchError: string | null;
};

const statusStyles: Record<string, string> = {
  active: "bg-green-500/15 text-green-300 border border-green-500/30",
  past_due: "bg-red-500/15 text-red-300 border border-red-500/30",
  cancelled: "bg-gray-500/15 text-gray-300 border border-gray-500/30",
  cancel_at_period_end: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
  DEFAULT: "bg-white/10 text-brand-muted border border-white/10",
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

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? statusStyles.DEFAULT;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {toTitle(status)}
    </span>
  );
}

function OrderCard({ order }: { order: OrderWithRelations }) {
  const activeInboxes = order.inboxes?.length || 0;
  const totalInboxes = order.quantity;
  const cancelledInboxes = totalInboxes - activeInboxes;
  const monthlyCost = order.totalAmount;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {toTitle(order.productType)} Inboxes
          </h3>
          <p className="text-sm text-gray-400">Order {order.id.slice(0, 8)}...</p>
        </div>
        <StatusBadge status={order.subscriptionStatus} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <InboxIcon className="h-5 w-5 text-blue-400" />
          <div>
            <p className="text-sm text-gray-400">Active Inboxes</p>
            <p className="text-lg font-semibold text-white">{activeInboxes}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <CurrencyDollarIcon className="h-5 w-5 text-green-400" />
          <div>
            <p className="text-sm text-gray-400">Monthly Cost</p>
            <p className="text-lg font-semibold text-white">{formatCurrency(monthlyCost)}</p>
          </div>
        </div>
      </div>

      {cancelledInboxes > 0 && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-300">
            {cancelledInboxes} inboxes cancelled (effective next billing cycle)
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center space-x-1">
          <CalendarIcon className="h-4 w-4" />
          <span>Created {formatDate(order.createdAt)}</span>
        </div>
        {order.nextBillingDate && (
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-4 w-4" />
            <span>Next billing {formatDate(order.nextBillingDate)}</span>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <Link
          href={`/dashboard/billing/${order.id}`}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <EyeIcon className="h-4 w-4" />
          <span>View Details</span>
        </Link>
        <Link
          href={`/dashboard/billing/${order.id}?tab=manage`}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <CogIcon className="h-4 w-4" />
          <span>Manage</span>
        </Link>
      </div>
    </div>
  );
}

export default function BillingClient({ orders, fetchError }: BillingClientProps) {
  if (fetchError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">Failed to load billing information</p>
          <p className="text-sm text-gray-400">{fetchError}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Active Subscriptions</h3>
          <p className="text-gray-400 mb-4">
            You don&apos;t have any active subscriptions yet.
          </p>
          <Link
            href="/dashboard/products"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing & Subscriptions</h1>
        <p className="text-gray-400 mt-1">
          Manage your subscriptions and view billing history
        </p>
      </div>

      <div className="grid gap-6">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
