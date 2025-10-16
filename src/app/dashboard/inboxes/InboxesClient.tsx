"use client";

import { useMemo, useState, useCallback, memo, useEffect } from "react";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import type { Prisma } from "@prisma/client";
import { InboxStatus, OrderStatus } from "@prisma/client";
import { InboxIcon, SparklesIcon, FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { TableSkeleton } from "@/components/skeletons";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";
import Pagination from "@/components/Pagination";

const STATUS_COLORS: Record<InboxStatus | 'DEFAULT', string> = {
  [InboxStatus.LIVE]: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  [InboxStatus.PENDING]: "bg-amber-400/25 text-amber-100 border border-amber-300/40",
  [InboxStatus.DELETED]: "bg-red-500/15 text-red-300 border border-red-500/30",
  [InboxStatus.CANCELLED]: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
  DEFAULT: "bg-white/10 text-brand-muted border border-white/10",
};

const STATUS_DISPLAY_ORDER = [InboxStatus.LIVE, InboxStatus.PENDING, InboxStatus.DELETED];
const PRODUCT_DISPLAY_ORDER = ["EDU", "LEGACY", "RESELLER", "PREWARMED", "AWS", "MICROSOFT"];
const ITEMS_PER_PAGE = 50;

const PRODUCT_LABELS: Record<string, string> = {
  RESELLER: "Reseller",
  EDU: "Edu",
  LEGACY: "Legacy",
  PREWARMED: "Prewarmed",
  AWS: "AWS",
  MICROSOFT: "Microsoft",
};

type InboxRecord = Prisma.InboxGetPayload<{
  include: {
    order: true;
  };
}>;

type Props = {
  inboxes: InboxRecord[];
  error?: string | null;
  isLoading?: boolean;
};

type DatePreset = "7" | "30" | "90" | "ALL";

type FilterState = {
  statuses: InboxStatus[];
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

function StatusPill({ status, order }: { status: InboxStatus; order?: { subscriptionStatus?: string; status?: OrderStatus } }) {
  // Check if the order is cancelled
  const isOrderCancelled = order?.subscriptionStatus === 'cancel_at_period_end' || order?.status === OrderStatus.CANCELLED;
  const displayStatus = isOrderCancelled ? InboxStatus.CANCELLED : status;
  const pillClass = STATUS_COLORS[displayStatus] ?? STATUS_COLORS.DEFAULT;
  
  // Map status to display labels
  const getStatusLabel = (status: InboxStatus) => {
    switch (status) {
      case InboxStatus.LIVE:
        return 'Active';
      case InboxStatus.PENDING:
        return 'Warming';
      case InboxStatus.DELETED:
        return 'Paused';
      case InboxStatus.CANCELLED:
        return 'Paused';
      default:
        return String(status).toLowerCase();
    }
  };
  
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${pillClass}`}>
      {getStatusLabel(displayStatus)}
    </span>
  );
}

// function formatDate(value: Date | string) {
//   const date = typeof value === "string" ? new Date(value) : value;
//   return format(date, "MMM d, yyyy");
// }

function calculateAverageAge(inboxList: InboxRecord[]): number {
  if (!inboxList.length) return 0;
  const now = Date.now();
  const totalDays = inboxList.reduce((sum, inbox) => {
    const createdAt = inbox.createdAt ? new Date(inbox.createdAt).getTime() : now;
    const diff = Math.max(0, now - createdAt);
    return sum + diff / (1000 * 60 * 60 * 24);
  }, 0);
  const average = totalDays / inboxList.length;
  if (!Number.isFinite(average)) return 0;
  const rounded = Math.round(average);
  return Math.max(1, rounded);
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

function InboxesClient({ inboxes, error, isLoading = false }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const safeInboxes = useMemo(() => inboxes ?? [], [inboxes]);

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

  const productFilterOptions = productOptions.length ? productOptions : PRODUCT_DISPLAY_ORDER;

  const uniquePersonas = useMemo(() => {
    const set = new Set<string>();
    safeInboxes.forEach((inbox) => {
      const fullName = [inbox.firstName, inbox.lastName].filter(Boolean).join(' ');
      if (fullName) set.add(fullName);
    });
    return Array.from(set).sort();
  }, [safeInboxes]);

  const uniquePlatforms = useMemo(() => {
    const set = new Set<string>();
    safeInboxes.forEach((inbox) => {
      if (inbox.espPlatform) set.add(inbox.espPlatform);
    });
    return Array.from(set).sort();
  }, [safeInboxes]);

  const filteredInboxes = useMemo(() => {
    const searchLower = debouncedSearchTerm.trim().toLowerCase();
    const dateFrom = filters.dateRange.from ? startOfDay(filters.dateRange.from) : null;
    const dateTo = filters.dateRange.to ? endOfDay(filters.dateRange.to) : null;

    return safeInboxes.filter((inbox) => {
      if (!showDeleted && inbox.status === InboxStatus.DELETED) return false;
      
      // Only compute haystack if we have a search term
      let matchesSearch = true;
      if (searchLower) {
        const haystack = [
          inbox.email,
          [inbox.firstName, inbox.lastName].filter(Boolean).join(' '),
          inbox.businessName ?? "",
          inbox.order?.id ?? "",
          inbox.order?.productType ?? "",
          inbox.espPlatform ?? "",
          parseInboxDomain(inbox),
          ...inbox.tags,
        ]
          .join(" ")
          .toLowerCase();
        matchesSearch = haystack.includes(searchLower);
      }
      const matchesStatus = filters.statuses.length ? filters.statuses.includes(inbox.status) : true;
      const matchesProduct = filters.product ? inbox.order?.productType === filters.product : true;
      const matchesPersona = filters.persona
        ? [inbox.firstName, inbox.lastName].filter(Boolean).join(' ').toLowerCase() === filters.persona.toLowerCase()
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
  }, [safeInboxes, debouncedSearchTerm, filters, showDeleted]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filters, showDeleted]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredInboxes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedInboxes = filteredInboxes.slice(startIndex, endIndex);

  const inboxCount = safeInboxes.length;
  // const uniqueDomains = useMemo(() => {
  //   const set = new Set<string>();
  //   safeInboxes.forEach((inbox) => {
  //     const domain = parseInboxDomain(inbox);
  //     if (domain) set.add(domain);
  //   });
  //   return set;
  // }, [safeInboxes]);

  const averageAge = useMemo(() => calculateAverageAge(safeInboxes), [safeInboxes]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const allPaginatedSelected = paginatedInboxes.length > 0 && paginatedInboxes.every((inbox) => selectedIds.has(inbox.id));

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPaginatedSelected) {
        // Only deselect current page items
        paginatedInboxes.forEach((inbox) => next.delete(inbox.id));
      } else {
        // Select all current page items
        paginatedInboxes.forEach((inbox) => next.add(inbox.id));
      }
      return next;
    });
  }, [allPaginatedSelected, paginatedInboxes]);

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
      [inbox.firstName, inbox.lastName].filter(Boolean).join(' '),
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

  const hasSelection = selectedIds.size > 0;

  const hasFiltersApplied = useMemo(() => {
    if (searchTerm.trim()) return true;
    if (showDeleted) return true;
    if (filters.statuses.length) return true;
    if (filters.product) return true;
    if (filters.persona) return true;
    if (filters.tags.length) return true;
    if (filters.business) return true;
    if (filters.orderId) return true;
    if (filters.platforms.length) return true;
    if (filters.datePreset !== "ALL") return true;
    if (filters.dateRange.from) return true;
    if (filters.dateRange.to) return true;
    return false;
  }, [filters, searchTerm, showDeleted]);

  const canExport = hasSelection || filteredInboxes.length > 0;
  const exportButtonLabel = hasSelection ? "Export selected as CSV" : "Export as CSV";

  const handleExportCsv = () => {
    const source = hasSelection
      ? safeInboxes.filter((inbox) => selectedIds.has(inbox.id))
      : filteredInboxes;
    if (!source.length) return;
    const filename = hasSelection
      ? "inboxes-selected.csv"
      : hasFiltersApplied
        ? "inboxes-filtered.csv"
        : "inboxes.csv";
    downloadCsv(buildInboxCsvRows(source), filename);
  };

  const setFilterValue = <Key extends keyof FilterState>(key: Key, value: FilterState[Key]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleStatus = (status: InboxStatus) => {
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
        label: `Status: ${status.toLowerCase()}`,
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
      <div className="space-y-8 text-brand-primary">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-brand-primary">Manage your inboxes</h1>
            <p className="mt-2 text-base text-brand-secondary">View active inboxes, track health, and manage connections.</p>
          </div>
        </div>
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  }

  if (error === "UNAUTHORIZED") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-white/10 bg-white/10/5 px-10 py-16 text-center text-brand-secondary">
        Sign in to view your inbox inventory.
      </div>
    );
  }

  if (error === "FAILED") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10 px-10 py-16 text-center text-red-200">
        <h2 className="text-lg font-semibold text-red-200">We couldn&apos;t load your inboxes.</h2>
        <p className="mt-3 max-w-md text-sm text-red-200/80">Please refresh the page or try again later.</p>
      </div>
    );
  }

  if (!safeInboxes.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5/10 px-10 py-16 text-center text-brand-secondary">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
          <InboxIcon className="h-8 w-8 text-brand-secondary" />
        </div>
        <h2 className="text-2xl font-semibold text-brand-primary">No inboxes yet — launch your first set and start sending.</h2>
        <p className="mt-3 max-w-sm text-base text-brand-secondary">
          Your inboxes appear here once fulfillment is complete. Launch a package to start building out your fleet.
        </p>
        <Link
          href="/dashboard/products"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          <SparklesIcon className="h-4 w-4" />
          Add Inbox
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-brand-primary">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 max-w-2xl">
          <h1 className="text-4xl font-bold text-brand-primary">Manage your inboxes and sending power.</h1>
          <p className="mt-3 text-lg text-brand-secondary leading-relaxed">
            See every inbox in one place.
          </p>
        </div>
        <Button asChild variant="primary" size="lg" className="shadow-[0_20px_46px_-26px_rgba(255,255,255,0.65)] hover:shadow-[0_25px_50px_-25px_rgba(255,255,255,0.8)] transition-all duration-200">
          <Link href="/dashboard/products">Add Inbox</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="surface-card px-8 py-6 group hover:bg-white/[0.04] transition-all duration-200">
          <p className="text-brand-muted-strong text-xs uppercase tracking-[0.3em] font-semibold">Live inboxes</p>
          <p className="mt-4 text-4xl font-bold text-brand-primary">{inboxCount}</p>
        </div>
        <div className="surface-card px-8 py-6 group hover:bg-white/[0.04] transition-all duration-200">
          <p className="text-brand-muted-strong text-xs uppercase tracking-[0.3em] font-semibold">Paused</p>
          <p className="mt-4 text-4xl font-bold text-brand-primary">0</p>
        </div>
        <div className="surface-card px-8 py-6 group hover:bg-white/[0.04] transition-all duration-200">
          <p className="text-brand-muted-strong text-xs uppercase tracking-[0.3em] font-semibold">Average age of Inboxes</p>
          <p className="mt-4 text-4xl font-bold text-brand-primary">{averageAge} days</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_30px_60px_-45px_rgba(0,0,0,0.8)]">
        <div className="space-y-4 border-b border-white/5 px-6 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search email, persona, business, order…"
                className="flex-1 min-w-[220px] rounded-full border border-white/15 bg-black/25 px-4 py-2 text-sm text-brand-primary placeholder:text-brand-muted focus:border-white/35 focus:outline-none focus:ring-0"
              />
              <select
                value={filters.product}
                onChange={(event) => setFilterValue("product", event.target.value)}
                className="rounded-full border border-white/15 bg-black/25 px-3 py-2 text-sm text-brand-primary focus:border-white/35 focus:outline-none focus:ring-0"
              >
                <option value="">All products</option>
                {productFilterOptions.map((product) => (
                  <option key={product} value={product}>
                    {PRODUCT_LABELS[product] ?? product}
                  </option>
                ))}
              </select>
              <select
                value={filters.persona}
                onChange={(event) => setFilterValue("persona", event.target.value)}
                className="rounded-full border border-white/15 bg-black/25 px-3 py-2 text-sm text-brand-primary focus:border-white/35 focus:outline-none focus:ring-0"
              >
                <option value="">All personas</option>
                {uniquePersonas.map((persona) => (
                  <option key={persona} value={persona}>
                    {persona}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-sm text-brand-secondary">
                {STATUS_DISPLAY_ORDER.map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`rounded-full px-3 py-1.5 font-medium uppercase tracking-wide ${
                      filters.statuses.includes(status)
                        ? STATUS_COLORS[status] ?? STATUS_COLORS.DEFAULT
                        : 'bg-transparent text-brand-muted border border-white/20'
                    }`}
                  >
                    {status.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-brand-secondary">
              <Popover.Root open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <Popover.Trigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FunnelIcon className="h-4 w-4" /> More filters
                  </Button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content sideOffset={8} align="end" className="z-50 w-80 rounded-2xl border border-white/10 bg-white/[0.08] p-6 text-brand-primary shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                    <div className="space-y-6 text-sm text-brand-secondary">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-muted">Show deleted inboxes</span>
                        <label className="inline-flex items-center gap-3 text-brand-secondary">
                          <input 
                            type="checkbox" 
                            checked={showDeleted} 
                            onChange={(e) => setShowDeleted(e.target.checked)}
                            className="h-4 w-4 rounded border border-white/30 bg-black/40 text-indigo-500 focus:ring-indigo-500"
                          />
                          <span className="text-sm font-medium">Show</span>
                        </label>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-muted">Business</label>
                        <input
                          value={filters.business}
                          onChange={(event) => setFilterValue("business", event.target.value)}
                          placeholder="e.g. Acme"
                          className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-brand-primary placeholder:text-brand-muted focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-muted">Order ID</label>
                        <input
                          value={filters.orderId}
                          onChange={(event) => setFilterValue("orderId", event.target.value)}
                          placeholder="Search by order ID"
                          className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-brand-primary placeholder:text-brand-muted focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-muted">ESP platforms</label>
                        <div className="flex flex-wrap gap-2">
                          {uniquePlatforms.length ? (
                            uniquePlatforms.map((platform) => (
                              <button
                                key={platform}
                                onClick={() => togglePlatform(platform)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                  filters.platforms.includes(platform)
                                    ? 'bg-white text-black shadow-sm'
                                    : 'border border-white/20 text-brand-muted hover:border-white/40 hover:text-brand-primary'
                                }`}
                              >
                                {platform}
                              </button>
                            ))
                          ) : (
                            <span className="text-sm text-brand-muted">No ESP data yet.</span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-muted">Tags</label>
                        <input
                          value={filters.tags.join(', ')}
                          onChange={(event) => setFilterValue("tags", event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))}
                          placeholder="primary, warmup"
                          className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-brand-primary placeholder:text-brand-muted focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-muted">Created</label>
                        <div className="flex items-center gap-3">
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
                            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-brand-primary focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
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
                            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-brand-primary focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          {(['ALL', '7', '30', '90'] as DatePreset[]).map((preset) => (
                            <button
                              key={preset}
                              onClick={() => {
                                const range = applyDatePreset(preset);
                                setFilters((prev) => ({ ...prev, datePreset: preset, dateRange: range }));
                              }}
                              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                filters.datePreset === preset 
                                  ? 'bg-white text-black shadow-sm' 
                                  : 'border border-white/20 text-brand-muted hover:border-white/40 hover:text-brand-primary'
                              }`}
                            >
                              {preset === 'ALL' ? 'All' : `Last ${preset}d`}
                            </button>
                          ))}
                        </div>
                      </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <Button variant="ghost" size="sm" onClick={resetFilters} className="text-brand-secondary hover:text-brand-primary px-6">
                        Clear all
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => setIsFilterSheetOpen(false)} className="px-8">
                        Done
                      </Button>
                    </div>
                    </div>
                  <Popover.Arrow className="fill-white/10" />
                </Popover.Content>
              </Popover.Portal>
              </Popover.Root>
              <Button
                variant="outline"
                size="md"
                onClick={handleExportCsv}
                disabled={!canExport}
                className="whitespace-nowrap"
              >
                {exportButtonLabel}
              </Button>
            </div>
          </div>

          {activeFilterChips.length ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-brand-secondary">
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.id}
                  onClick={chip.onClear}
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 transition hover:border-white/30 hover:text-brand-primary"
                >
                  {chip.label}
                  <XMarkIcon className="h-3 w-3" />
                </button>
              ))}
              <button onClick={resetFilters} className="text-xs text-brand-muted underline hover:text-brand-primary">
                Clear all filters
              </button>
            </div>
          ) : null}
        </div>
        {filteredInboxes.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
            <table className="min-w-full divide-y divide-white/5">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allPaginatedSelected}
                  onChange={handleToggleSelectAll}
                  className="h-4 w-4 cursor-pointer rounded border border-white/30 bg-black/40 text-indigo-500 focus:ring-indigo-500"
                />
              </th>
              <th scope="col" className="px-6 py-4 text-left font-semibold text-brand-primary">Inbox</th>
              <th scope="col" className="px-6 py-4 text-left font-semibold text-brand-primary">Domain</th>
              <th scope="col" className="px-6 py-4 text-left font-semibold text-brand-primary">Plan</th>
              <th scope="col" className="px-6 py-4 text-left font-semibold text-brand-primary">Status</th>
              <th scope="col" className="px-6 py-4 text-left font-semibold text-brand-primary">View</th>
            </tr>
          </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedInboxes.map((inbox) => {
                  const domain = parseInboxDomain(inbox);
                  return (
                    <tr key={inbox.id} className="group transition-all duration-200 hover:bg-white/[0.04]">
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(inbox.id)}
                          onChange={() => handleToggleSelect(inbox.id)}
                          className="h-4 w-4 cursor-pointer rounded border border-white/30 bg-black/40 text-indigo-500 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-5 font-mono text-sm font-medium text-brand-primary">{inbox.email}</td>
                      <td className="px-6 py-5 text-sm text-brand-muted">{domain || "—"}</td>
                      <td className="px-6 py-5 text-sm text-brand-secondary">{getProductLabel(inbox.order?.productType)}</td>
                      <td className="px-6 py-5">
                        <StatusPill status={inbox.status} order={inbox.order} />
                      </td>
                      <td className="px-6 py-5">
                        <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center text-brand-secondary">
            <p className="text-sm">No inboxes match these filters.</p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredInboxes.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredInboxes.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            disabled={isLoading}
          />
        )}
      </div>
    </div>
  );
}

export default memo(InboxesClient);
