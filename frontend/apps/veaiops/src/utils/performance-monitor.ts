// Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. and/or its affiliates
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';

/**
 * Performance monitoring tool
 * Used to monitor application performance metrics and optimization suggestions
 */

interface PerformanceMetrics {
  /** Page load time */
  loadTime: number;
  /** First Contentful Paint time */
  fcp: number;
  /** Largest Contentful Paint time */
  lcp: number;
  /** Cumulative Layout Shift */
  cls: number;
  /** First Input Delay */
  fid: number;
}

interface ComponentPerformance {
  /** Component name */
  name: string;
  /** Render time */
  renderTime: number;
  /** Rerender count */
  rerenderCount: number;
  /** Last update time */
  lastUpdate: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private componentMetrics: Map<string, ComponentPerformance> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers() {
    if (typeof window === 'undefined') {
      return;
    }

    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        // Observe page load performance
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.metrics.loadTime =
                navEntry.loadEventEnd - navEntry.fetchStart;
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);

        // Observe paint performance
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = entry.startTime;
            }
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);

        // Observe Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.lcp = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        // PerformanceObserver initialization failed (browser not supported or permission issue), silently handle
      }
    }
  }

  /**
   * Record component performance
   */
  recordComponentPerformance({
    componentName,
    renderTime,
  }: {
    componentName: string;
    renderTime: number;
  }) {
    const existing = this.componentMetrics.get(componentName);
    if (existing) {
      existing.renderTime = renderTime;
      existing.rerenderCount += 1;
      existing.lastUpdate = Date.now();
    } else {
      this.componentMetrics.set(componentName, {
        name: componentName,
        renderTime,
        rerenderCount: 1,
        lastUpdate: Date.now(),
      });
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Get component performance metrics
   */
  getComponentMetrics(): ComponentPerformance[] {
    return Array.from(this.componentMetrics.values());
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    const metrics = this.getMetrics();
    const componentMetrics = this.getComponentMetrics();

    // Performance score
    const score = this.calculatePerformanceScore(metrics);

    // Optimization suggestions
    const suggestions = this.generateOptimizationSuggestions(
      metrics,
      componentMetrics,
    );

    return {
      score,
      metrics,
      componentMetrics,
      suggestions,
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate performance score (0-100)
   */
  private calculatePerformanceScore(
    metrics: Partial<PerformanceMetrics>,
  ): number {
    let score = 100;

    // FCP score (ideal < 1.8s)
    if (metrics.fcp) {
      if (metrics.fcp > 3000) {
        score -= 20;
      } else if (metrics.fcp > 1800) {
        score -= 10;
      }
    }

    // LCP score (ideal < 2.5s)
    if (metrics.lcp) {
      if (metrics.lcp > 4000) {
        score -= 25;
      } else if (metrics.lcp > 2500) {
        score -= 15;
      }
    }

    // Load time score (ideal < 3s)
    if (metrics.loadTime) {
      if (metrics.loadTime > 5000) {
        score -= 20;
      } else if (metrics.loadTime > 3000) {
        score -= 10;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(
    metrics: Partial<PerformanceMetrics>,
    componentMetrics: ComponentPerformance[],
  ): string[] {
    const suggestions: string[] = [];

    // Suggestions based on performance metrics
    if (metrics.fcp && metrics.fcp > 1800) {
      suggestions.push('First Contentful Paint time is long, consider optimizing critical resource loading');
    }

    if (metrics.lcp && metrics.lcp > 2500) {
      suggestions.push('Largest Contentful Paint time is long, consider optimizing image and font loading');
    }

    if (metrics.loadTime && metrics.loadTime > 3000) {
      suggestions.push('Page load time is long, consider enabling code splitting and lazy loading');
    }

    // Suggestions based on component performance
    const slowComponents = componentMetrics.filter((c) => c.renderTime > 100);
    if (slowComponents.length > 0) {
      suggestions.push(
        `Found ${slowComponents.length} slow-rendering components, consider optimizing with React.memo`,
      );
    }

    const frequentRerenders = componentMetrics.filter(
      (c) => c.rerenderCount > 10,
    );
    if (frequentRerenders.length > 0) {
      suggestions.push(
        `Found ${frequentRerenders.length} frequently rerendering components, consider checking dependencies`,
      );
    }

    return suggestions;
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Create global instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React Hook for monitoring component performance
 */
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = performance.now();

  return {
    recordRender: () => {
      const renderTime = performance.now() - startTime;
      performanceMonitor.recordComponentPerformance({
        componentName,
        renderTime,
      });
    },
  };
};

/**
 * Higher-order component for automatic component performance monitoring
 */
export const withPerformanceMonitor = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string,
) => {
  const displayName =
    componentName || WrappedComponent.displayName || WrappedComponent.name;

  const MonitoredComponent: React.FC<P> = (props) => {
    const { recordRender } = usePerformanceMonitor(displayName);

    React.useEffect(() => {
      recordRender();
    });

    return React.createElement(WrappedComponent, props);
  };

  MonitoredComponent.displayName = `withPerformanceMonitor(${displayName})`;
  return MonitoredComponent;
};
