// Performance monitoring utilities

export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.then((value) => {
      const end = performance.now();
      console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
      return value;
    });
  } else {
    const end = performance.now();
    console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  }
}

export function createPerformanceMarker(name: string) {
  const start = performance.now();
  
  return {
    end: () => {
      const end = performance.now();
      console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
      return end - start;
    }
  };
}

// Web Vitals monitoring
export function reportWebVitals(metric: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric);
  }
  
  // Send to analytics service in production
  if (process.env.NODE_ENV === 'production') {
    // Example: send to Vercel Analytics or custom analytics
    // analytics.track('web-vital', metric);
  }
}
