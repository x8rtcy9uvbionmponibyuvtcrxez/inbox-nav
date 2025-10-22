"use client";

import { useState } from "react";
import {
  XMarkIcon,
  CalendarIcon,
  CreditCardIcon,
  GlobeAltIcon,
  InboxIcon,
  ChevronDownIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
type CustomerOrder = {
  id: string;
  productType: string;
  quantity: number;
  totalAmount: number;
  createdAt: Date;
  status?: string;
  subscriptionStatus?: string;
  stripeSubscriptionId?: string;
  cancelledAt?: Date | null;
  cancellationReason?: string | null;
  inboxes: { id: string; email?: string; forwardingDomain?: string }[];
  domains: { id: string; domain: string; forwardingUrl?: string }[];
};

type OrderWithRelations = {
  id: string;
  createdAt: Date;
  businessType?: string;
  website?: string;
  personas?: string[];
  specialRequirements?: string;
  domainPreferences?: string;
  domainSource?: string;
  providedDomains?: string[];
  calculatedDomainCount?: number;
  inboxesPerDomain?: number;
  order: {
    id: string;
    productType: string;
    quantity: number;
    totalAmount: number;
    createdAt: Date;
    status?: string;
    subscriptionStatus?: string;
    stripeSubscriptionId?: string;
    cancelledAt?: Date | null;
    cancellationReason?: string | null;
    inboxes: { id: string; email?: string; forwardingDomain?: string }[];
    domains: { id: string; domain: string; forwardingUrl?: string }[];
  };
};

type OrderDetailsModalProps = {
  order: OrderWithRelations;
  isOpen: boolean;
  onClose: () => void;
};

type NormalizedPersona = {
  firstName: string;
  lastName: string;
  profileImage: string | null;
  initials: string;
  displayName: string;
};

function normalizePersonas(value: unknown): NormalizedPersona[] {
  if (!Array.isArray(value)) return [];
  const personas: NormalizedPersona[] = [];
  value.forEach((item, index) => {
    if (typeof item !== "object" || item === null) return;
    const raw = item as Record<string, unknown>;
    const firstName = typeof raw.firstName === "string" ? raw.firstName.trim() : "";
    const lastName = typeof raw.lastName === "string" ? raw.lastName.trim() : "";
    const profileImage = typeof raw.profileImage === "string" ? raw.profileImage : null;
    const displayName = [firstName, lastName].filter(Boolean).join(" ").trim() || `Persona ${index + 1}`;
    const initialsSource = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim() || displayName.slice(0, 2);
    personas.push({
      firstName,
      lastName,
      profileImage,
      displayName,
      initials: initialsSource.toUpperCase(),
    });
  });
  return personas;
}

type DomainPreferencesPayload = {
  domains?: string[];
  espCredentials?: {
    accountId?: string | null;
    password?: string | null;
    apiKey?: string | null;
  };
  internalTags?: string[];
  espTags?: string[];
};

function normalizeArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item : String(item ?? "")))
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function parseDomainPreferences(value: unknown): DomainPreferencesPayload {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parseDomainPreferences(parsed);
    } catch {
      return {};
    }
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    const payload = value as Record<string, unknown>;
    return {
      domains: normalizeArray(payload.domains),
      espCredentials:
        typeof payload.espCredentials === "object" && payload.espCredentials !== null
          ? {
              accountId:
                typeof (payload.espCredentials as Record<string, unknown>).accountId === "string"
                  ? ((payload.espCredentials as Record<string, unknown>).accountId as string)
                  : null,
              password:
                typeof (payload.espCredentials as Record<string, unknown>).password === "string"
                  ? ((payload.espCredentials as Record<string, unknown>).password as string)
                  : null,
              apiKey:
                typeof (payload.espCredentials as Record<string, unknown>).apiKey === "string"
                  ? ((payload.espCredentials as Record<string, unknown>).apiKey as string)
                  : null,
            }
          : undefined,
      internalTags: normalizeArray(payload.internalTags),
      espTags: normalizeArray(payload.espTags),
    };
  }
  return {};
}

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
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDateWithTimezone(input: Date | string | null | undefined) {
  if (!input) return "—";
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function toTitle(value: string | null | undefined) {
  if (!value) return "Unknown";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    FULFILLED: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    PAID: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
    PENDING: "bg-amber-400/20 text-amber-200 border border-amber-400/40",
    PENDING_DOMAIN_PURCHASE: "bg-purple-500/15 text-purple-200 border border-purple-500/30",
    CANCELLED: "bg-red-500/15 text-red-300 border border-red-500/30",
    DEFAULT: "bg-white/10 text-white/60 border border-white/10",
  };
  
  const style = statusStyles[status] ?? statusStyles.DEFAULT;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium tracking-wide ${style}`}>
      {status === "FULFILLED" ? "Fulfilled" : status === "PENDING" ? "Pending" : status === "CANCELLED" ? "Cancelled" : toTitle(status)}
    </span>
  );
}

export default function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  const [showAllInboxes, setShowAllInboxes] = useState(false);
  const [showAllDomains, setShowAllDomains] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  
  if (!isOpen) return null;

  const orderData = (order.order ?? null) as CustomerOrder | null;
  if (!orderData) {
    return null;
  }

  const inboxCount = orderData?.inboxes && orderData.inboxes.length > 0
    ? orderData.inboxes.length
    : (orderData?.quantity ?? 0);
  const totalCost = orderData?.totalAmount ?? inboxCount * 300;
  const isCancelled = orderData?.status === 'CANCELLED' || orderData?.subscriptionStatus === 'cancel_at_period_end';
  const hasSubscription = Boolean(orderData?.stripeSubscriptionId);
  const hasActiveSubscription = Boolean(hasSubscription && !isCancelled);
  const subscriptionStatusLabel = hasSubscription ? (
    isCancelled ? (
      orderData?.subscriptionStatus === 'cancel_at_period_end' ? 'Cancelling at period end' : 'Cancelled'
    ) : 'Active'
  ) : '—';
  const personas = normalizePersonas(order.personas);
  const specialRequirementsRaw = typeof order.specialRequirements === 'string' ? order.specialRequirements.trim() : '';
  const specialRequirements = specialRequirementsRaw.length ? specialRequirementsRaw : null;
  const domainPreferences = parseDomainPreferences(order.domainPreferences);
  const domainSource = (order.domainSource ?? (domainPreferences.domains?.length ? "OWN" : "BUY_FOR_ME")).toUpperCase();
  const providedDomains = normalizeArray(order.providedDomains);
  const domainList =
    domainPreferences.domains && domainPreferences.domains.length
      ? domainPreferences.domains
      : providedDomains;
  const ownDomains = domainSource === "OWN" ? domainList : [];
  const domainCountPlan = order.calculatedDomainCount ?? null;
  const inboxesPerDomain = order.inboxesPerDomain ?? null;
  const forwardingUrl = order.website ?? "";
  const espCredentials = domainPreferences.espCredentials ?? {
    accountId: null,
    password: null,
    apiKey: null,
  };

  const handleDownloadCsv = () => {
    const rows: string[][] = [
      ["Field", "Value"],
      ["Order ID", orderData.id],
      ["Status", orderData.status || "Unknown"],
      ["Product", orderData.productType],
      ["Quantity", String(orderData.quantity ?? inboxCount)],
      ["Total Amount (cents)", String(orderData.totalAmount ?? totalCost)],
      ["Business Name", order.businessType ?? ""],
      ["Website", order.website ?? ""],
      ["Subscription Status", subscriptionStatusLabel],
      ["Stripe Subscription ID", orderData.stripeSubscriptionId ?? ""],
      ["Cancelled On", orderData.cancelledAt ? formatDate(orderData.cancelledAt) : ""],
      ["Cancellation Reason", orderData.cancellationReason ?? ""],
      ["Domain Source", toTitle(domainSource)],
      ["Inboxes per Domain", inboxesPerDomain != null ? String(inboxesPerDomain) : ""],
      ["Domains Needed", domainCountPlan != null ? String(domainCountPlan) : ""],
      ["Forwarding URL", forwardingUrl],
      ["Domain Plan", domainList.join("; ")],
      ["ESP Account ID", espCredentials.accountId ?? ""],
      ["ESP Password", espCredentials.password ?? ""],
      ["ESP API Key", espCredentials.apiKey ?? ""],
      ["Personas", personas.map((persona) => persona.displayName).join("; ")],
      ["Inbox Emails", orderData.inboxes.map((inbox) => inbox.email).join("; ")],
      ["Domain Records", orderData.domains.map((domain) => domain.domain).join("; ")],
      ["Special Requirements", specialRequirements ?? ""],
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `order-${orderData.id}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-black/90 p-6 text-white shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">Order Details</h2>
            <p className="text-sm text-white/60 mt-1">
              {formatDateWithTimezone(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
            >
              Download CSV
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Order Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5" />
              Order Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Status:</span>
                <StatusBadge status={orderData?.status || "Unknown"} />
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Order ID:</span>
                <span className="font-mono text-xs text-white/80">{orderData?.id ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Product:</span>
                <span className="text-white">{orderData?.productType ? toTitle(orderData.productType) : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Quantity:</span>
                <span className="text-white">{inboxCount} inboxes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Total Amount:</span>
                <span className="text-white font-semibold">{formatCurrency(totalCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Business:</span>
                <span className="text-white">{order.businessType || order.website || "Untitled order"}</span>
              </div>
              {order.website && (
                <div className="flex justify-between">
                  <span className="text-white/60">Website:</span>
                  <span className="text-white">{order.website}</span>
                </div>
              )}
              {specialRequirements && (
                <div className="flex flex-col gap-1">
                  <span className="text-white/60">Special Requirements:</span>
                  <span className="text-sm text-white/80 whitespace-pre-wrap">{specialRequirements}</span>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Subscription Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Subscription Status:</span>
                <span className="text-white">{subscriptionStatusLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Stripe Subscription ID:</span>
                <span className="font-mono text-xs text-white/80 break-all">
                  {orderData?.stripeSubscriptionId || 'Not available'}
                </span>
              </div>
              {isCancelled && orderData?.cancelledAt && (
                <div className="flex justify-between">
                  <span className="text-white/60">Cancelled On:</span>
                  <span className="text-red-300">{formatDate(orderData.cancelledAt)}</span>
                </div>
              )}
              {orderData?.cancellationReason && (
                <div className="flex justify-between">
                  <span className="text-white/60">Cancellation Reason:</span>
                  <span className="text-white">{orderData.cancellationReason}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Domain Configuration */}
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <GlobeAltIcon className="h-5 w-5" />
            Domain Configuration
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Domain Source:</span>
                <span className="text-white">{toTitle(domainSource)}</span>
              </div>
              {ownDomains.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/60">Own Domains:</span>
                  <span className="text-white">{ownDomains.length} domains</span>
                </div>
              )}
              {inboxesPerDomain != null && (
                <div className="flex justify-between">
                  <span className="text-white/60">Inboxes per Domain:</span>
                  <span className="text-white">{inboxesPerDomain}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {forwardingUrl && (
                <div className="flex justify-between">
                  <span className="text-white/60">Forwarding URL:</span>
                  <span className="text-white break-all">{forwardingUrl}</span>
                </div>
              )}
              {domainCountPlan != null && (
                <div className="flex justify-between">
                  <span className="text-white/60">Domains Needed:</span>
                  <span className="text-white">{domainCountPlan}</span>
                </div>
              )}
            </div>
          </div>

          {domainList.length > 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Domain Plan</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {domainList.map((domain) => (
                  <span key={domain} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/70">
                    {domain}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/60">
              No domains were provided during onboarding. Once fulfillment runs, any domains sourced for this order appear here.
            </p>
          )}

          {(espCredentials.accountId || espCredentials.password || espCredentials.apiKey) && (
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">ESP Account ID</p>
                <p className="mt-2 font-mono text-xs text-white/80">{espCredentials.accountId ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">ESP Password</p>
                <p className="mt-2 font-mono text-xs text-white/80">{espCredentials.password ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">ESP API Key</p>
                <p className="mt-2 break-all font-mono text-xs text-white/80">{espCredentials.apiKey ?? '—'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Personas */}
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5" />
            Personas ({personas.length})
          </h3>
          {personas.length === 0 ? (
            <p className="text-sm text-white/60">
              No personas were provided during onboarding. We&rsquo;ll follow up if the fulfillment team needs them.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {personas.map((persona, index) => (
                <div key={`${persona.displayName}-${index}`} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white/80">
                    {persona.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{persona.displayName}</p>
                    <p className="text-xs text-white/50">
                      {persona.profileImage ? 'Avatar supplied' : 'No avatar provided'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inboxes and Domains Summary */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <InboxIcon className="h-5 w-5" />
              Inboxes ({inboxCount})
            </h3>
            {orderData?.inboxes && orderData.inboxes.length > 0 ? (
              <div className="space-y-2">
                {(showAllInboxes ? orderData.inboxes : orderData.inboxes.slice(0, 5)).map((inbox) => (
                  <div key={inbox.id} className="p-2 rounded-lg bg-white/5">
                    <span className="text-sm text-white/80">{inbox.email}</span>
                  </div>
                ))}
                {orderData.inboxes.length > 5 && (
                  <button
                    onClick={() => setShowAllInboxes(!showAllInboxes)}
                    className="flex items-center gap-2 text-xs text-white/60 hover:text-white/80 transition-colors"
                  >
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${showAllInboxes ? 'rotate-180' : ''}`} />
                    {showAllInboxes ? 'Show less' : `+${orderData.inboxes.length - 5} more inboxes`}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-white/60">No inboxes created yet</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <GlobeAltIcon className="h-5 w-5" />
              Domains ({orderData?.domains?.length || 0})
            </h3>
            {orderData?.domains && orderData.domains.length > 0 ? (
              <div className="space-y-2">
                {(showAllDomains ? orderData.domains : orderData.domains.slice(0, 5)).map((domain) => (
                  <div key={domain.id} className="p-2 rounded-lg bg-white/5">
                    <span className="text-sm text-white/80 font-mono">{domain.domain}</span>
                  </div>
                ))}
                {orderData.domains.length > 5 && (
                  <button
                    onClick={() => setShowAllDomains(!showAllDomains)}
                    className="flex items-center gap-2 text-xs text-white/60 hover:text-white/80 transition-colors"
                  >
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${showAllDomains ? 'rotate-180' : ''}`} />
                    {showAllDomains ? 'Show less' : `+${orderData.domains.length - 5} more domains`}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-white/60">No domains created yet</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
          {cancelMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              cancelMessage.includes('successfully') 
                ? 'bg-green-500/20 text-green-200 border border-green-500/30' 
                : 'bg-red-500/20 text-red-200 border border-red-500/30'
            }`}>
              {cancelMessage}
            </div>
          )}
          <div className="flex justify-end gap-3">
          {hasSubscription && !isCancelled && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (isCancelling) return;
                
                setIsCancelling(true);
                setCancelMessage(null);
                
                try {
                  const response = await fetch('/api/cancel-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: orderData?.id }),
                  });
                  
                  const result = await response.json();
                  
                  if (response.ok && result.success) {
                    setCancelMessage('Subscription cancelled successfully. It will end at the current period.');
                    // Close modal after 2 seconds
                    setTimeout(() => {
                      onClose();
                      // Refresh the page to update the order status
                      window.location.reload();
                    }, 2000);
                  } else {
                    setCancelMessage(result.error || 'Failed to cancel subscription');
                  }
                } catch (error) {
                  console.error('Failed to cancel subscription:', error);
                  setCancelMessage('Failed to cancel subscription. Please try again.');
                } finally {
                  setIsCancelling(false);
                }
              }}
            >
              <button
                type="submit"
                disabled={isCancelling}
                className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-200 hover:border-red-500/50 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </form>
          )}
          <button
            onClick={onClose}
            className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 hover:border-white/40 hover:text-white transition-colors"
          >
            Close
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
