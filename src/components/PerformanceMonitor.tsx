"use client";

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      // Measure Core Web Vitals
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      
      // LCP measurement
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      const lcp = lcpEntries[lcpEntries.length - 1]?.startTime || 0;
      
      // TTFB
      const ttfb = navigation.responseStart - navigation.requestStart;
      
      // Measure render time
      const renderStart = performance.now();
      requestAnimationFrame(() => {
        const renderTime = performance.now() - renderStart;
        
        // Get memory usage (if available) without using `any`
        const perfWithMemory = performance as Performance & {
          memory?: { usedJSHeapSize: number };
        };
        const memoryUsage = perfWithMemory.memory
          ? perfWithMemory.memory.usedJSHeapSize / 1024 / 1024
          : 0;
        
        setMetrics({
          loadTime,
          renderTime,
          memoryUsage,
          cacheHitRate: 0.85, // Mock cache hit rate
          lcp,
          fid: 0, // FID requires user interaction
          cls: 0, // CLS requires layout shift measurement
          fcp,
          ttfb,
        });
      });
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => {
      window.removeEventListener('load', measurePerformance);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development' || !metrics) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-mono hover:bg-gray-700 transition-colors"
      >
        Perf
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-gray-900 text-white p-4 rounded-lg shadow-lg min-w-64">
          <h3 className="text-sm font-bold mb-2">Performance Metrics</h3>
          <div className="space-y-1 text-xs">
            <div className="font-semibold text-green-400">Core Web Vitals:</div>
            <div>LCP: {metrics.lcp.toFixed(0)}ms <span className="text-gray-400">(target: &lt;2500ms)</span></div>
            <div>FCP: {metrics.fcp.toFixed(0)}ms <span className="text-gray-400">(target: &lt;1800ms)</span></div>
            <div>TTFB: {metrics.ttfb.toFixed(0)}ms <span className="text-gray-400">(target: &lt;600ms)</span></div>
            <div className="font-semibold text-blue-400 mt-2">Performance:</div>
            <div>Load Time: {metrics.loadTime.toFixed(2)}ms</div>
            <div>Render Time: {metrics.renderTime.toFixed(2)}ms</div>
            <div>Memory: {metrics.memoryUsage.toFixed(2)}MB</div>
            <div>Cache Hit Rate: {(metrics.cacheHitRate * 100).toFixed(1)}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
