"use client";

import { useState, useEffect } from "react";
import { revealSecret } from "@/lib/encryption";
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
  subscriptionStatus: string;
  stripeSubscriptionId?: string;
  cancelledAt?: Date | null;
  cancellationReason?: string | null;
  inboxes: { id: string; email?: string; forwardingDomain?: string | null; deletionDate?: Date | null }[];
  domains: { id: string; domain: string; forwardingUrl?: string | null }[];
};

type OrderWithRelations = {
  id: string;
  createdAt: Date;
  businessType?: string | null;
  website?: string | null;
  domainRegistrar?: string | null;
  registrarUsername?: string | null;
  registrarPassword?: string | null;
  personas?: unknown;
  specialRequirements?: string | null;
  domainPreferences?: string | null;
  domainSource?: string | null;
  providedDomains?: string[] | null;
  calculatedDomainCount?: number | null;
  inboxesPerDomain?: number | null;
  order: {
    id: string;
    productType: string;
    quantity: number;
    totalAmount: number;
    createdAt: Date;
    status?: string | null;
    subscriptionStatus: string;
    stripeSubscriptionId?: string | null;
    cancelledAt?: Date | null;
    cancellationReason?: string | null;
    inboxes: { id: string; email?: string; forwardingDomain?: string | null }[];
    domains: { id: string; domain: string; forwardingUrl?: string | null }[];
  };
};

type OrderDetailsModalProps = {
  order: OrderWithRelations;
  isOpen: boolean;
  onClose: () => void;
  onCancelled?: (orderId: string) => void;
};

type NormalizedPersona = {
  firstName: string;
  lastName: string;
  profileImage: string | null;
  initials: string;
  displayName: string;
};

