import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Inbox {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  espPlatform: string;
  tags: string[];
  businessName: string | null;
  forwardingDomain: string | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
  order: {
    id: string;
    productType: string;
    status: string;
    subscriptionStatus: string;
    cancelledAt: Date | null;
    businessName: string | null;
  };
}

export interface Domain {
  id: string;
  domainName: string;
  status: string;
  inboxCount: number;
  forwardingUrl: string;
  createdAt: Date;
  updatedAt: Date;
  businessName: string | null;
  order: {
    id: string;
    productType: string;
    quantity: number;
    status: string;
    subscriptionStatus: string;
    cancelledAt: Date | null;
  };
}

interface DashboardState {
  // Data
  inboxes: Inbox[];
  domains: Domain[];
  
  // Loading states
  inboxesLoading: boolean;
  domainsLoading: boolean;
  
  // Error states
  inboxesError: string | null;
  domainsError: string | null;
  
  // Cache timestamps
  inboxesLastFetched: number | null;
  domainsLastFetched: number | null;
  
  // Actions
  setInboxes: (inboxes: Inbox[]) => void;
  setDomains: (domains: Domain[]) => void;
  setInboxesLoading: (loading: boolean) => void;
  setDomainsLoading: (loading: boolean) => void;
  setInboxesError: (error: string | null) => void;
  setDomainsError: (error: string | null) => void;
  updateInbox: (id: string, updates: Partial<Inbox>) => void;
  updateDomain: (id: string, updates: Partial<Domain>) => void;
  clearCache: () => void;
  
  // Computed getters
  getInboxById: (id: string) => Inbox | undefined;
  getDomainById: (id: string) => Domain | undefined;
  isDataStale: (type: 'inboxes' | 'domains', maxAge?: number) => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      // Initial state
      inboxes: [],
      domains: [],
      inboxesLoading: false,
      domainsLoading: false,
      inboxesError: null,
      domainsError: null,
      inboxesLastFetched: null,
      domainsLastFetched: null,

      // Actions
      setInboxes: (inboxes) => 
        set({ 
          inboxes, 
          inboxesLastFetched: Date.now(),
          inboxesError: null 
        }),

      setDomains: (domains) => 
        set({ 
          domains, 
          domainsLastFetched: Date.now(),
          domainsError: null 
        }),

      setInboxesLoading: (loading) => set({ inboxesLoading: loading }),
      setDomainsLoading: (loading) => set({ domainsLoading: loading }),
      
      setInboxesError: (error) => set({ inboxesError: error }),
      setDomainsError: (error) => set({ domainsError: error }),

      updateInbox: (id, updates) =>
        set((state) => ({
          inboxes: state.inboxes.map((inbox) =>
            inbox.id === id ? { ...inbox, ...updates } : inbox
          ),
        })),

      updateDomain: (id, updates) =>
        set((state) => ({
          domains: state.domains.map((domain) =>
            domain.id === id ? { ...domain, ...updates } : domain
          ),
        })),

      clearCache: () =>
        set({
          inboxes: [],
          domains: [],
          inboxesLastFetched: null,
          domainsLastFetched: null,
          inboxesError: null,
          domainsError: null,
        }),

      // Computed getters
      getInboxById: (id) => {
        const state = get();
        return state.inboxes.find((inbox) => inbox.id === id);
      },

      getDomainById: (id) => {
        const state = get();
        return state.domains.find((domain) => domain.id === id);
      },

      isDataStale: (type, maxAge = CACHE_DURATION) => {
        const state = get();
        const lastFetched = type === 'inboxes' 
          ? state.inboxesLastFetched 
          : state.domainsLastFetched;
        
        if (!lastFetched) return true;
        return Date.now() - lastFetched > maxAge;
      },
    }),
    {
      name: 'dashboard-store',
    }
  )
);
