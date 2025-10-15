"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import type { Prisma } from "@prisma/client";
import { GlobeAltIcon, FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { TableSkeleton } from "@/components/skeletons";
import { endOfDay, format, startOfDay, subDays } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  LIVE: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  PENDING: "bg-amber-400/25 text-amber-100 border border-amber-300/40",
  DELETED: "bg-red-500/15 text-red-300 border border-red-500/30",
  DECOMMISSIONED: "bg-red-500/15 text-red-300 border border-red-500/30",
  CANCELLED: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
  DEFAULT: "bg-white/10 text-white/50 border border-white/10",
};

const STATUS_DISPLAY_ORDER = ["LIVE", "PENDING", "DECOMMISSIONED", "DELETED"];

const STATUS_FILTER_MATCHERS: Record<string, string[]> = {
  DECOMMISSIONED: ["DECOMMISSIONED", "DELETED"],
};

const PRODUCT_DISPLAY_ORDER = ["GOOGLE", "PREWARMED", "MICROSOFT"];

const PRODUCT_LABELS: Record<string, string> = {
  GOOGLE: "Google",
  PREWARMED: "Prewarmed",
  MICROSOFT: "Microsoft",
};

type DomainRecord = Prisma.DomainGetPayload<{
  include: {
    order: {
      select: {
        id: true;
        productType: true;
        quantity: true;
        status: true;
        subscriptionStatus: true;
        cancelledAt: true;
      };
    };
  };
}>;

type Props = {
  domains: DomainRecord[];
  error?: string | null;
  isLoading?: boolean;
};

type DatePreset = "7" | "30" | "90" | "ALL";

type FilterState = {
  statuses: string[];
  product: string;
  tags: string[];
  business: string;
  orderId: string;
  forwarding: string;
  datePreset: DatePreset;
  dateRange: { from: Date | null; to: Date | null };
};

const DEFAULT_FILTERS: FilterState = {
  statuses: [],
  product: "",
  tags: [],
  business: "",
  orderId: "",
  forwarding: "",
  datePreset: "ALL",
  dateRange: { from: null, to: null },
};

