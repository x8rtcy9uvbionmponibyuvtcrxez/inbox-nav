"use client";

import { useState, useMemo } from "react";
import { InboxIcon, GlobeAltIcon, CurrencyDollarIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { OrderSkeleton, StatsSkeleton } from "@/components/skeletons";
import { useInboxes } from "@/hooks/useInboxes";
import { useDomains } from "@/hooks/useDomains";
import { Button } from "@/components/ui/Button";

interface Order {
  id: string;
  status: string;
  subscriptionStatus: string;
  productType: string;
  quantity: number;
  totalAmount: number;
  createdAt: string;
  cancelledAt?: string | null;
}

interface DashboardClientOptimizedProps {
  orders: Order[];
}

export default function DashboardClientOptimized({ orders }: DashboardClientOptimizedProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Use Zustand store for inboxes and domains
  const { inboxes, loading: inboxesLoading } = useInboxes();
  const { domains, loading: domainsLoading } = useDomains();

  // Memoized statistics calculation
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const activeOrders = orders.filter(order => 
      order.status === 'FULFILLED' && 
      order.subscriptionStatus !== 'cancelled' && 
      order.subscriptionStatus !== 'cancel_at_period_end'
    ).length;
    
    const totalInboxes = inboxes.length;
    const liveInboxes = inboxes.filter(inbox => inbox.status === 'LIVE').length;
    
    const totalDomains = domains.length;
    const liveDomains = domains.filter(domain => domain.status === 'LIVE').length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    return {
      totalOrders,
      activeOrders,
      totalInboxes,
      liveInboxes,
      totalDomains,
      liveDomains,
      totalRevenue: totalRevenue / 100, // Convert cents to dollars
    };
  }, [orders, inboxes, domains]);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    // For now, just log the order - modal would need full order data with relations
    console.log('Selected order:', order);
  };

  // Show loading state if data is still loading
  if (inboxesLoading || domainsLoading) {
    return (
      <div className="space-y-8 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <StatsSkeleton />
        <OrderSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingCartIcon className="h-8 w-8 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Total Orders</p>
              <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
              <p className="text-sm text-green-400">{stats.activeOrders} active</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <InboxIcon className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Inboxes</p>
              <p className="text-2xl font-bold text-white">{stats.totalInboxes}</p>
              <p className="text-sm text-green-400">{stats.liveInboxes} live</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <GlobeAltIcon className="h-8 w-8 text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Domains</p>
              <p className="text-2xl font-bold text-white">{stats.totalDomains}</p>
              <p className="text-sm text-green-400">{stats.liveDomains} live</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Revenue</p>
              <p className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/20 divide-y divide-gray-700">
              {orders.map((order) => {
                const isCancelled = order.status === 'CANCELLED' || order.subscriptionStatus === 'cancel_at_period_end';
                
                return (
                  <tr 
                    key={order.id}
                    className={`hover:bg-gray-700/30 cursor-pointer transition-colors ${
                      isCancelled ? 'opacity-60' : ''
                    }`}
                    onClick={() => handleOrderClick(order)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        #{order.id.slice(-8)}
                      </div>
                      {isCancelled && (
                        <div className="text-xs text-red-400">
                          Cancelled {order.cancelledAt ? new Date(order.cancelledAt).toLocaleDateString() : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-200 capitalize">
                        {order.productType.toLowerCase()}
                      </div>
                      <div className="text-xs text-gray-400">
                        Qty: {order.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isCancelled 
                          ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                          : order.status === 'FULFILLED'
                          ? 'bg-green-500/15 text-green-300 border border-green-500/30'
                          : 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30'
                      }`}>
                        {isCancelled ? 'Cancelled' : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      ${((order.totalAmount || 0) / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(order);
                        }}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Order Info */}
      {selectedOrder && (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Selected Order</h3>
          <p className="text-sm text-gray-300">
            Order #{selectedOrder.id.slice(-8)} - {selectedOrder.productType} 
            ({selectedOrder.quantity} qty) - ${(selectedOrder.totalAmount / 100).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
