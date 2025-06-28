// Performance monitoring utilities

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initObservers();
    }
  }

  private initObservers() {
    // Core Web Vitals Observer
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric(entry.name, entry.value || 0);
          });
        });
        
        observer.observe({ entryTypes: ['measure', 'navigation'] });
        this.observers.push(observer);
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  recordMetric(name: string, value: number) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now()
    });

    // Log performance issues
    if (this.isSlowMetric(name, value)) {
      console.warn(`Performance issue detected: ${name} = ${value}ms`);
    }
  }

  private isSlowMetric(name: string, value: number): boolean {
    const thresholds: Record<string, number> = {
      'page-load': 3000,
      'api-call': 1000,
      'component-render': 100,
      'image-load': 2000
    };

    return value > (thresholds[name] || 1000);
  }

  startTiming(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${name}-start`);
    }
  }

  endTiming(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${name}-end`);
      window.performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = window.performance.getEntriesByName(name, 'measure')[0];
      if (measure) {
        this.recordMetric(name, measure.duration);
      }
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clearMetrics() {
    this.metrics = [];
  }

  dispose() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Timing decorator for functions
export function withTiming<T extends (...args: any[]) => any>(
  fn: T,
  name?: string
): T {
  return ((...args: any[]) => {
    const timerName = name || fn.name || 'anonymous-function';
    performanceMonitor.startTiming(timerName);
    
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.finally(() => {
          performanceMonitor.endTiming(timerName);
        });
      } else {
        performanceMonitor.endTiming(timerName);
        return result;
      }
    } catch (error) {
      performanceMonitor.endTiming(timerName);
      throw error;
    }
  }) as T;
}

// Image loading optimization
export function optimizeImageLoading() {
  if (typeof window === 'undefined') return;

  // Lazy load images that are not in viewport
  const images = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach(img => {
      const imgElement = img as HTMLImageElement;
      imgElement.src = imgElement.dataset.src || '';
    });
  }
}

// Prefetch critical resources
export function prefetchResources(urls: string[]) {
  if (typeof window === 'undefined') return;

  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
}

// Memory usage monitoring
export function getMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return null;
  }

  const memory = (performance as any).memory;
  return {
    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
  };
}

// Network information
export function getNetworkInfo() {
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