function StatusPill({ status, order }: { status: string; order?: { subscriptionStatus?: string; status?: string } }) {
  // Check if the order is cancelled
  const isOrderCancelled = order?.subscriptionStatus === 'cancel_at_period_end' || order?.status === 'CANCELLED';
  const displayStatus = isOrderCancelled ? 'CANCELLED' : status;
  const pillClass = STATUS_COLORS[displayStatus.toUpperCase()] ?? STATUS_COLORS.DEFAULT;
  
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${pillClass}`}>
      {displayStatus.toLowerCase()}
    </span>
  );
}

function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, "MMM d, yyyy");
}

function downloadCsv(rows: string[][], filename: string) {
  const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function applyDatePreset(preset: DatePreset) {
  const now = new Date();
  switch (preset) {
    case "7": {
      const from = startOfDay(subDays(now, 7));
      return { from, to: endOfDay(now) };
    }
    case "30": {
      const from = startOfDay(subDays(now, 30));
      return { from, to: endOfDay(now) };
    }
    case "90": {
      const from = startOfDay(subDays(now, 90));
      return { from, to: endOfDay(now) };
    }
    default:
      return { from: null, to: null };
  }
}

function getProductLabel(value?: string | null) {
  if (!value) return "—";
  return PRODUCT_LABELS[value] ?? value;
}

function getStatusLabel(value: string) {
  switch (value) {
    case "LIVE":
      return "Live";
    case "PENDING":
      return "Pending";
    case "DECOMMISSIONED":
      return "Decommissioned";
    case "DELETED":
      return "Deleted";
    default:
      return value;
  }
}

export default function DomainsClient({ domains, error, isLoading = false }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const safeDomains = useMemo(() => domains ?? [], [domains]);

  const productOptions = useMemo(() => {
    const set = new Set<string>();
    safeDomains.forEach((domain) => {
      if (domain.order?.productType) set.add(domain.order.productType);
    });
    return Array.from(set).sort((a, b) => {
      const aIndex = PRODUCT_DISPLAY_ORDER.indexOf(a);
      const bIndex = PRODUCT_DISPLAY_ORDER.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [safeDomains]);

  const productFilterOptions = productOptions.length ? productOptions : PRODUCT_DISPLAY_ORDER;

  const uniqueTags = useMemo(() => {
    const set = new Set<string>();
    safeDomains.forEach((domain) => domain.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [safeDomains]);

  const uniqueBusinesses = useMemo(() => {
    const set = new Set<string>();
    safeDomains.forEach((domain) => {
      if (domain.businessName) set.add(domain.businessName);
    });
    return Array.from(set).sort();
  }, [safeDomains]);

  const totalInboxSlots = useMemo(() => safeDomains.reduce((sum, domain) => sum + domain.inboxCount, 0), [safeDomains]);

  const filteredDomains = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    const dateFrom = filters.dateRange.from ? startOfDay(filters.dateRange.from) : null;
    const dateTo = filters.dateRange.to ? endOfDay(filters.dateRange.to) : null;

    return safeDomains.filter((domain) => {
      if (!showDeleted && domain.status === 'DELETED') return false;
      const haystack = [
        domain.domain,
        domain.forwardingUrl ?? "",
        domain.businessName ?? "",
        domain.order?.id ?? "",
        domain.order?.productType ?? "",
        ...domain.tags,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchLower ? haystack.includes(searchLower) : true;
      const matchesStatus = filters.statuses.length
        ? filters.statuses.some((status) => {
            const matchers = STATUS_FILTER_MATCHERS[status] ?? [status];
            return matchers.includes(domain.status);
          })
        : true;
      const matchesProduct = filters.product ? domain.order?.productType === filters.product : true;
      const matchesTags = filters.tags.length ? domain.tags.some((tag) => filters.tags.includes(tag)) : true;
      const matchesBusiness = filters.business
        ? (domain.businessName ?? "").toLowerCase().includes(filters.business.toLowerCase())
        : true;
      const matchesOrder = filters.orderId ? domain.order?.id === filters.orderId : true;
      const matchesForwarding = filters.forwarding
        ? (domain.forwardingUrl ?? "").toLowerCase().includes(filters.forwarding.toLowerCase())
        : true;

      let matchesDate = true;
      if (dateFrom || dateTo) {
        if (!domain.createdAt) {
          matchesDate = false;
        } else {
          const createdAt = new Date(domain.createdAt);
          if (dateFrom && createdAt < dateFrom) matchesDate = false;
          if (dateTo && createdAt > dateTo) matchesDate = false;
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesProduct &&
        matchesTags &&
        matchesBusiness &&
        matchesOrder &&
        matchesForwarding &&
        matchesDate
      );
    });
  }, [safeDomains, searchTerm, filters, showDeleted]);

  if (isLoading) {
    return (
      <div className="space-y-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Domains</h1>
            <p className="mt-2 text-sm text-white/60">Manage your email domains</p>
          </div>
        </div>
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  }

  if (error === "UNAUTHORIZED") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-white/10 bg-white/10/5 px-10 py-16 text-center text-white/70">
        Sign in to review the domains under management.
      </div>
    );
  }

  if (error === "FAILED") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10 px-10 py-16 text-center text-red-200">
        <h2 className="text-lg font-semibold text-red-200">We couldn&apos;t load your domains.</h2>
        <p className="mt-3 max-w-md text-sm text-red-200/80">Please refresh the page or try again later.</p>
      </div>
    );
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allFilteredSelected = filteredDomains.length > 0 && filteredDomains.every((domain) => selectedIds.has(domain.id));

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredDomains.forEach((domain) => next.delete(domain.id));
      } else {
        filteredDomains.forEach((domain) => next.add(domain.id));
      }
      return next;
    });
  };

  const buildDomainCsvRows = (domainList: DomainRecord[]): string[][] => [
    [
      "domain",
      "status",
      "inbox_count",
      "forwarding_url",
      "tags",
      "business_name",
      "order_id",
      "order_status",
      "product_type",
      "created_at",
    ],
    ...domainList.map((domain) => [
      domain.domain,
      domain.status,
      String(domain.inboxCount),
      domain.forwardingUrl ?? "",
      domain.tags.join(";"),
      domain.businessName ?? "",
      domain.order?.id ?? "",
      domain.order?.status ?? "",
      domain.order?.productType ?? "",
      domain.createdAt.toISOString(),
    ]),
  ];

  const handleExportSelected = () => {
    if (!selectedIds.size) return;
    const selectedDomains = safeDomains.filter((domain) => selectedIds.has(domain.id));
    if (!selectedDomains.length) return;
    downloadCsv(buildDomainCsvRows(selectedDomains), "domains-selected.csv");
  };

  const handleExportView = () => {
    const source = selectedIds.size
      ? safeDomains.filter((domain) => selectedIds.has(domain.id))
      : filteredDomains;
    if (!source.length) return;
    const filename = selectedIds.size ? "domains-selected.csv" : "domains-filtered.csv";
    downloadCsv(buildDomainCsvRows(source), filename);
  };

  const setFilterValue = <Key extends keyof FilterState>(key: Key, value: FilterState[Key]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleStatus = (status: string) => {
    setFilters((prev) => {
      const hasStatus = prev.statuses.includes(status);
      const statuses = hasStatus ? prev.statuses.filter((value) => value !== status) : [...prev.statuses, status];
      return { ...prev, statuses };
    });
  };

  const toggleTag = (tag: string) => {
    setFilters((prev) => {
      const hasTag = prev.tags.includes(tag);
      const tags = hasTag ? prev.tags.filter((value) => value !== tag) : [...prev.tags, tag];
      return { ...prev, tags };
    });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchTerm("");
  };

  type FilterChip = {
    id: string;
    label: string;
    onClear: () => void;
  };

  const activeFilterChips: FilterChip[] = (() => {
    const chips: FilterChip[] = [];

    filters.statuses.forEach((status) => {
      chips.push({
        id: `status:${status}`,
        label: `Status: ${getStatusLabel(status)}`,
        onClear: () =>
          setFilters((prev) => ({ ...prev, statuses: prev.statuses.filter((value) => value !== status) })),
      });
    });

    if (filters.product) {
      chips.push({
        id: "product",
        label: `Product: ${getProductLabel(filters.product)}`,
        onClear: () => setFilterValue("product", ""),
      });
    }

    filters.tags.forEach((tag) => {
      chips.push({
        id: `tag:${tag}`,
        label: `Tag: ${tag}`,
        onClear: () => toggleTag(tag),
      });
    });

    if (filters.business) {
      chips.push({
        id: "business",
        label: `Business: ${filters.business}`,
        onClear: () => setFilterValue("business", ""),
      });
    }

    if (filters.orderId) {
      chips.push({
        id: "order",
        label: `Order ${filters.orderId.slice(0, 8)}…`,
        onClear: () => setFilterValue("orderId", ""),
      });
    }

    if (filters.forwarding) {
      chips.push({
        id: "forwarding",
        label: `Forwarding: ${filters.forwarding}`,
        onClear: () => setFilterValue("forwarding", ""),
      });
    }

    if (filters.datePreset !== "ALL" || filters.dateRange.from || filters.dateRange.to) {
      let label = "Created";
      if (filters.dateRange.from && filters.dateRange.to) {
        label = `Created: ${format(filters.dateRange.from, "MMM d")} → ${format(filters.dateRange.to, "MMM d")}`;
      } else if (filters.dateRange.from) {
        label = `Created after ${format(filters.dateRange.from, "MMM d")}`;
      } else if (filters.dateRange.to) {
        label = `Created before ${format(filters.dateRange.to, "MMM d")}`;
      } else if (filters.datePreset !== "ALL") {
        label = `Created: last ${filters.datePreset} days`;
      }

      chips.push({
        id: "created",
        label,
        onClear: () => setFilters((prev) => ({ ...prev, datePreset: "ALL", dateRange: { from: null, to: null } })),
      });
    }

    if (searchTerm) {
      chips.push({
        id: "search",
        label: `Search: ${searchTerm}`,
        onClear: () => setSearchTerm(""),
      });
    }

    return chips;
  })();

  if (!safeDomains.length) {
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
          Buy more inboxes
        </Link>
      </div>
    );
  }

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
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-[0_10px_30px_-20px_rgba(255,255,255,0.6)] transition hover:bg-white/90"
        >
          Buy more inboxes
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.6)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Total domains</p>
          <p className="mt-3 text-3xl font-semibold text-white">{domains.length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.6)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Total inbox capacity</p>
          <p className="mt-3 text-3xl font-semibold text-white">{totalInboxSlots}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_30px_60px_-45px_rgba(0,0,0,0.8)]">
        <div className="space-y-4 border-b border-white/5 px-6 py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Domains under management</h2>
              <p className="text-xs text-white/50">Forwarding configuration, inbox allocation, and status at a glance.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
              <button
                onClick={handleExportView}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/30 hover:text-white"
              >
                Export view
              </button>
              <button
                onClick={handleExportSelected}
                disabled={!selectedIds.size}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-white/60 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:border-white/5 disabled:text-white/30"
              >
                Export selected
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search domain, business, order…"
                className="flex-1 min-w-[220px] rounded-full border border-white/15 bg-black/25 px-4 py-2 text-sm text-white focus:border-white/35 focus:outline-none focus:ring-0"
              />
              <select
                value={filters.product}
                onChange={(event) => setFilterValue("product", event.target.value)}
                className="rounded-full border border-white/15 bg-black/25 px-3 py-2 text-xs text-white focus:border-white/35 focus:outline-none focus:ring-0"
              >
                <option value="">All products</option>
                {productFilterOptions.map((product) => (
                  <option key={product} value={product}>
                    {getProductLabel(product)}
                  </option>
                ))}
              </select>
              <select
                value={filters.business}
                onChange={(event) => setFilterValue("business", event.target.value)}
                className="rounded-full border border-white/15 bg-black/25 px-3 py-2 text-xs text-white focus:border-white/35 focus:outline-none focus:ring-0"
              >
                <option value="">All businesses</option>
                {uniqueBusinesses.map((business) => (
                  <option key={business} value={business}>
                    {business}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs text-white">
                {STATUS_DISPLAY_ORDER.map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`rounded-full px-3 py-1 font-medium uppercase tracking-wide ${
                      filters.statuses.includes(status)
                        ? STATUS_COLORS[status] ?? STATUS_COLORS.DEFAULT
                        : 'bg-transparent text-white/50 border border-white/15'
                    }`}
                  >
                    {getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>
            <Popover.Root open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <Popover.Trigger asChild>
                <button className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/30 hover:text-white">
                  <FunnelIcon className="h-4 w-4" /> More filters
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content sideOffset={8} align="end" className="z-50 w-72 rounded-2xl border border-white/15 bg-black/90 p-4 text-white shadow-xl backdrop-blur">
                  <div className="space-y-4 text-xs text-white/70">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-[0.3em] text-white/40">Show deleted domains</span>
                      <label className="inline-flex items-center gap-2 text-white/70">
                        <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} />
                        <span>Show</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-[0.3em] text-white/40">Forwarding contains</label>
                      <input
                        value={filters.forwarding}
                        onChange={(event) => setFilterValue("forwarding", event.target.value)}
                        placeholder="domain.com"
                        className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-xs focus:border-white/35 focus:outline-none focus:ring-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-[0.3em] text-white/40">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {uniqueTags.length ? (
                          uniqueTags.map((tag) => {
                            const active = filters.tags.includes(tag);
                            return (
                              <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`rounded-full px-3 py-1 ${active ? 'bg-white text-black' : 'border border-white/20 text-white/60'}`}
                              >
                                {tag}
                              </button>
                            );
                          })
                        ) : (
                          <span className="text-white/40">No tags yet.</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-[0.3em] text-white/40">Order ID</label>
                      <input
                        value={filters.orderId}
                        onChange={(event) => setFilterValue("orderId", event.target.value)}
                        placeholder="Lookup by order"
                        className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-xs focus:border-white/35 focus:outline-none focus:ring-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-[0.3em] text-white/40">Created</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={filters.dateRange.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : ''}
                          onChange={(event) => {
                            const value = event.target.value ? startOfDay(new Date(event.target.value)) : null;
                            setFilters((prev) => ({
                              ...prev,
                              datePreset: 'ALL',
                              dateRange: { ...prev.dateRange, from: value },
                            }));
                          }}
                          className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-xs focus:border-white/35 focus:outline-none focus:ring-0"
                        />
                        <input
                          type="date"
                          value={filters.dateRange.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : ''}
                          onChange={(event) => {
                            const value = event.target.value ? endOfDay(new Date(event.target.value)) : null;
                            setFilters((prev) => ({
                              ...prev,
                              datePreset: 'ALL',
                              dateRange: { ...prev.dateRange, to: value },
                            }));
                          }}
                          className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-xs focus:border-white/35 focus:outline-none focus:ring-0"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-white/50">
                        {(['ALL', '7', '30', '90'] as DatePreset[]).map((preset) => (
                          <button
                            key={preset}
                            onClick={() => {
                              const range = applyDatePreset(preset);
                              setFilters((prev) => ({ ...prev, datePreset: preset, dateRange: range }));
                            }}
                            className={`rounded-full px-3 py-1 ${filters.datePreset === preset ? 'bg-white/90 text-black' : 'border border-white/15'}`}
                          >
                          {preset === 'ALL' ? 'All' : `Last ${preset}d`}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <button onClick={resetFilters} className="text-xs font-medium text-white/40 hover:text-white">
                        Clear all
                      </button>
                      <button
                        onClick={() => setIsFilterSheetOpen(false)}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-white/90"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                  <Popover.Arrow className="fill-white/10" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>

          {activeFilterChips.length ? (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.id}
                  onClick={chip.onClear}
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/70 transition hover:border-white/30 hover:text-white"
                >
                  {chip.label}
                  <XMarkIcon className="h-3 w-3" />
                </button>
              ))}
              <button onClick={resetFilters} className="text-xs text-white/40 underline hover:text-white">
                Clear all filters
              </button>
            </div>
          ) : null}
        </div>
        {filteredDomains.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5 text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={handleToggleSelectAll}
                      className="h-4 w-4 cursor-pointer rounded border border-white/30 bg-black/40 text-indigo-500 focus:ring-indigo-500"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left">Domain</th>
                  <th scope="col" className="px-6 py-3 text-left">Status</th>
                  <th scope="col" className="px-6 py-3 text-left">Inbox count</th>
                  <th scope="col" className="px-6 py-3 text-left">Forwarding URL</th>
                  <th scope="col" className="px-6 py-3 text-left">Tags</th>
                  <th scope="col" className="px-6 py-3 text-left">Business</th>
                  <th scope="col" className="px-6 py-3 text-left">Product</th>
                  <th scope="col" className="px-6 py-3 text-left">Order</th>
                  <th scope="col" className="px-6 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDomains.map((domain) => (
                  <tr key={domain.id} className="transition hover:bg-white/[0.04]">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(domain.id)}
                        onChange={() => handleToggleSelect(domain.id)}
                        className="h-4 w-4 cursor-pointer rounded border border-white/30 bg-black/40 text-indigo-500 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-white/80">{domain.domain}</td>
                    <td className="px-6 py-4">
                      <StatusPill status={domain.status} order={domain.order} />
                    </td>
                    <td className="px-6 py-4 text-white/70">{domain.inboxCount}</td>
                    <td className="px-6 py-4 text-white/60">{domain.forwardingUrl || "—"}</td>
                    <td className="px-6 py-4 text-white/60">
                      {domain.tags.length ? domain.tags.slice(0, 3).join(", ") : <span className="text-white/30">—</span>}
                    </td>
                    <td className="px-6 py-4 text-white/70">{domain.businessName || "—"}</td>
                    <td className="px-6 py-4 text-white/70">{getProductLabel(domain.order?.productType)}</td>
                    <td className="px-6 py-4 font-mono text-[11px] text-white/50">
                      {domain.order?.id ? `${domain.order.id.slice(0, 8)}…` : "—"}
                    </td>
                    <td className="px-6 py-4 text-white/60">{formatDate(domain.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center text-white/60">
            <p className="text-sm">No domains match these filters.</p>
            <button
              onClick={resetFilters}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-white/80 transition hover:border-white/40 hover:text-white"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
