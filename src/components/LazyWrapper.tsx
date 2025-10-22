"use client";

import { Suspense, lazy, ComponentType } from 'react';
import LoadingSpinner from './animations/LoadingSpinner';

interface LazyWrapperProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function LazyWrapper({ 
  fallback = <LoadingSpinner size="lg" className="mx-auto my-8" />, 
  children 
}: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

// Lazy load heavy components
export const LazyOrderDetailsModal = lazy(() => import('./OrderDetailsModal'));
export const LazyInboxesClient = lazy(() => import('../app/dashboard/inboxes/InboxesClient'));
export const LazyDomainsClient = lazy(() => import('../app/dashboard/domains/DomainsClient'));
export const LazyProductsPage = lazy(() => import('../app/dashboard/products/page'));

// Higher-order component for lazy loading
export function withLazyLoading<T extends object>(
  Component: ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function LazyComponent(props: T) {
    return (
      <LazyWrapper fallback={fallback}>
        <Component {...props} />
      </LazyWrapper>
    );
  };
}
