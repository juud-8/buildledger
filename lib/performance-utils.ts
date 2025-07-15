// Performance monitoring utilities

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Observe Core Web Vitals
    try {
      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('FID', entry.processingStart - entry.startTime, 'ms');
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      this.observers.push(fidObserver);

      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime, 'ms');
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(lcpObserver);

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.recordMetric('CLS', clsValue, 'score');
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(clsObserver);

    } catch (error) {
      console.warn('Performance observers not supported:', error);
    }
  }

  recordMetric(name: string, value: number, unit: string = 'ms') {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now()
    };
    this.metrics.push(metric);
    
    // Log significant performance issues
    this.checkThresholds(metric);
  }

  private checkThresholds(metric: PerformanceMetric) {
    const thresholds = {
      'LCP': 2500, // 2.5s
      'FID': 100,  // 100ms
      'CLS': 0.1   // 0.1 score
    };

    const threshold = thresholds[metric.name as keyof typeof thresholds];
    if (threshold && metric.value > threshold) {
      console.warn(`Performance warning: ${metric.name} (${metric.value}${metric.unit}) exceeds threshold (${threshold}${metric.unit})`);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getAverageMetric(name: string): number | null {
    const matching = this.metrics.filter(m => m.name === name);
    if (matching.length === 0) return null;
    
    const sum = matching.reduce((acc, m) => acc + m.value, 0);
    return sum / matching.length;
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// Create global instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions
export function measureFunctionTime<T>(
  fn: () => T,
  name: string
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  performanceMonitor.recordMetric(`Function: ${name}`, end - start, 'ms');
  return result;
}

export async function measureAsyncFunctionTime<T>(
  fn: () => Promise<T>,
  name: string
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  performanceMonitor.recordMetric(`Async Function: ${name}`, end - start, 'ms');
  return result;
}

// React hook for performance monitoring
export function usePerformanceMetrics() {
  const recordMetric = (name: string, value: number, unit?: string) => {
    performanceMonitor.recordMetric(name, value, unit);
  };

  const getMetrics = () => performanceMonitor.getMetrics();
  
  const getAverageMetric = (name: string) => performanceMonitor.getAverageMetric(name);

  return {
    recordMetric,
    getMetrics,
    getAverageMetric
  };
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if (typeof window === 'undefined' || !(performance as any).memory) {
    return null;
  }

  const memory = (performance as any).memory;
  return {
    used: Math.round(memory.usedJSHeapSize / 1048576 * 100) / 100, // MB
    total: Math.round(memory.totalJSHeapSize / 1048576 * 100) / 100, // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1048576 * 100) / 100 // MB
  };
}

// Network performance monitoring
export function monitorNetworkPerformance() {
  if (typeof window === 'undefined' || !('connection' in navigator)) {
    return null;
  }

  const connection = (navigator as any).connection;
  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData
  };
}