"use client";

import { useMemo, useState, useCallback, memo } from "react";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import type { Prisma } from "@prisma/client";
import { SparklesIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { TableSkeleton } from "@/components/skeletons";
import { VirtualizedTable } from "@/components/VirtualizedTable";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";

type InboxRecord = Prisma.InboxGetPayload<{
  include: {
    order: {
      select: {
        id: true;
        productType: true;
        status: true;
        subscriptionStatus: true;
        cancelledAt: true;
        businessName: true;
      };
    };
  };
}>;

interface Props {
  inboxes: InboxRecord[];
  error?: string;
  isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  LIVE: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  PENDING: "bg-amber-400/25 text-amber-100 border border-amber-300/40",
  DELETED: "bg-red-500/15 text-red-300 border border-red-500/30",
  CANCELLED: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
};

function StatusPill({ status, order }: { status: string; order?: { subscriptionStatus?: string; status?: string } }) {
  const isCancelled = order?.subscriptionStatus === 'cancel_at_period_end' || order?.status === 'CANCELLED';
  const displayStatus = isCancelled ? 'CANCELLED' : status;
  const colorClass = STATUS_COLORS[displayStatus] || STATUS_COLORS.PENDING;

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${colorClass}`}>
      {displayStatus}
    </span>
  );
}

function VirtualizedInboxesClient({ inboxes, error, isLoading = false }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    espPlatform: "",
    persona: "",
  });
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const safeInboxes = useMemo(() => inboxes ?? [], [inboxes]);

  const espPlatformOptions = useMemo(() => {
    const set = new Set<string>();
    safeInboxes.forEach(inbox => {
      if (inbox.espPlatform) set.add(inbox.espPlatform);
    });
    return Array.from(set).sort();
  }, [safeInboxes]);

  const uniquePersonas = useMemo(() => {
    const set = new Set<string>();
    safeInboxes.forEach(inbox => {
      const fullName = [inbox.firstName, inbox.lastName].filter(Boolean).join(' ');
      if (fullName) set.add(fullName);
    });
    return Array.from(set).sort();
  }, [safeInboxes]);

  const filteredInboxes = useMemo(() => {
    const searchLower = debouncedSearchTerm.trim().toLowerCase();
    
    return safeInboxes.filter((inbox) => {
      if (!showDeleted && inbox.status === 'DELETED') return false;

      const matchesSearch = !searchLower || 
        inbox.email.toLowerCase().includes(searchLower) ||
        [inbox.firstName, inbox.lastName].filter(Boolean).join(' ').toLowerCase().includes(searchLower) ||
        inbox.businessName?.toLowerCase().includes(searchLower) ||
        inbox.forwardingDomain?.toLowerCase().includes(searchLower) ||
        inbox.tags.some(tag => tag.toLowerCase().includes(searchLower));

      const matchesStatus = !filters.status || inbox.status === filters.status;
      const matchesEspPlatform = !filters.espPlatform || inbox.espPlatform === filters.espPlatform;
      const matchesPersona = !filters.persona || 
        [inbox.firstName, inbox.lastName].filter(Boolean).join(' ').toLowerCase() === filters.persona.toLowerCase();

      return matchesSearch && matchesStatus && matchesEspPlatform && matchesPersona;
    });
  }, [safeInboxes, debouncedSearchTerm, filters, showDeleted]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // const handleToggleSelectAll = useCallback(() => {
  //   if (selectedIds.size === filteredInboxes.length) {
  //     setSelectedIds(new Set());
  //   } else {
  //     setSelectedIds(new Set(filteredInboxes.map(inbox => inbox.id)));
  //   }
  // }, [selectedIds.size, filteredInboxes]);

  const resetFilters = useCallback(() => {
    setFilters({ status: "", espPlatform: "", persona: "" });
    setSearchTerm("");
  }, []);

  const buildInboxCsvRows = useCallback((): string[][] => {
    const headers = [
      "email",
      "first_name", 
      "last_name",
      "status",
      "esp_platform",
      "business_name",
      "forwarding_domain",
      "tags",
      "password",
      "created_at"
    ];

    const rows = filteredInboxes.map(inbox => [
      inbox.email,
      inbox.firstName || "",
      inbox.lastName || "",
      inbox.status,
      inbox.espPlatform,
      inbox.businessName || "",
      inbox.forwardingDomain || "",
      inbox.tags.join(";"),
      inbox.password || "",
      inbox.createdAt.toISOString(),
    ]);

    return [headers, ...rows];
  }, [filteredInboxes]);

  const handleExportCsv = useCallback(() => {
    const csvRows = buildInboxCsvRows();
    const csvContent = csvRows.map(row => 
      row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inboxes-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [buildInboxCsvRows]);

  if (isLoading) {
    return (
      <div className="space-y-8 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Inboxes</h1>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Inboxes</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-red-400">We couldn&apos;t load your inboxes.</p>
        </div>
      </div>
    );
  }

  const renderInboxRow = (inbox: InboxRecord) => (
    <tr 
      key={inbox.id}
      className="hover:bg-gray-700/30 transition-colors"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={selectedIds.has(inbox.id)}
          onChange={() => handleToggleSelect(inbox.id)}
          className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4 text-white/70">
        {[inbox.firstName, inbox.lastName].filter(Boolean).join(' ') || '—'}
      </td>
      <td className="px-6 py-4 text-white/70">{inbox.email}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusPill status={inbox.status} order={inbox.order} />
      </td>
      <td className="px-6 py-4 text-white/70">{inbox.espPlatform}</td>
      <td className="px-6 py-4 text-white/70">{inbox.businessName || '—'}</td>
      <td className="px-6 py-4 text-white/70">{inbox.forwardingDomain || '—'}</td>
      <td className="px-6 py-4 text-white/70">
        {inbox.tags.length > 0 ? inbox.tags.join(', ') : '—'}
      </td>
      <td className="px-6 py-4 text-white/70">
        {inbox.password ? '••••••••' : '—'}
      </td>
      <td className="px-6 py-4 text-white/70">
        {new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(typeof inbox.createdAt === "string" ? new Date(inbox.createdAt) : inbox.createdAt)}
      </td>
    </tr>
  );

  const tableHeader = (
    <div className="px-6 py-4 border-b border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Inboxes ({filteredInboxes.length})</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleted(!showDeleted)}
          >
            {showDeleted ? 'Hide' : 'Show'} Deleted
          </Button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search inboxes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <Popover.Root open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
          <Popover.Trigger asChild>
            <Button variant="outline" size="sm">
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </Popover.Trigger>
          <Popover.Content className="w-80 p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="LIVE">Live</option>
                  <option value="PENDING">Pending</option>
                  <option value="DELETED">Deleted</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ESP Platform</label>
                <select
                  value={filters.espPlatform}
                  onChange={(e) => setFilters(prev => ({ ...prev, espPlatform: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="">All Platforms</option>
                  {espPlatformOptions.map(platform => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Persona</label>
                <select
                  value={filters.persona}
                  onChange={(e) => setFilters(prev => ({ ...prev, persona: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="">All Personas</option>
                  {uniquePersonas.map(persona => (
                    <option key={persona} value={persona}>{persona}</option>
                  ))}
                </select>
              </div>
              
              <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </Popover.Content>
        </Popover.Root>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inboxes</h1>
        <Link
          href="/dashboard/products"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          <SparklesIcon className="h-4 w-4 mr-2" />
          New Order
        </Link>
      </div>

      <VirtualizedTable
        items={filteredInboxes}
        renderRow={renderInboxRow}
        rowHeight={60}
        containerHeight={600}
        className="bg-gray-800/50 rounded-lg border border-gray-700"
        header={tableHeader}
        emptyState={
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center text-white/60">
            <p className="text-sm">No inboxes match these filters.</p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        }
      />
    </div>
  );
}

export default memo(VirtualizedInboxesClient);