function getPersonaDownloadMeta(profileImage: string | null, displayName: string, index: number) {
  if (!profileImage) return null;
  const isDataUrl = profileImage.startsWith("data:image/");
  const dataExtension = isDataUrl ? profileImage.match(/^data:image\/([a-z0-9+]+);/i) : null;
  const urlExtension = !isDataUrl ? profileImage.match(/\.([a-z0-9]{2,5})(?:$|[?#])/i) : null;
  const extension = dataExtension?.[1]?.toLowerCase() ?? urlExtension?.[1]?.toLowerCase() ?? "png";
  const slug = displayName.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
  return {
    href: profileImage,
    download: `${slug || `persona-${index + 1}`}.${extension}`,
  };
}

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
  if (value === 'RESELLER') return 'Premium';
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

export default function OrderDetailsModal({ order, isOpen, onClose, onCancelled }: OrderDetailsModalProps) {
  const [showAllInboxes, setShowAllInboxes] = useState(false);
  const [showAllDomains, setShowAllDomains] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [cancelMessageType, setCancelMessageType] = useState<'success' | 'error' | null>(null);
  const [localOrder, setLocalOrder] = useState<OrderWithRelations | null>(order ?? null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Update local order when prop changes (after refresh)
  useEffect(() => {
    if (order) {
      setLocalOrder(order);
    }
  }, [order]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  const currentOrder = localOrder ?? order ?? null;

  if (!isOpen) return null;

  if (!currentOrder) {
    console.error('OrderDetailsModal: missing order data');
    return null;
  }

  const orderData = (currentOrder.order ?? null) as CustomerOrder | null;
  if (!orderData) {
    console.error('OrderData is null! Order structure:', currentOrder);
    return null;
  }


  const inboxCount = orderData?.inboxes && orderData.inboxes.length > 0
    ? orderData.inboxes.length
    : (orderData?.quantity ?? 0);
  const totalCost = orderData?.totalAmount ?? inboxCount * 300;
  const isCancelled = orderData?.status === 'CANCELLED' || orderData?.subscriptionStatus === 'cancel_at_period_end' || orderData?.subscriptionStatus === 'cancelled' || orderData?.subscriptionStatus === 'canceled';
  const hasSubscription = Boolean(orderData?.stripeSubscriptionId || (orderData?.subscriptionStatus && orderData.subscriptionStatus !== 'cancelled' && orderData.subscriptionStatus !== 'canceled' && orderData.subscriptionStatus !== 'cancel_at_period_end'));
  const hasActiveSubscription = Boolean(!isCancelled && hasSubscription);
  const subscriptionStatusLabel = isCancelled
    ? (orderData?.subscriptionStatus === 'cancel_at_period_end' ? 'Cancelling at period end' : 'Cancelled')
    : (hasActiveSubscription ? 'Active' : '—');
  const personas = normalizePersonas(currentOrder.personas);
  const specialRequirementsRaw = typeof currentOrder.specialRequirements === 'string' ? currentOrder.specialRequirements.trim() : '';
  const specialRequirements = specialRequirementsRaw.length ? specialRequirementsRaw : null;
  const domainPreferences = parseDomainPreferences(currentOrder.domainPreferences);
  const domainSource = (currentOrder.domainSource ?? (domainPreferences.domains?.length ? "OWN" : "BUY_FOR_ME")).toUpperCase();
  const providedDomains = normalizeArray(currentOrder.providedDomains);
  const domainList =
    domainPreferences.domains && domainPreferences.domains.length
      ? domainPreferences.domains
      : providedDomains;
  const ownDomains = domainSource === "OWN" ? domainList : [];
  const domainCountPlan = currentOrder.calculatedDomainCount ?? null;
  const inboxesPerDomain = currentOrder.inboxesPerDomain ?? null;
  const forwardingUrl = currentOrder.website ?? "";
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
      ["Business Name", currentOrder.businessType ?? ""],
      ["Website", currentOrder.website ?? ""],
      ["Subscription Status", subscriptionStatusLabel],
      ["Stripe Subscription ID", orderData.stripeSubscriptionId ?? ""],
      ["Cancelled On", orderData.cancelledAt ? formatDate(orderData.cancelledAt) : ""],
      ["Cancellation Reason", orderData.cancellationReason ?? ""],
      ["Domain Source", toTitle(domainSource)],
      ["Inboxes per Domain", inboxesPerDomain != null ? String(inboxesPerDomain) : ""],
      ["Domains Needed", domainCountPlan != null ? String(domainCountPlan) : ""],
      ["Forwarding URL", forwardingUrl],
      ["Domain Plan", domainList.join("; ")],
      ["Registrar", currentOrder.domainRegistrar ?? ""],
      ["Registrar Username", currentOrder.registrarUsername ?? ""],
      ["Registrar Password", currentOrder.registrarPassword ? "••••••••" : ""],
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
              {isCancelled && orderData?.inboxes && orderData.inboxes.length > 0 && orderData.inboxes[0]?.deletionDate && (
                <div className="flex justify-between">
                  <span className="text-white/60">Inbox Deletion Date:</span>
                  <span className="text-red-300">{formatDate(orderData.inboxes[0].deletionDate)}</span>
                </div>
              )}
              {isCancelled && orderData?.inboxes && orderData.inboxes.length > 0 && !orderData.inboxes[0]?.deletionDate && orderData?.cancelledAt && (
                <div className="flex justify-between">
                  <span className="text-white/60">Inbox Deletion Date:</span>
                  <span className="text-red-300">
                    {(() => {
                      const deletionDate = new Date(orderData.cancelledAt);
                      deletionDate.setDate(deletionDate.getDate() + 30);
                      return formatDate(deletionDate);
                    })()}
                  </span>
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
              <div className="flex justify-between">
                <span className="text-white/60">Forwarding URL:</span>
                <span className="text-white break-all">{forwardingUrl || '—'}</span>
              </div>
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
              The domains that the team will buy will show up here once the order has been fulfilled.
            </p>
          )}

          {(espCredentials.accountId || espCredentials.password || espCredentials.apiKey) && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">ESP</h3>
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
            </div>
          )}

          {/* Registrar Details - Only show if OWN domain flow */}
          {domainSource === "OWN" && (currentOrder.domainRegistrar || currentOrder.registrarUsername || currentOrder.registrarPassword) && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Registrar</h3>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Registrar</p>
                  <p className="mt-2 text-xs text-white/80">{currentOrder.domainRegistrar ?? '—'}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Registrar Username</p>
                  <p className="mt-2 font-mono text-xs text-white/80 break-all">{currentOrder.registrarUsername ?? '—'}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Registrar Password</p>
                  <p className="mt-2 font-mono text-xs text-white/80">
                    {currentOrder.registrarPassword ? revealSecret(currentOrder.registrarPassword) ?? '—' : '—'}
                  </p>
                </div>
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
              {personas.map((persona, index) => {
                const downloadMeta = getPersonaDownloadMeta(persona.profileImage, persona.displayName, index);
                return (
                  <div key={`${persona.displayName}-${index}`} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white/80">
                      {persona.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{persona.displayName}</p>
                      {persona.profileImage ? (
                        <div className="flex items-center gap-3">
                          <p className="text-xs text-white/50">Avatar supplied</p>
                          {isHydrated && downloadMeta && (
                            <a
                              href={downloadMeta.href}
                              download={downloadMeta.download}
                              className="text-xs font-medium text-indigo-200 hover:text-indigo-100"
                            >
                              Download avatar
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-white/50">No avatar provided</p>
                      )}
                    </div>
                  </div>
                );
              })}
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
              cancelMessageType === 'success'
                ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                : 'bg-red-500/20 text-red-200 border border-red-500/30'
            }`}>
              {cancelMessage}
            </div>
          )}
          <div className="flex justify-end gap-3">
          {hasSubscription && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (isCancelling) return;
                
                setIsCancelling(true);
                setCancelMessage(null);
                setCancelMessageType(null);
                
                try {
                  const response = await fetch('/api/cancel-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: orderData?.id }),
                  });
                  
                  const result = await response.json();
                  
                  if (!response.ok || !result?.success) {
                    const errorMessage = result?.error || result?.message || 'Failed to cancel subscription';
                    setCancelMessage(errorMessage);
                    setCancelMessageType('error');
                    return;
                  }

                  const successMessage = result?.message || 'Subscription cancelled successfully.';
                  const stripeNotice = result?.stripeError ? ` Stripe notice: ${result.stripeError}` : '';
                  
                  if (currentOrder && orderData) {
                    // Optimistically update local order state
                    const updatedOrder: OrderWithRelations = {
                      ...currentOrder,
                      order: {
                        ...orderData,
                        subscriptionStatus: 'cancel_at_period_end',
                        cancelledAt: new Date(),
                      },
                    };
                    setLocalOrder(updatedOrder);
                    // Inform parent so tables/lists can update immediately
                    try {
                      onCancelled?.(orderData.id);
                    } catch {
                      // ignore consumer errors
                    }
                  }

                  setCancelMessage(`${successMessage}${stripeNotice}`);
                  setCancelMessageType('success');
                  
                  // Force immediate hard reload to ensure cache is cleared and fresh data is fetched
                  // Use a small delay to show success message first
                  setTimeout(() => {
                    onClose();
                    // Force a hard reload with cache-busting
                    window.location.href = window.location.href.split('?')[0] + '?refresh=' + Date.now();
                  }, 1500);
                } catch (error) {
                  console.error('Failed to cancel subscription:', error);
                  setCancelMessage('Failed to cancel subscription. Please try again.');
                  setCancelMessageType('error');
                } finally {
                  setIsCancelling(false);
                }
              }}
            >
              <button
                type="submit"
                disabled={isCancelling || isCancelled}
                className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-200 hover:border-red-500/50 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? 'Cancelling...' : 
                 isCancelled ? 'Subscription Already Cancelled' : 
                 'Cancel Subscription'}
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
