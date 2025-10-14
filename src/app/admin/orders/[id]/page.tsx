"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import CSVUpload from '../_components/CSVUpload';
import { markOrderAsFulfilledAction, type CSVRow } from '../actions';

function Label({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">{title}</div>
      <div className="text-gray-200">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
      <div className="text-sm font-medium text-white">{title}</div>
      {children}
    </div>
  );
}

type OrderData = {
  id: string;
  clerkUserId: string;
  productType: string;
  quantity: number;
  status: string;
  createdAt: string;
  onboardingData?: {
    businessType?: string;
    website?: string;
    domainSource?: string;
    providedDomains?: string[];
    domainPreferences?: string[];
  } | Array<{
    businessType?: string;
    website?: string;
    domainSource?: string;
    providedDomains?: string[];
    domainPreferences?: string[];
  }>;
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
    domain: string;
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

export default function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[] | null>(null);
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

  if (loading) {
    return <div className="text-center text-gray-300">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-300">Error: {error}</div>;
  }

  if (!order) {
    return <div className="text-center text-gray-300">Order not found</div>;
  }

  const onboarding = Array.isArray(order.onboardingData) 
    ? order.onboardingData[0] 
    : order.onboardingData;
  const isOwn = (onboarding?.domainSource ?? (onboarding?.domainPreferences?.length ? 'OWN' : 'BUY_FOR_ME')) === 'OWN';

  const handleCsvParsed = (rows: CSVRow[]) => {
    console.log('CSV parsed:', rows);
    setCsvData(rows);
    setFulfillmentMessage(null);
  };

  const handleMarkAsFulfilled = async () => {
    if (!order) return;
    
    setFulfilling(true);
    setFulfillmentMessage(null);
    
    try {
      const result = await markOrderAsFulfilledAction(order.id, csvData || undefined);
      
      if (result.success) {
        setFulfillmentMessage(result.message || 'Order fulfilled successfully!');
        // Refresh the order data
        const response = await fetch(`/api/admin/orders/${order.id}`);
        if (response.ok) {
          const updatedOrder = await response.json();
          setOrder(updatedOrder);
        }
      } else {
        setFulfillmentMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setFulfillmentMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setFulfilling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Order {order.id}</h2>
        <Link href="/admin/orders" className="text-sm text-gray-300 hover:text-white">Back to Orders</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Section title="Customer">
          <div className="grid grid-cols-1 gap-2 text-sm">
            <Label title="Clerk User ID">{order.clerkUserId}</Label>
          </div>
        </Section>

        <Section title="Order">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Label title="Product">{order.productType}</Label>
            <Label title="Quantity">{order.quantity}</Label>
            <Label title="Status">{order.status}</Label>
            <Label title="Created">{new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(new Date(order.createdAt))}</Label>
          </div>
        </Section>

        <Section title="Onboarding">
          <div className="grid grid-cols-1 gap-2 text-sm">
            <Label title="Business">{onboarding?.businessType ?? '-'}</Label>
            <Label title="Primary URL">{onboarding?.website ?? '-'}</Label>
            <Label title="Domain Source">{onboarding?.domainSource ?? (isOwn ? 'OWN' : 'BUY_FOR_ME')}</Label>
            {isOwn && (
              <Label title="Provided Domains">{Array.isArray(onboarding?.providedDomains) ? onboarding.providedDomains.join(', ') : '-'}</Label>
            )}
          </div>
        </Section>
      </div>

      {isOwn ? (
        <Section title="Inboxes (Own Domains)">
          <div className="text-sm text-gray-300 mb-3">Upload CSV with columns: <code>email,password</code></div>
          <CSVUpload 
            expectedHeaders={["email","password"]} 
            onParsed={handleCsvParsed}
            cta="Choose CSV to upload passwords" 
          />

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800 text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-300">Email</th>
                  <th className="px-4 py-2 text-left text-gray-300">Persona</th>
                  <th className="px-4 py-2 text-left text-gray-300">Domain</th>
                  <th className="px-4 py-2 text-left text-gray-300">Status</th>
                  <th className="px-4 py-2 text-left text-gray-300">Password</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {order.inboxes.map((i) => (
                  <tr key={i.id}>
                    <td className="px-4 py-2 text-gray-200">{i.email}</td>
                    <td className="px-4 py-2 text-gray-300">{i.personaName}</td>
                    <td className="px-4 py-2 text-gray-300">{i.email.split('@')[1]}</td>
                    <td className="px-4 py-2 text-gray-300">{i.status}</td>
                    <td className="px-4 py-2 text-gray-300">{i.password ? '••••••' : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : (
        <Section title="Buy For Me - Bulk Provisioning">
          <div className="text-sm text-gray-300 mb-3">Upload CSV with columns: <code>domain,email,personaName,password</code></div>
          <CSVUpload 
            expectedHeaders={["domain","email","personaName","password"]} 
            onParsed={handleCsvParsed}
            cta="Choose CSV for domains + inboxes + passwords" 
          />
        </Section>
      )}

      {fulfillmentMessage && (
        <div className={`p-4 rounded-lg border ${
          fulfillmentMessage.includes('Error') 
            ? 'bg-red-500/20 border-red-500/30 text-red-300' 
            : 'bg-green-500/20 border-green-500/30 text-green-300'
        }`}>
          {fulfillmentMessage}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {csvData ? `CSV loaded: ${csvData.length} rows ready for fulfillment` : 'Upload CSV to enable fulfillment'}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gray-800 border border-gray-700 text-gray-200 rounded-md px-3 py-2 text-sm hover:bg-gray-700"
          >
            Refresh
          </button>
          <button 
            onClick={handleMarkAsFulfilled}
            disabled={fulfilling || order.status === 'FULFILLED'}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              order.status === 'FULFILLED'
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : fulfilling
                ? 'bg-yellow-600 text-white cursor-wait'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {fulfilling ? 'Fulfilling...' : order.status === 'FULFILLED' ? 'Already Fulfilled' : 'Mark as Fulfilled'}
          </button>
        </div>
      </div>
    </div>
  );
}
