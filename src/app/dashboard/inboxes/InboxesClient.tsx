"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import type { Prisma } from "@prisma/client";
import { InboxIcon, SparklesIcon, FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { TableSkeleton } from "@/components/skeletons";
import { endOfDay, format, startOfDay, subDays } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  LIVE: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  PENDING: "bg-amber-400/25 text-amber-100 border border-amber-300/40",
  DELETED: "bg-red-500/15 text-red-300 border border-red-500/30",
  CANCELLED: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
  DEFAULT: "bg-white/10 text-white/50 border border-white/10",
};

const STATUS_DISPLAY_ORDER = ["LIVE", "PENDING", "DELETED"];
const PRODUCT_DISPLAY_ORDER = ["GOOGLE", "PREWARMED", "MICROSOFT"];

const PRODUCT_LABELS: Record<string, string> = {
  GOOGLE: "Google",
  PREWARMED: "Prewarmed",
  MICROSOFT: "Microsoft",
};

type InboxRecord = Prisma.InboxGetPayload<{
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
  inboxes: InboxRecord[];
  error?: string | null;
  isLoading?: boolean;
};

type DatePreset = "7" | "30" | "90" | "ALL";

type FilterState = {
  statuses: string[];
  product: string;
  persona: string;
  tags: string[];
  business: string;
  orderId: string;
  platforms: string[];
  datePreset: DatePreset;
  dateRange: { from: Date | null; to: Date | null };
};

