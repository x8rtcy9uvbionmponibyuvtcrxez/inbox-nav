import { useEffect, useCallback } from 'react';
import { useDashboardStore } from '@/lib/stores/dashboard-store';

export function useInboxes() {
  const {
    inboxes,
    inboxesLoading,
    inboxesError,
    isDataStale,
    setInboxes,
    setInboxesLoading,
    setInboxesError,
  } = useDashboardStore();

  const fetchInboxes = useCallback(async () => {
    // Don't fetch if data is fresh
    if (!isDataStale('inboxes') && inboxes.length > 0) {
      return;
    }

    setInboxesLoading(true);
    setInboxesError(null);

    try {
      const response = await fetch('/api/inboxes/cached', {
        headers: {
          'Cache-Control': 'max-age=300',
        },
      });

      if (response.status === 304) {
        // Data hasn't changed, keep existing data
        setInboxesLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch inboxes: ${response.status}`);
      }

      const data = await response.json();
      setInboxes(data);
    } catch (error) {
      console.error('Failed to fetch inboxes:', error);
      setInboxesError(error instanceof Error ? error.message : 'Failed to fetch inboxes');
    } finally {
      setInboxesLoading(false);
    }
  }, [inboxes.length, isDataStale, setInboxes, setInboxesLoading, setInboxesError]);

  useEffect(() => {
    fetchInboxes();
  }, [fetchInboxes]);

  return {
    inboxes,
    loading: inboxesLoading,
    error: inboxesError,
    refetch: fetchInboxes,
  };
}
