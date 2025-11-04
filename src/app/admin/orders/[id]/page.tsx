"use client";

import { useEffect, useMemo, useState, use } from 'react';
import Link from 'next/link';
import CSVUpload from '../_components/CSVUpload';
import BulkInboxUpdate from '../_components/BulkInboxUpdate';
import { markOrderAsFulfilledAction, type CSVRow } from '../actions';
import { revealSecret } from '@/lib/encryption';

type Persona = { firstName: string; lastName: string; profileImage?: string | null };

type EspCredentials = {
  accountId?: string | null;
  password?: string | null;
  apiKey?: string | null;
};

type OnboardingPayload = {
  businessType?: string;
  website?: string;
  domainSource?: string;
  providedDomains?: string[];
  domainPreferences?: unknown;
  personas?: unknown;
  espProvider?: string | null;
  specialRequirements?: string | null;
  inboxesPerDomain?: number | null;
  calculatedDomainCount?: number | null;
  internalTags?: unknown;
  espTags?: unknown;
  espCredentials?: EspCredentials | null;
  // Registrar credentials
  domainRegistrar?: string | null;
  registrarAdminEmail?: string | null;
  registrarUsername?: string | null;
  registrarPassword?: string | null; // encrypted
};

type OrderData = {
  id: string;
  clerkUserId: string | null;
  clerkUserName?: string | null;
  clerkUserEmail?: string | null;
  productType: string;
  quantity: number;
  status: string;
  totalAmount?: number | null;
  createdAt: string;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  onboardingData?: OnboardingPayload | OnboardingPayload[];
  domains: Array<{
    id: string;
    domain: string;
    status: string;
    inboxCount: number;
    forwardingUrl: string;
    businessName: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    fulfilledAt?: string | null;
  }>;
  inboxes: Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    status: string;
    password?: string | null;
    espPlatform: string;
    tags: string[];
    businessName: string;
    forwardingDomain?: string | null;
    createdAt: string;
    updatedAt: string;
    fulfilledAt?: string | null;
  }>;
};

const statusStyles: Record<string, string> = {
  FULFILLED: 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300',
  PAID: 'bg-blue-500/15 border border-blue-500/30 text-blue-300',
  PENDING: 'bg-amber-400/20 border border-amber-400/40 text-amber-200',
  PENDING_DOMAIN_PURCHASE: 'bg-purple-500/15 border border-purple-500/30 text-purple-200',
  CANCELLED: 'bg-red-500/15 border border-red-500/30 text-red-300',
  DEFAULT: 'bg-gray-500/15 border border-gray-500/40 text-gray-300',
};

function StatCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-4 shadow-sm shadow-black/10">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
      {sublabel ? <p className="mt-1 text-xs text-gray-400">{sublabel}</p> : null}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-gray-800 bg-gray-900/60 p-3">
      <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
      <span className="text-sm text-gray-100">{value || '—'}</span>
    </div>
  );
}

