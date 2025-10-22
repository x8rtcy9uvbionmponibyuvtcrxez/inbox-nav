"use client";

import { memo } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import type { Prisma } from '@prisma/client';

type OrderWithRelations = Prisma.OnboardingDataGetPayload<{
  include: {
    order: {
      include: {
        inboxes: true;
        domains: true;
      };
    };
  };
}>;

interface OrderCardProps {
  order: OrderWithRelations;
  onOrderClick: (order: OrderWithRelations) => void;
}

const OrderCard = memo(function OrderCard({ order, onOrderClick }: OrderCardProps) {
  const orderData = order.order;
  
  if (!orderData) return null;

  const formatCurrency = (amountInCents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amountInCents / 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FULFILLED': return 'text-green-400';
      case 'PENDING': return 'text-yellow-400';
      case 'FAILED': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div 
      className="surface-card cursor-pointer p-6 hover:bg-[var(--bg-tertiary)] transition-colors"
      onClick={() => onOrderClick(order)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-[12px] bg-[var(--bg-tertiary)] p-3">
            <ShoppingCartIcon className="h-6 w-6 text-[var(--text-primary)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">
              Order #{orderData.id.slice(-8)}
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {orderData.productType} • {orderData.quantity} units
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-[var(--text-primary)]">
            {formatCurrency(orderData.totalAmount || 0)}
          </p>
          <p className={`text-sm ${getStatusColor(orderData.status)}`}>
            {orderData.status}
          </p>
        </div>
      </div>
    </div>
  );
});

export default OrderCard;
