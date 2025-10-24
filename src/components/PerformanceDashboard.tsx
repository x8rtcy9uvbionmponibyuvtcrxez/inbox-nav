"use client";

import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  lcp: number;
  fcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  timestamp: number;
}

interface PerformanceDashboardProps {
  showDetails?: boolean;
}

export default function PerformanceDashboard({ showDetails = false }: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    if (process.env.NODE_ENV !== 'development' && !showDetails) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const newMetrics: Partial<PerformanceMetrics> = {};

      entries.forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          newMetrics.lcp = entry.startTime;
        } else if (entry.entryType === 'first-contentful-paint') {
          newMetrics.fcp = entry.startTime;
        } else if (entry.entryType === 'first-input') {
          newMetrics.fid = (entry as any).processingStart - entry.startTime;
        } else if (entry.entryType === 'layout-shift') {
          newMetrics.cls = (entry as any).value;
        } else if (entry.entryType === 'navigation') {
          newMetrics.ttfb = (entry as any).responseStart - (entry as any).requestStart;
        }
      });

      if (Object.keys(newMetrics).length > 0) {
        setMetrics(prev => ({
          ...prev,
          ...newMetrics,
          timestamp: Date.now()
        } as PerformanceMetrics));
      }
    });

    // Observe all performance entry types
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-contentful-paint', 'first-input', 'layout-shift', 'navigation'] });
    } catch (e) {
      // Some browsers don't support all entry types
      console.warn('Performance monitoring not fully supported');
    }

    return () => observer.disconnect();
  }, [showDetails]);

  const getScore = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return { score: 'Good', color: 'text-green-400' };
    if (value <= thresholds.poor) return { score: 'Needs Improvement', color: 'text-yellow-400' };
    return { score: 'Poor', color: 'text-red-400' };
  };

  const lcpScore = metrics?.lcp ? getScore(metrics.lcp, { good: 2500, poor: 4000 }) : null;
  const fcpScore = metrics?.fcp ? getScore(metrics.fcp, { good: 1800, poor: 3000 }) : null;
  const fidScore = metrics?.fid ? getScore(metrics.fid, { good: 100, poor: 300 }) : null;
  const clsScore = metrics?.cls ? getScore(metrics.cls, { good: 0.1, poor: 0.25 }) : null;
  const ttfbScore = metrics?.ttfb ? getScore(metrics.ttfb, { good: 800, poor: 1800 }) : null;

  if (!metrics || process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-mono border border-white/20 hover:bg-black/90 transition-colors"
      >
        Perf {isVisible ? '▼' : '▲'}
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-black/90 text-white p-4 rounded-lg border border-white/20 min-w-[300px] font-mono text-xs">
          <div className="space-y-2">
            <div className="text-sm font-bold mb-3 text-center">Performance Metrics</div>
            
            {metrics.lcp && (
              <div className="flex justify-between items-center">
                <span>LCP:</span>
                <span className={lcpScore?.color}>
                  {metrics.lcp.toFixed(0)}ms ({lcpScore?.score})
                </span>
              </div>
            )}
            
            {metrics.fcp && (
              <div className="flex justify-between items-center">
                <span>FCP:</span>
                <span className={fcpScore?.color}>
                  {metrics.fcp.toFixed(0)}ms ({fcpScore?.score})
                </span>
              </div>
            )}
            
            {metrics.fid && (
              <div className="flex justify-between items-center">
                <span>FID:</span>
                <span className={fidScore?.color}>
                  {metrics.fid.toFixed(0)}ms ({fidScore?.score})
                </span>
              </div>
            )}
            
            {metrics.cls && (
              <div className="flex justify-between items-center">
                <span>CLS:</span>
                <span className={clsScore?.color}>
                  {metrics.cls.toFixed(3)} ({clsScore?.score})
                </span>
              </div>
            )}
            
            {metrics.ttfb && (
              <div className="flex justify-between items-center">
                <span>TTFB:</span>
                <span className={ttfbScore?.color}>
                  {metrics.ttfb.toFixed(0)}ms ({ttfbScore?.score})
                </span>
              </div>
            )}
            
            <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-white/10">
              Updated: {new Date(metrics.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