function TagList({ items, emptyMessage }: { items: string[]; emptyMessage: string }) {
  if (items.length === 0) {
    return <span className="text-sm text-gray-500">{emptyMessage}</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function getPersonaDownloadMeta(profileImage: string | null, personaName: string, fallbackIndex: number) {
  if (!profileImage) return null;
  const isDataUrl = profileImage.startsWith('data:image/');
  const extensionMatch = isDataUrl ? profileImage.match(/^data:image\/([a-z0-9+]+);/i) : null;
  const urlExtensionMatch = !isDataUrl ? profileImage.match(/\.([a-z0-9]{2,5})(?:$|[?#])/i) : null;
  const extension = extensionMatch?.[1]?.toLowerCase() ?? urlExtensionMatch?.[1]?.toLowerCase() ?? 'png';
  const slug = personaName.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return {
    href: profileImage,
    download: `${slug || `persona-${fallbackIndex}`}.${extension}`,
  };
}

function PersonaCard({
  persona,
  index,
  showDownloadLink,
}: {
  persona: Persona;
  index: number;
  showDownloadLink: boolean;
}) {
  const initials = `${persona.firstName?.[0] ?? ''}${persona.lastName?.[0] ?? ''}`.toUpperCase();
  const profileImage = typeof persona.profileImage === 'string' ? persona.profileImage : null;
  const personaName = `${persona.firstName ?? ''} ${persona.lastName ?? ''}`.trim() || 'Persona';
  const downloadMeta = getPersonaDownloadMeta(profileImage, personaName, index + 1);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/60 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-200">
        {initials || index + 1}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-medium text-white">{personaName}</p>
        {profileImage ? (
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-500">Avatar supplied</p>
            {showDownloadLink && downloadMeta && (
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
          <p className="text-xs text-gray-500">No avatar</p>
        )}
      </div>
    </div>
  );
}

function formatCurrency(value: number | null | undefined) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value / 100);
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}

function toTitle(value: string) {
  if (value === 'RESELLER') return 'Premium';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const normalizeStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : String(item ?? '')))
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizePersonas = (value: unknown): Persona[] => {
  if (!value || !Array.isArray(value)) return [];
  return value
    .filter((item): item is Persona => typeof item === 'object' && item != null && 'firstName' in item && 'lastName' in item)
    .map((item) => ({
      firstName: (item as Persona).firstName,
      lastName: (item as Persona).lastName,
      profileImage: (item as Persona).profileImage ?? null,
    }));
};

export default function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[] | null>(null);
  const [uniformPassword, setUniformPassword] = useState('');
  const [fulfilling, setFulfilling] = useState(false);
  const [fulfillmentMessage, setFulfillmentMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/admin/orders/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [resolvedParams.id]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const onboarding = useMemo(() => {
    if (!order?.onboardingData) return null;
    const raw = Array.isArray(order.onboardingData) ? order.onboardingData[0] : order.onboardingData;
    if (!raw) return null;

    const rawDomainPrefs = (raw as { domainPreferences?: unknown }).domainPreferences;
    let domainPreferences = normalizeStringArray(rawDomainPrefs);
    let espCredentials: EspCredentials | null = null;
    const personas = normalizePersonas(raw.personas);
    let internalTags = normalizeStringArray((raw as { internalTags?: unknown }).internalTags);
    let espTags = normalizeStringArray((raw as { espTags?: unknown }).espTags);

    if (rawDomainPrefs && typeof rawDomainPrefs === 'object' && !Array.isArray(rawDomainPrefs)) {
      const prefsObject = rawDomainPrefs as Record<string, unknown>;
      domainPreferences = normalizeStringArray(prefsObject.domains);
      const candidateCredentials = prefsObject.espCredentials;
      if (candidateCredentials && typeof candidateCredentials === 'object') {
        const credObj = candidateCredentials as Record<string, unknown>;
        const accountId = typeof credObj.accountId === 'string' ? credObj.accountId : credObj.accountId == null ? null : String(credObj.accountId);
        const passwordRaw = typeof credObj.password === 'string' ? credObj.password : credObj.password == null ? null : String(credObj.password);
        const apiKeyRaw = typeof credObj.apiKey === 'string' ? credObj.apiKey : credObj.apiKey == null ? null : String(credObj.apiKey);
        espCredentials = {
          accountId,
          password: revealSecret(passwordRaw),
          apiKey: revealSecret(apiKeyRaw),
        };
      }
      const candidateInternal = prefsObject.internalTags;
      if (candidateInternal !== undefined) {
        internalTags = normalizeStringArray(candidateInternal);
      }
      const candidateEspTags = prefsObject.espTags;
      if (candidateEspTags !== undefined) {
        espTags = normalizeStringArray(candidateEspTags);
      }
    }

    return {
      ...raw,
      website: (raw as { website?: string | null }).website, // Explicitly preserve website field
      domainPreferences,
      personas,
      internalTags,
      espTags,
      espCredentials,
      registrarPassword: revealSecret((raw as { registrarPassword?: string | null }).registrarPassword),
    };
  }, [order?.onboardingData]);

  const isOwn =
    (onboarding?.domainSource ?? (onboarding?.domainPreferences?.length ? 'OWN' : 'BUY_FOR_ME')) === 'OWN';

  const pricePerInbox = useMemo(() => {
    switch (order?.productType) {
      case 'RESELLER':
        return 300;
      case 'EDU':
        return 150;
      case 'LEGACY':
        return 250;
      case 'PREWARMED':
        return 700;
      case 'AWS':
        return 125;
      case 'MICROSOFT':
        return 6000; // $60 per domain
      default:
        return 0;
    }
  }, [order?.productType]);

  const computedTotal = useMemo(() => {
    if (!order) return null;
    if (typeof order.totalAmount === 'number') return order.totalAmount;
    return order.quantity * pricePerInbox;
  }, [order, pricePerInbox]);

  const personas = onboarding?.personas ?? [];
  const providedDomains = onboarding?.providedDomains ?? [];
  const domainPreferences = onboarding?.domainPreferences ?? [];
  const domainList = providedDomains.length > 0 ? providedDomains : domainPreferences;
  const internalTags = onboarding?.internalTags ?? [];
  const espTags = onboarding?.espTags ?? [];

  const totalInboxes = order?.inboxes.length ?? 0;
  const inboxesByStatus = useMemo(() => {
    if (!order) return [];
    const map = new Map<string, number>();
    order.inboxes.forEach((inbox) => {
      const status = inbox.status ?? 'UNKNOWN';
      map.set(status, (map.get(status) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([status, count]) => ({
      status,
      count,
    }));
  }, [order]);

  const domainCount = order?.domains.length ?? 0;
  const canFulfill = useMemo(() => {
    if (!order) return false;
    if (isOwn) {
      return Boolean(uniformPassword.trim()) || Boolean(csvData && csvData.length > 0);
    }
    return Boolean(csvData && csvData.length > 0);
  }, [order, isOwn, csvData, uniformPassword]);

  const handleCsvParsed = (rows: CSVRow[]) => {
    setCsvData(rows);
    setFulfillmentMessage(null);
  };

  const handleMarkAsFulfilled = async () => {
    if (!order) return;
    setFulfilling(true);
    setFulfillmentMessage(null);

    try {
      const result = await markOrderAsFulfilledAction(
        order.id,
        csvData || undefined,
        isOwn ? uniformPassword || undefined : undefined,
      );

      if (result.success) {
        setFulfillmentMessage(result.message || 'Order fulfilled successfully!');
        // Force a fresh fetch to bypass any cache - use timestamp to bust cache
        const response = await fetch(`/api/admin/orders/${order.id}?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (response.ok) {
          const updatedOrder = await response.json();
          setOrder(updatedOrder);
          setCsvData(null);
          setUniformPassword('');
        }
      } else {
        setFulfillmentMessage(`Error: ${result.error}`);
      }
    } catch (err) {
      setFulfillmentMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setFulfilling(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-300">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-300">Error: {error}</div>;
  }

  if (!order) {
    return <div className="text-center text-gray-300">Order not found</div>;
  }

  const statusClass = statusStyles[order.status] ?? statusStyles.DEFAULT;
  const isFulfilled = order.status === 'FULFILLED';
  const isCancelled = order.status === 'CANCELLED';
  const hasSubscription = Boolean(order.stripeSubscriptionId);
  const subscriptionStatusLabel = hasSubscription ? (isCancelled ? 'Cancelled' : 'Active') : '—';

  const handleDownloadCsv = () => {
    const rows: string[][] = [
      ['Field', 'Value'],
      ['Order ID', order.id],
      ['Status', order.status],
      ['Product', order.productType],
      ['Quantity', String(order.quantity)],
      ['Total Amount (cents)', String(order.totalAmount ?? order.quantity * 300)],
      ['Customer Name', order.clerkUserName ?? ''],
      ['Customer Email', order.clerkUserEmail ?? ''],
      ['Clerk User ID', order.clerkUserId ?? ''],
      ['Business Name', onboarding?.businessType ?? ''],
      ['Website', onboarding?.website ?? ''],
      ['Domain Source', toTitle(onboarding?.domainSource ?? (isOwn ? 'OWN' : 'BUY_FOR_ME'))],
      ['Stripe Subscription', order.stripeSubscriptionId ?? ''],
      ['Subscription Status', subscriptionStatusLabel],
      ['Cancelled On', order.cancelledAt ? formatDate(order.cancelledAt) : ''],
      ['Cancellation Reason', order.cancellationReason ?? ''],
      ['ESP Account ID', onboarding?.registrarUsername ?? ''],
      ['ESP Password', onboarding?.registrarPassword ?? ''],
      ['Warmup Tool', onboarding?.espProvider ?? ''],
      ['Inboxes per Domain', onboarding?.inboxesPerDomain != null ? String(onboarding.inboxesPerDomain) : ''],
      ['Domains Needed', onboarding?.calculatedDomainCount != null ? String(onboarding.calculatedDomainCount) : ''],
      ['Personas', personas.map((persona) => `${persona.firstName} ${persona.lastName}`.trim()).join('; ')],
      ['Inboxes', order.inboxes.map((inbox) => inbox.email).join('; ')],
      ['Domains', order.domains.map((domain) => domain.domain).join('; ')],
      ['Special Requirements', onboarding?.specialRequirements ?? ''],
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `admin-order-${order.id}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link href="/admin/orders" className="text-xs uppercase tracking-wide text-gray-500 hover:text-gray-300">
            ← Back to Orders
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white">Order {order.id}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}>
              {toTitle(order.status)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-400">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/orders/${order.id}/edit`}
            className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
          >
            Edit Order
          </Link>
          <button
            onClick={handleDownloadCsv}
            className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-100 transition hover:border-indigo-500 hover:text-white"
          >
            Download CSV
          </button>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}
          >
            {isFulfilled ? 'Fulfilled' : order.status === 'PENDING' ? 'Pending' : order.status === 'CANCELLED' ? 'Cancelled' : toTitle(order.status)}
          </span>
          {!isFulfilled && !isCancelled && (
            <button
              onClick={handleMarkAsFulfilled}
              disabled={!canFulfill || fulfilling}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 shadow-sm shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/40 disabled:text-emerald-900"
            >
              {fulfilling ? 'Processing…' : 'Mark as Fulfilled'}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Product"
          value={toTitle(order.productType)}
          sublabel={`Personas: ${personas.length || '0'}`}
        />
        <StatCard
          label="Quantity"
          value={`${order.quantity}`}
          sublabel={`Inboxes created: ${totalInboxes}`}
        />
        <StatCard
          label="Estimated Total"
          value={formatCurrency(computedTotal)}
          sublabel={pricePerInbox ? `$${(pricePerInbox / 100).toFixed(2)} per inbox` : undefined}
        />
        <StatCard
          label="Domains"
          value={`${domainCount}`}
          sublabel={
            onboarding?.calculatedDomainCount
              ? `Needed: ${onboarding.calculatedDomainCount}`
              : domainList.length
                ? `${domainList.length} provided`
                : undefined
          }
        />
      </div>

      {/* Subscription and Cancellation Details */}
      {(hasSubscription || isCancelled) && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Subscription Details</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {order.stripeSubscriptionId && (
              <InfoRow
                label="Stripe Subscription ID"
                value={<span className="font-mono text-xs">{order.stripeSubscriptionId}</span>}
              />
            )}
            <InfoRow
              label="Subscription Status"
              value={<span className="capitalize">{subscriptionStatusLabel}</span>}
            />
            {isCancelled && order.cancelledAt && (
              <InfoRow
                label="Cancelled On"
                value={formatDate(order.cancelledAt)}
              />
            )}
            {isCancelled && order.cancellationReason && (
              <InfoRow
                label="Cancellation Reason"
                value={order.cancellationReason}
              />
            )}
          </div>
          {isCancelled && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-sm text-red-300">
                ⚠️ This order has been cancelled. Fulfillment is disabled and related inboxes/domains have been marked as deleted.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoRow label="Customer name" value={order.clerkUserName || '—'} />
            <InfoRow
              label="Customer email"
              value={
                order.clerkUserEmail ? (
                  <a href={`mailto:${order.clerkUserEmail}`} className="text-indigo-200 hover:text-indigo-100">
                    {order.clerkUserEmail}
                  </a>
                ) : '—'
              }
            />
            <InfoRow label="Customer ID (Clerk)" value={order.clerkUserId || '—'} />
            <InfoRow label="Domain Source" value={toTitle(onboarding?.domainSource ?? (isOwn ? 'OWN' : 'BUY_FOR_ME'))} />
            <InfoRow label="Primary Forwarding URL" value={onboarding?.website || '—'} />
            <InfoRow
              label="Warmup Tool"
              value={onboarding?.espProvider ? toTitle(onboarding.espProvider) : '—'}
            />
            <InfoRow
              label="ESP Account ID"
              value={
                onboarding?.espCredentials?.accountId
                  ? <span className="font-mono text-xs text-indigo-200">{onboarding.espCredentials.accountId}</span>
                  : '—'
              }
            />
            <InfoRow
              label="ESP Password"
              value={
                onboarding?.espCredentials?.password
                  ? <span className="font-mono text-xs text-indigo-200">{onboarding.espCredentials.password}</span>
                  : '—'
              }
            />
            <InfoRow
              label="ESP API Key"
              value={
                onboarding?.espCredentials?.apiKey
                  ? <span className="font-mono text-xs text-indigo-200 break-all">{onboarding.espCredentials.apiKey}</span>
                  : '—'
              }
            />
            <InfoRow
              label="Inboxes per Domain"
              value={
                onboarding?.inboxesPerDomain != null
                  ? onboarding.inboxesPerDomain.toString()
                  : isOwn
                    ? 'Provided by buyer'
                    : 'Auto-calculated'
              }
            />
            <InfoRow
              label="Special Requirements"
              value={onboarding?.specialRequirements ? (
                <span className="block max-w-prose text-sm text-gray-200">{onboarding.specialRequirements}</span>
              ) : (
                '—'
              )}
            />
          </div>

          {/* Registrar Credentials Section (for OWN domains) */}
          {onboarding?.domainSource === 'OWN' && onboarding?.domainRegistrar && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-5">
              <h2 className="text-sm font-semibold text-blue-300 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Registrar Credentials
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow
                  label="Registrar"
                  value={<span className="font-semibold text-blue-200">{onboarding.domainRegistrar}</span>}
                />
                <InfoRow
                  label="Admin Email Invite"
                  value={
                    <span className="font-mono text-sm text-blue-200">
                      {onboarding.registrarAdminEmail || 'team@inboxnavigator.com'}
                    </span>
                  }
                />
                <InfoRow
                  label="Username"
                  value={
                    onboarding.registrarUsername ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-blue-200">{onboarding.registrarUsername}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(onboarding.registrarUsername!)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Copy
                        </button>
                      </div>
                    ) : (
                      '—'
                    )
                  }
                />
                <InfoRow
                  label="Password"
                  value={
                    onboarding.registrarPassword ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-blue-200">{onboarding.registrarPassword}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(onboarding.registrarPassword!)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Copy
                        </button>
                      </div>
                    ) : (
                      '—'
                    )
                  }
                />
              </div>
              <div className="mt-4 rounded-lg border border-blue-400/30 bg-blue-400/5 p-3">
                <p className="text-sm text-blue-200">
                  ℹ️ Make sure <span className="font-mono font-semibold">team@inboxnavigator.com</span> has been invited as an admin to the customer&rsquo;s {onboarding.domainRegistrar} account.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-white">Domain Plan</h2>
              <span className="text-xs text-gray-500">
                {domainList.length > 0 ? `${domainList.length} domain${domainList.length > 1 ? 's' : ''}` : 'Not provided'}
              </span>
            </div>
            {domainList.length === 0 ? (
              <p className="text-sm text-gray-500">
                No domains were listed during onboarding. {isOwn ? 'Provide the customer-supplied domains via CSV when ready.' : 'Use the CSV uploader to seed the domains you purchase.'}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {domainList.map((domain) => (
                  <span
                    key={domain}
                    className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1 text-sm text-gray-100"
                  >
                    {domain}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Personas</h2>
              <span className="text-xs text-gray-500">{personas.length} configured</span>
            </div>
            {personas.length === 0 ? (
              <p className="text-sm text-gray-500">No personas were supplied. Expect to request them from the customer if required.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {personas.map((persona, index) => (
                  <PersonaCard
                    key={`${persona.firstName}-${persona.lastName}-${index}`}
                    persona={persona}
                    index={index}
                    showDownloadLink={isHydrated}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <h2 className="text-sm font-semibold text-white">Tags & Preferences</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Internal Tags</p>
                <div className="mt-2">
                  <TagList items={internalTags} emptyMessage="No internal tags" />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">ESP Tags</p>
                <div className="mt-2">
                  <TagList items={espTags} emptyMessage="No ESP tags" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-semibold text-white">Inbox Status</h2>
                {totalInboxes > 0 && (
                  <button
                    onClick={() => setShowBulkUpdateModal(true)}
                    className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Bulk Update CSV
                  </button>
                )}
              </div>
              <span className="text-xs text-gray-500">{totalInboxes} total inboxes</span>
            </div>
            {totalInboxes === 0 ? (
              <p className="text-sm text-gray-500">
                No inbox records yet. Once fulfillment runs, inboxes will appear here with their latest state.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {inboxesByStatus.map(({ status, count }) => (
                  <div
                    key={status}
                    className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/70 px-3 py-2"
                  >
                    <span className="text-xs uppercase tracking-wide text-gray-400">{toTitle(status)}</span>
                    <span className="text-sm font-semibold text-white">{count}</span>
                  </div>
                ))}
              </div>
            )}

            {order.inboxes.length > 0 && (
              <div className="mt-4 overflow-x-auto rounded-lg border border-gray-800">
                <table className="min-w-full divide-y divide-gray-800 text-sm">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Persona</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Password</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {order.inboxes.map((inbox) => (
                      <tr key={inbox.id} className="hover:bg-gray-800/50">
                        <td className="px-4 py-2 font-mono text-xs text-indigo-200">{inbox.email}</td>
                        <td className="px-4 py-2 text-gray-200">{[inbox.firstName, inbox.lastName].filter(Boolean).join(' ') || '—'}</td>
                        <td className="px-4 py-2 text-gray-300">{toTitle(inbox.status)}</td>
                        <td className="px-4 py-2 text-gray-400">{inbox.password ? 'Set' : '—'}</td>
                        <td className="px-4 py-2">
                          <Link
                            href={`/admin/orders/${order.id}/inboxes/${inbox.id}/edit`}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Domains</h2>
              <span className="text-xs text-gray-500">{domainCount} records</span>
            </div>
            {domainCount === 0 ? (
              <p className="text-sm text-gray-500">
                No domain records yet. {isOwn ? 'Domains will appear after CSV upload or manual provisioning.' : 'Upload CSV to seed domains.'}
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-800">
                <table className="min-w-full divide-y divide-gray-800 text-sm">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Domain</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Inboxes</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Forwarding</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {order.domains.map((domain) => (
                      <tr key={domain.id} className="hover:bg-gray-800/50">
                        <td className="px-4 py-2 font-mono text-xs text-indigo-200">{domain.domain}</td>
                        <td className="px-4 py-2 text-gray-300">{toTitle(domain.status)}</td>
                        <td className="px-4 py-2 text-gray-200">{domain.inboxCount}</td>
                        <td className="px-4 py-2 text-gray-400">{domain.forwardingUrl || '—'}</td>
                        <td className="px-4 py-2">
                          <Link
                            href={`/admin/orders/${order.id}/domains/${domain.id}/edit`}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`rounded-xl border border-gray-800 bg-gray-900/80 p-5 space-y-6 ${isCancelled ? 'opacity-50' : ''}`}>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {isOwn ? 'Fulfillment — Customer Domains' : 'Fulfillment — Provision Domains'}
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                {isCancelled 
                  ? 'Fulfillment is disabled for cancelled orders.'
                  : isOwn
                    ? 'Set one password for every inbox. Customer-domain orders do not require separate CSV uploads.'
                    : 'Upload the provisioning CSV to create domains and inboxes in one step. Include one row per inbox with its persona and password.'}
              </p>
            </div>

            {!isCancelled && (
              <>
                {isOwn ? (
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-wide text-gray-500">Uniform password</label>
                    <input
                      type="password"
                      placeholder="Apply a single password to all inboxes"
                      value={uniformPassword}
                      onChange={(e) => setUniformPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500">
                      Leave blank if you prefer to manage passwords via CSV.
                    </p>
                  </div>
                ) : null}

                {!isOwn && (
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-wide text-gray-500">Provisioning CSV</label>
                    <CSVUpload
                      expectedHeaders={['domain', 'email', 'first_name', 'last_name', 'password']}
                      optionalHeaders={['forwardingUrl']}
                      onParsed={handleCsvParsed}
                      cta="Upload CSV with domain,email,first_name,last_name,password (+forwardingUrl optional)"
                    />
                    {csvData && csvData.length > 0 ? (
                      <p className="text-xs text-emerald-400">{csvData.length} rows ready to process.</p>
                    ) : (
                      <p className="text-xs text-gray-500">Columns: domain,email,first_name,last_name,password,forwardingUrl(optional)</p>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="text-xs uppercase tracking-wide text-gray-500">Workflow tips</h3>
                  <ul className="mt-2 space-y-1 text-sm text-gray-400">
                    <li>• &ldquo;Buy for me&rdquo; orders require a CSV before fulfillment can run.</li>
                    <li>• Customer-domain orders can be fulfilled with a uniform password (CSV optional).</li>
                    <li>• After marking fulfilled, the dashboard refreshes automatically.</li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {fulfillmentMessage ? (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                fulfillmentMessage.startsWith('Error')
                  ? 'border-red-500/40 bg-red-500/10 text-red-300'
                  : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              }`}
            >
              {fulfillmentMessage}
            </div>
          ) : null}
        </div>
      </div>

      {/* Bulk Inbox Update Modal */}
      <BulkInboxUpdate
        orderId={order.id}
        isOpen={showBulkUpdateModal}
        onClose={() => setShowBulkUpdateModal(false)}
      />
    </div>
  );
}