const DEFAULT_FILTERS: FilterState = {
  statuses: [],
  product: "",
  persona: "",
  tags: [],
  business: "",
  orderId: "",
  platforms: [],
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

function calculateAverageAge(inboxList: InboxRecord[]): number {
  if (!inboxList.length) return 0;
  const now = Date.now();
  const totalDays = inboxList.reduce((sum, inbox) => {
    const createdAt = inbox.createdAt ? new Date(inbox.createdAt).getTime() : now;
    const diff = Math.max(0, now - createdAt);
    return sum + diff / (1000 * 60 * 60 * 24);
  }, 0);
  const average = totalDays / inboxList.length;
  return Number.isFinite(average) ? average : 0;
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

function parseInboxDomain(inbox: InboxRecord) {
  if (inbox.forwardingDomain && inbox.forwardingDomain !== "-") {
    return inbox.forwardingDomain;
  }
  if (inbox.email.includes("@")) {
    return inbox.email.split("@")[1] ?? "";
  }
  return "";
}

function getProductLabel(value?: string | null) {
  if (!value) return "—";
  return PRODUCT_LABELS[value] ?? value;
}

export default function InboxesClient({ inboxes, error, isLoading = false }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const safeInboxes = useMemo(() => inboxes ?? [], [inboxes]);

  const statusOptions = useMemo(() => {
    const unique = new Set<string>(STATUS_DISPLAY_ORDER);
    safeInboxes.forEach((inbox) => {
      if (inbox.status) unique.add(inbox.status);
    });
    return Array.from(unique).sort((a, b) => {
      const aIndex = STATUS_DISPLAY_ORDER.indexOf(a);
      const bIndex = STATUS_DISPLAY_ORDER.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [safeInboxes]);

  const productOptions = useMemo(() => {
    const set = new Set<string>();
    safeInboxes.forEach((inbox) => {
      if (inbox.order?.productType) set.add(inbox.order.productType);
    });
    return Array.from(set).sort((a, b) => {
      const aIndex = PRODUCT_DISPLAY_ORDER.indexOf(a);
      const bIndex = PRODUCT_DISPLAY_ORDER.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [safeInboxes]);

  const uniquePersonas = useMemo(() => {
    const set = new Set<string>();
    safeInboxes.forEach((inbox) => {
      if (inbox.personaName) set.add(inbox.personaName);
    });
    return Array.from(set).sort();
  }, [safeInboxes]);

  const uniqueTags = useMemo(() => {
    const set = new Set<string>();
    safeInboxes.forEach((inbox) => inbox.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [safeInboxes]);

  const uniquePlatforms = useMemo(() => {
    const set = new Set<string>();
    safeInboxes.forEach((inbox) => {
      if (inbox.espPlatform) set.add(inbox.espPlatform);
    });
    return Array.from(set).sort();
  }, [safeInboxes]);

  const uniqueBusinesses = useMemo(() => {
    const set = new Set<string>();
    safeInboxes.forEach((inbox) => {
      if (inbox.businessName) set.add(inbox.businessName);
    });
    return Array.from(set).sort();
  }, [safeInboxes]);

  const topBusinessSuggestions = useMemo(() => {
    const counts = new Map<string, number>();
    safeInboxes.forEach((inbox) => {
      if (!inbox.businessName) return;
      counts.set(inbox.businessName, (counts.get(inbox.businessName) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([business]) => business);
  }, [safeInboxes]);

  const uniqueOrders = useMemo(() => {
    const set = new Set<string>();
    safeInboxes.forEach((inbox) => {
      if (inbox.order?.id) set.add(inbox.order.id);
    });
    return Array.from(set);
  }, [safeInboxes]);

  const filteredInboxes = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    const dateFrom = filters.dateRange.from ? startOfDay(filters.dateRange.from) : null;
    const dateTo = filters.dateRange.to ? endOfDay(filters.dateRange.to) : null;

    return safeInboxes.filter((inbox) => {
      if (!showDeleted && inbox.status === 'DELETED') return false;
      const haystack = [
        inbox.email,
        inbox.personaName,
        inbox.businessName ?? "",
        inbox.order?.id ?? "",
        inbox.order?.productType ?? "",
        inbox.espPlatform ?? "",
        parseInboxDomain(inbox),
        ...inbox.tags,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchLower ? haystack.includes(searchLower) : true;
      const matchesStatus = filters.statuses.length ? filters.statuses.includes(inbox.status) : true;
      const matchesProduct = filters.product ? inbox.order?.productType === filters.product : true;
      const matchesPersona = filters.persona
        ? inbox.personaName.toLowerCase() === filters.persona.toLowerCase()
        : true;
      const matchesTags = filters.tags.length ? inbox.tags.some((tag) => filters.tags.includes(tag)) : true;
      const matchesBusiness = filters.business
        ? (inbox.businessName ?? "").toLowerCase().includes(filters.business.toLowerCase())
        : true;
      const matchesOrder = filters.orderId ? inbox.order?.id === filters.orderId : true;
      const matchesPlatform = filters.platforms.length
        ? filters.platforms.includes(inbox.espPlatform ?? "")
        : true;

      let matchesDate = true;
      if (dateFrom || dateTo) {
        if (!inbox.createdAt) {
          matchesDate = false;
        } else {
          const createdAt = new Date(inbox.createdAt);
          if (dateFrom && createdAt < dateFrom) matchesDate = false;
          if (dateTo && createdAt > dateTo) matchesDate = false;
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesProduct &&
        matchesPersona &&
        matchesTags &&
        matchesBusiness &&
        matchesOrder &&
        matchesPlatform &&
        matchesDate
      );
    });
  }, [safeInboxes, searchTerm, filters, showDeleted]);

  const inboxCount = safeInboxes.length;
  const uniqueDomains = useMemo(() => {
    const set = new Set<string>();
    safeInboxes.forEach((inbox) => {
      const domain = parseInboxDomain(inbox);
      if (domain) set.add(domain);
    });
    return set;
  }, [safeInboxes]);

  const averageAge = useMemo(() => calculateAverageAge(safeInboxes), [safeInboxes]);

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

  const allFilteredSelected = filteredInboxes.length > 0 && filteredInboxes.every((inbox) => selectedIds.has(inbox.id));

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredInboxes.forEach((inbox) => next.delete(inbox.id));
      } else {
        filteredInboxes.forEach((inbox) => next.add(inbox.id));
      }
      return next;
    });
  };

  const buildInboxCsvRows = (inboxList: InboxRecord[]) => [
    [
      "email",
      "persona",
      "status",
      "tags",
      "business",
      "forwarding_domain",
      "password",
      "order_id",
      "order_status",
      "product_type",
      "esp_platform",
      "created_at",
    ],
    ...inboxList.map((inbox) => [
      inbox.email,
      inbox.personaName,
      inbox.status,
      inbox.tags.join(";"),
      inbox.businessName ?? "",
      parseInboxDomain(inbox),
      inbox.password ?? "",
      inbox.order?.id ?? "",
      inbox.order?.status ?? "",
      inbox.order?.productType ?? "",
      inbox.espPlatform ?? "",
      inbox.createdAt.toISOString(),
    ]),
  ];

  const handleExportSelected = () => {
    if (!selectedIds.size) return;
    const selectedInboxes = safeInboxes.filter((inbox) => selectedIds.has(inbox.id));
    if (!selectedInboxes.length) return;
    downloadCsv(buildInboxCsvRows(selectedInboxes), "inboxes-selected.csv");
  };

  const handleExportView = () => {
    const source = selectedIds.size
      ? safeInboxes.filter((inbox) => selectedIds.has(inbox.id))
      : filteredInboxes;
    if (!source.length) return;
    const filename = selectedIds.size ? "inboxes-selected.csv" : "inboxes-filtered.csv";
    downloadCsv(buildInboxCsvRows(source), filename);
  };

  const setFilterValue = <Key extends keyof FilterState>(key: Key, value: FilterState[Key]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleStatus = (status: string) => {
    setFilters((prev) => {
      const already = prev.statuses.includes(status);
      const statuses = already ? prev.statuses.filter((value) => value !== status) : [...prev.statuses, status];
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

  const togglePlatform = (platform: string) => {
    setFilters((prev) => {
      const hasPlatform = prev.platforms.includes(platform);
      const platforms = hasPlatform ? prev.platforms.filter((value) => value !== platform) : [...prev.platforms, platform];
      return { ...prev, platforms };
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
        label: `Status: ${status}`,
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

    if (filters.persona) {
      chips.push({
        id: "persona",
        label: `Persona: ${filters.persona}`,
        onClear: () => setFilterValue("persona", ""),
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

    filters.platforms.forEach((platform) => {
      chips.push({
        id: `platform:${platform}`,
        label: `ESP: ${platform}`,
        onClear: () => togglePlatform(platform),
      });
    });

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

  if (isLoading) {
    return (
      <div className="space-y-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Inboxes</h1>
            <p className="mt-2 text-sm text-white/60">Manage your email inboxes</p>
          </div>
        </div>
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  }

  if (error === "UNAUTHORIZED") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-white/10 bg-white/10/5 px-10 py-16 text-center text-white/70">
        Sign in to view your inbox inventory.
      </div>
    );
  }

  if (error === "FAILED") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10 px-10 py-16 text-center text-red-200">
        <h2 className="text-lg font-semibold text-red-200">We couldn't load your inboxes.</h2>
        <p className="mt-3 max-w-md text-sm text-red-200/80">Please refresh the page or try again later.</p>
      </div>
    );
  }

  if (!safeInboxes.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5/10 px-10 py-16 text-center text-white/70">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
          <InboxIcon className="h-8 w-8 text-white/70" />
        </div>
        <h2 className="text-2xl font-semibold text-white">No inboxes yet</h2>
        <p className="mt-3 max-w-sm text-sm text-white/50">
          Your inboxes appear here once fulfillment is complete. Launch a package to start building out your fleet.
        </p>
        <Link
          href="/dashboard/products"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          <SparklesIcon className="h-4 w-4" />
          Create inboxes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Inbox inventory</h1>
          <p className="mt-2 max-w-xl text-sm text-white/50">
            Every sender you’ve provisioned, plus their current delivery status, tags, and linked orders.
          </p>
        </div>
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-[0_10px_30px_-20px_rgba(255,255,255,0.6)] transition hover:bg-white/90"
        >
          Add more inboxes
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.6)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Total inboxes</p>
          <p className="mt-3 text-3xl font-semibold text-white">{inboxCount}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.6)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Domains represented</p>
          <p className="mt-3 text-3xl font-semibold text-white">{uniqueDomains.size}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.6)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Average inbox age</p>
          <p className="mt-3 text-3xl font-semibold text-white">{averageAge.toFixed(1)} days</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_30px_60px_-45px_rgba(0,0,0,0.8)]">
        <div className="space-y-4 border-b border-white/5 px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search email, persona, business, order…"
                  className="w-full min-w-[220px] flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none focus:ring-0 sm:w-64"
                />
                <div className="flex flex-wrap items-center gap-2">
                  {statusOptions.map((status) => {
                    const active = filters.statuses.includes(status);
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => toggleStatus(status)}
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide transition ${
                          active
                            ? "border-white/60 bg-white/15 text-white shadow-inner"
                            : "border-white/10 bg-black/30 text-white/50 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        {status.toLowerCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={filters.product}
                  onChange={(event) => setFilterValue("product", event.target.value)}
                  className="w-full max-w-[180px] rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0 sm:w-auto"
                >
                  <option value="">All products</option>
                  {productOptions.map((product) => (
                    <option key={product} value={product}>
                      {getProductLabel(product)}
                    </option>
                  ))}
                </select>
                <label className="ml-2 inline-flex items-center gap-2 text-xs text-white/60">
                  <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} />
                  Show deleted inboxes
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={handleExportSelected}
                disabled={!selectedIds.size}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/30"
              >
                Export selected
              </button>
              <Popover.Root open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <Popover.Trigger asChild>
                  <button className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-white/80 transition hover:border-white/40 hover:text-white">
                    <FunnelIcon className="h-4 w-4" />
                    More filters
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    className="z-50 mt-2 w-[360px] rounded-2xl border border-white/10 bg-black/90 p-5 text-white shadow-xl backdrop-blur"
                    sideOffset={8}
                    align="end"
                  >
                    <div className="space-y-5 text-sm">
                      <div>
                        <div className="flex items-baseline justify-between">
                          <label className="text-xs uppercase tracking-[0.2em] text-white/40">Persona</label>
                          {filters.persona ? (
                            <button
                              onClick={() => setFilterValue("persona", "")}
                              className="text-[11px] text-white/40 underline hover:text-white"
                            >
                              Clear
                            </button>
                          ) : null}
                        </div>
                        <select
                          value={filters.persona}
                          onChange={(event) => setFilterValue("persona", event.target.value)}
                          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                        >
                          <option value="">All personas</option>
                          {uniquePersonas.map((persona) => (
                            <option key={persona} value={persona}>
                              {persona}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-[0.2em] text-white/40">Tags</label>
                        <div className="mt-3 flex max-h-24 flex-wrap gap-2 overflow-y-auto pr-1">
                          {uniqueTags.length ? (
                            uniqueTags.map((tag) => {
                              const active = filters.tags.includes(tag);
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => toggleTag(tag)}
                                  className={`rounded-full px-3 py-1 text-xs transition ${
                                    active
                                      ? "bg-white text-black"
                                      : "border border-white/20 bg-black/40 text-white/60 hover:border-white/40 hover:text-white"
                                  }`}
                                >
                                  {tag}
                                </button>
                              );
                            })
                          ) : (
                            <p className="text-xs text-white/40">No tags yet.</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-baseline justify-between">
                          <label className="text-xs uppercase tracking-[0.2em] text-white/40">Business</label>
                          {filters.business ? (
                            <button
                              onClick={() => setFilterValue("business", "")}
                              className="text-[11px] text-white/40 underline hover:text-white"
                            >
                              Clear
                            </button>
                          ) : null}
                        </div>
                        <input
                          type="search"
                          list="business-suggestions"
                          value={filters.business}
                          onChange={(event) => setFilterValue("business", event.target.value)}
                          placeholder="Search or pick a customer"
                          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none focus:ring-0"
                        />
                        <datalist id="business-suggestions">
                          {uniqueBusinesses.map((business) => (
                            <option key={business} value={business} />
                          ))}
                        </datalist>
                        {topBusinessSuggestions.length ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {topBusinessSuggestions.map((business) => (
                              <button
                                key={business}
                                type="button"
                                onClick={() => setFilterValue("business", business)}
                                className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[11px] text-white/60 transition hover:border-white/40 hover:text-white"
                              >
                                {business}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-[0.2em] text-white/40">Order</label>
                        <select
                          value={filters.orderId}
                          onChange={(event) => setFilterValue("orderId", event.target.value)}
                          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                        >
                          <option value="">All orders</option>
                          {uniqueOrders.map((orderId) => (
                            <option key={orderId} value={orderId}>
                              {orderId?.slice(0, 12)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="flex items-baseline justify-between">
                          <label className="text-xs uppercase tracking-[0.2em] text-white/40">ESP / Platform</label>
                          {filters.platforms.length ? (
                            <button
                              onClick={() => setFilterValue("platforms", [])}
                              className="text-[11px] text-white/40 underline hover:text-white"
                            >
                              Clear
                            </button>
                          ) : null}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {uniquePlatforms.length ? (
                            uniquePlatforms.map((platform) => {
                              const active = filters.platforms.includes(platform);
                              return (
                                <button
                                  key={platform}
                                  type="button"
                                  onClick={() => togglePlatform(platform)}
                                  className={`rounded-full px-3 py-1 text-xs transition ${
                                    active
                                      ? "bg-white text-black"
                                      : "border border-white/20 bg-black/40 text-white/60 hover:border-white/40 hover:text-white"
                                  }`}
                                >
                                  {platform}
                                </button>
                              );
                            })
                          ) : (
                            <p className="text-xs text-white/40">No ESP data present.</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-[0.2em] text-white/40">Created</label>
                        <div className="mt-2 flex items-center gap-2">
                          <select
                            value={filters.datePreset}
                            onChange={(event) => {
                              const preset = event.target.value as DatePreset;
                              const range = applyDatePreset(preset);
                              setFilters((prev) => ({ ...prev, datePreset: preset, dateRange: range }));
                            }}
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                          >
                            <option value="ALL">All time</option>
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                          </select>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/50">
                          <div>
                            <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40">From</label>
                            <input
                              type="date"
                              value={filters.dateRange.from ? format(filters.dateRange.from, "yyyy-MM-dd") : ""}
                              onChange={(event) => {
                                const value = event.target.value ? startOfDay(new Date(event.target.value)) : null;
                                setFilters((prev) => ({
                                  ...prev,
                                  datePreset: "ALL",
                                  dateRange: { ...prev.dateRange, from: value },
                                }));
                              }}
                              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-white focus:border-white/40 focus:outline-none focus:ring-0"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40">To</label>
                            <input
                              type="date"
                              value={filters.dateRange.to ? format(filters.dateRange.to, "yyyy-MM-dd") : ""}
                              onChange={(event) => {
                                const value = event.target.value ? endOfDay(new Date(event.target.value)) : null;
                                setFilters((prev) => ({
                                  ...prev,
                                  datePreset: "ALL",
                                  dateRange: { ...prev.dateRange, to: value },
                                }));
                              }}
                              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-white focus:border-white/40 focus:outline-none focus:ring-0"
                            />
                          </div>
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


        <div className="flex flex-col gap-2 border-b border-white/5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Inboxes under management</h2>
            <p className="text-xs text-white/50">Delivery status, persona, and fulfillment details at a glance.</p>
          </div>
          <button
            onClick={handleExportView}
            className="self-start text-xs font-medium text-white/60 transition hover:text-white"
          >
            Export view
          </button>
        </div>
        {filteredInboxes.length ? (
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
                  <th scope="col" className="px-6 py-3 text-left">Email</th>
                  <th scope="col" className="px-6 py-3 text-left">Status</th>
                  <th scope="col" className="px-6 py-3 text-left">Persona</th>
                  <th scope="col" className="px-6 py-3 text-left">Tags</th>
                  <th scope="col" className="px-6 py-3 text-left">Business</th>
                  <th scope="col" className="px-6 py-3 text-left">Domain</th>
                  <th scope="col" className="px-6 py-3 text-left">Product</th>
                  <th scope="col" className="px-6 py-3 text-left">ESP</th>
                  <th scope="col" className="px-6 py-3 text-left">Order</th>
                  <th scope="col" className="px-6 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredInboxes.map((inbox) => {
                  const domain = parseInboxDomain(inbox);
                  return (
                    <tr key={inbox.id} className="transition hover:bg-white/[0.04]">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(inbox.id)}
                          onChange={() => handleToggleSelect(inbox.id)}
                          className="h-4 w-4 cursor-pointer rounded border border-white/30 bg-black/40 text-indigo-500 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-white/80">{inbox.email}</td>
                      <td className="px-6 py-4">
                        <StatusPill status={inbox.status} order={inbox.order} />
                      </td>
                      <td className="px-6 py-4 text-white/70">{inbox.personaName}</td>
                      <td className="px-6 py-4 text-white/60">
                        {inbox.tags.length ? inbox.tags.slice(0, 3).join(", ") : <span className="text-white/30">—</span>}
                      </td>
                      <td className="px-6 py-4 text-white/70">{inbox.businessName || "—"}</td>
                      <td className="px-6 py-4 text-white/60">{domain || "—"}</td>
                      <td className="px-6 py-4 text-white/70">{getProductLabel(inbox.order?.productType)}</td>
                      <td className="px-6 py-4 text-white/60">{inbox.espPlatform || "—"}</td>
                      <td className="px-6 py-4 font-mono text-[11px] text-white/50">
                        {inbox.order?.id ? `${inbox.order.id.slice(0, 8)}…` : "—"}
                      </td>
                      <td className="px-6 py-4 text-white/60">{formatDate(inbox.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center text-white/60">
            <p className="text-sm">No inboxes match these filters.</p>
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
