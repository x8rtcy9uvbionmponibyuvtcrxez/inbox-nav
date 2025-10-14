"use client";

import { useEffect, useMemo, useState, use } from 'react';
import Link from 'next/link';
import CSVUpload from '../_components/CSVUpload';
import { markOrderAsFulfilledAction, type CSVRow } from '../actions';

type Persona = { firstName: string; lastName: string; profileImage?: string | null };

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
};

type OrderData = {
  id: string;
  clerkUserId: string;
  productType: string;
  quantity: number;
  status: string;
  totalAmount?: number | null;
  createdAt: string;
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
    personaName: string;
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

function PersonaCard({ persona, index }: { persona: Persona; index: number }) {
  const initials = `${persona.firstName?.[0] ?? ''}${persona.lastName?.[0] ?? ''}`.toUpperCase();
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/60 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-200">
        {initials || index + 1}
      </div>
      <div>
        <p className="text-sm font-medium text-white">{`${persona.firstName ?? ''} ${persona.lastName ?? ''}`.trim() || 'Persona'}</p>
        {persona.profileImage ? (
          <p className="text-xs text-gray-500">Avatar supplied</p>
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

  const onboarding = useMemo(() => {
    if (!order?.onboardingData) return null;
    const raw = Array.isArray(order.onboardingData) ? order.onboardingData[0] : order.onboardingData;
    if (!raw) return null;

    const domainPreferences = normalizeStringArray(raw.domainPreferences);
    const personas = normalizePersonas(raw.personas);
    const internalTags = normalizeStringArray((raw as { internalTags?: unknown }).internalTags);
    const espTags = normalizeStringArray((raw as { espTags?: unknown }).espTags);

    return {
      ...raw,
      domainPreferences,
      personas,
      internalTags,
      espTags,
    };
  }, [order?.onboardingData]);

  const isOwn =
    (onboarding?.domainSource ?? (onboarding?.domainPreferences?.length ? 'OWN' : 'BUY_FOR_ME')) === 'OWN';

  const pricePerInbox = useMemo(() => {
    switch (order?.productType) {
      case 'GOOGLE':
        return 300;
      case 'PREWARMED':
        return 700;
      case 'MICROSOFT':
        return 5000;
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
        const response = await fetch(`/api/admin/orders/${order.id}`);
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
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}
          >
            {isFulfilled ? 'Fulfilled' : order.status === 'PENDING' ? 'Pending' : toTitle(order.status)}
          </span>
          {!isFulfilled && (
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoRow label="Clerk User" value={order.clerkUserId} />
            <InfoRow label="Domain Source" value={toTitle(onboarding?.domainSource ?? (isOwn ? 'OWN' : 'BUY_FOR_ME'))} />
            <InfoRow label="Primary Forwarding URL" value={onboarding?.website ?? '—'} />
            <InfoRow
              label="Warmup Tool"
              value={onboarding?.espProvider ? toTitle(onboarding.espProvider) : '—'}
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
                  <PersonaCard key={`${persona.firstName}-${persona.lastName}-${index}`} persona={persona} index={index} />
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
              <h2 className="text-sm font-semibold text-white">Inbox Status</h2>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {order.inboxes.map((inbox) => (
                      <tr key={inbox.id} className="hover:bg-gray-800/50">
                        <td className="px-4 py-2 font-mono text-xs text-indigo-200">{inbox.email}</td>
                        <td className="px-4 py-2 text-gray-200">{inbox.personaName}</td>
                        <td className="px-4 py-2 text-gray-300">{toTitle(inbox.status)}</td>
                        <td className="px-4 py-2 text-gray-400">{inbox.password ? 'Set' : '—'}</td>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {order.domains.map((domain) => (
                      <tr key={domain.id} className="hover:bg-gray-800/50">
                        <td className="px-4 py-2 font-mono text-xs text-indigo-200">{domain.domain}</td>
                        <td className="px-4 py-2 text-gray-300">{toTitle(domain.status)}</td>
                        <td className="px-4 py-2 text-gray-200">{domain.inboxCount}</td>
                        <td className="px-4 py-2 text-gray-400">{domain.forwardingUrl || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-5 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-white">
                {isOwn ? 'Fulfillment — Customer Domains' : 'Fulfillment — Provision Domains'}
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                {isOwn
                  ? 'Set one password for every inbox or upload a CSV with individual passwords when you have them.'
                  : 'Upload the provisioning CSV to create domains and inboxes in one step. Include one row per inbox with its persona and password.'}
              </p>
            </div>

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

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wide text-gray-500">
                {isOwn ? 'Password CSV (optional)' : 'Provisioning CSV'}
              </label>
              <CSVUpload
                expectedHeaders={isOwn ? ['email', 'password'] : ['domain', 'email', 'personaName', 'password', 'forwardingUrl']}
                onParsed={handleCsvParsed}
                cta={isOwn ? 'Upload CSV with email,password' : 'Upload CSV with domain,email,personaName,password[,forwardingUrl]'}
              />
              {csvData && csvData.length > 0 ? (
                <p className="text-xs text-emerald-400">{csvData.length} rows ready to process.</p>
              ) : (
                <p className="text-xs text-gray-500">
                  {isOwn
                    ? 'Columns: email,password'
                    : 'Columns: domain,email,personaName,password,forwardingUrl(optional)'}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wide text-gray-500">Workflow tips</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-400">
                <li>• “Buy for me” orders require a CSV before fulfillment can run.</li>
                <li>• Customer-domain orders can be fulfilled with a CSV, a uniform password, or both.</li>
                <li>• After marking fulfilled, the dashboard refreshes automatically.</li>
              </ul>
            </div>
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
    </div>
  );
}
