// Performance monitoring utilities
export interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // LCP Observer
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        this.metrics.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // FID Observer
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cls = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }

    // FCP measurement
    if ('PerformanceObserver' in window) {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.metrics.fcp = fcpEntry.startTime;
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(fcpObserver);
    }

    // TTFB measurement
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const navigationEntry = entries[0] as PerformanceNavigationTiming;
        if (navigationEntry) {
          this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
          this.metrics.loadTime = navigationEntry.loadEventEnd - navigationEntry.loadEventStart;
        }
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);
    }

    // Memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  }

  getMetrics(): PerformanceMetrics {
    return this.metrics as PerformanceMetrics;
  }

  // Send metrics to analytics
  sendMetrics() {
    const metrics = this.getMetrics();
    
    // Send to Vercel Analytics (if available)
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', 'performance_metrics', metrics);
    }

    // Send to custom analytics endpoint
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metrics),
    }).catch(console.error);

    console.log('Performance Metrics:', metrics);
  }

  // Cleanup observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Hook for React components
export function usePerformanceMonitor() {
  const monitor = new PerformanceMonitor();

  // Send metrics after page load
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        monitor.sendMetrics();
      }, 2000); // Wait 2 seconds for all metrics to be collected
    });
  }

  return monitor;
}

// Core Web Vitals thresholds
export const CORE_WEB_VITALS_THRESHOLDS = {
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  fcp: { good: 1800, needsImprovement: 3000 },
  ttfb: { good: 800, needsImprovement: 1800 },
};

export function getPerformanceScore(metrics: PerformanceMetrics): 'good' | 'needs-improvement' | 'poor' {
  const { lcp, fid, cls, fcp, ttfb } = metrics;
  const thresholds = CORE_WEB_VITALS_THRESHOLDS;

  let score = 0;
  let total = 0;

  if (lcp !== undefined) {
    total++;
    if (lcp <= thresholds.lcp.good) score++;
    else if (lcp <= thresholds.lcp.needsImprovement) score += 0.5;
  }

  if (fid !== undefined) {
    total++;
    if (fid <= thresholds.fid.good) score++;
    else if (fid <= thresholds.fid.needsImprovement) score += 0.5;
  }

  if (cls !== undefined) {
    total++;
    if (cls <= thresholds.cls.good) score++;
    else if (cls <= thresholds.cls.needsImprovement) score += 0.5;
  }

  if (fcp !== undefined) {
    total++;
    if (fcp <= thresholds.fcp.good) score++;
    else if (fcp <= thresholds.fcp.needsImprovement) score += 0.5;
  }

  if (ttfb !== undefined) {
    total++;
    if (ttfb <= thresholds.ttfb.good) score++;
    else if (ttfb <= thresholds.ttfb.needsImprovement) score += 0.5;
  }

  const percentage = (score / total) * 100;

  if (percentage >= 80) return 'good';
  if (percentage >= 60) return 'needs-improvement';
  return 'poor';
}