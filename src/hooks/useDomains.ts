import { useEffect, useCallback } from 'react';
import { useDashboardStore } from '@/lib/stores/dashboard-store';

export function useDomains() {
  const {
    domains,
    domainsLoading,
    domainsError,
    isDataStale,
    setDomains,
    setDomainsLoading,
    setDomainsError,
  } = useDashboardStore();

  const fetchDomains = useCallback(async () => {
    // Don't fetch if data is fresh
    if (!isDataStale('domains') && domains.length > 0) {
      return;
    }

    setDomainsLoading(true);
    setDomainsError(null);

    try {
      const response = await fetch('/api/domains/cached', {
        headers: {
          'Cache-Control': 'max-age=300',
        },
      });

      if (response.status === 304) {
        // Data hasn't changed, keep existing data
        setDomainsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch domains: ${response.status}`);
      }

      const data = await response.json();
      setDomains(data);
    } catch (error) {
      console.error('Failed to fetch domains:', error);
      setDomainsError(error instanceof Error ? error.message : 'Unable to load domains. Please try again.');
    } finally {
      setDomainsLoading(false);
    }
  }, [domains.length, isDataStale, setDomains, setDomainsLoading, setDomainsError]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  return {
    domains,
    loading: domainsLoading,
    error: domainsError,
    refetch: fetchDomains,
  };
}
