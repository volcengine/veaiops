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

/**
 * Route performance analyzer
 * Used to monitor and analyze route loading performance, providing optimization suggestions
 */

interface RoutePerformanceMetrics {
  /** Route path */
  path: string;
  /** Component name */
  componentName: string;
  /** Load start time */
  loadStartTime: number;
  /** Load end time */
  loadEndTime: number;
  /** Total load duration */
  loadDuration: number;
  /** Component size (bytes) */
  bundleSize?: number;
  /** Whether preloading is used */
  preloaded: boolean;
  /** Error message */
  error?: string;
}

interface PerformanceThresholds {
  /** Load time warning threshold (milliseconds) */
  loadTimeWarning: number;
  /** Load time error threshold (milliseconds) */
  loadTimeError: number;
  /** Bundle size warning threshold (bytes) */
  bundleSizeWarning: number;
  /** Bundle size error threshold (bytes) */
  bundleSizeError: number;
}

class RoutePerformanceAnalyzer {
  private metrics: Map<string, RoutePerformanceMetrics[]> = new Map();
  private thresholds: PerformanceThresholds = {
    loadTimeWarning: 1000, // 1 second
    loadTimeError: 3000, // 3 seconds
    bundleSizeWarning: 500 * 1024, // 500KB
    bundleSizeError: 1024 * 1024, // 1MB
  };

  /**
   * Start monitoring route loading
   */
  startRouteLoad({
    path,
    componentName,
  }: {
    path: string;
    componentName: string;
  }): string {
    const loadId = `${path}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const startTime = performance.now();

    // Store start time
    if (!this.metrics.has(path)) {
      this.metrics.set(path, []);
    }

    const metric: RoutePerformanceMetrics = {
      path,
      componentName,
      loadStartTime: startTime,
      loadEndTime: 0,
      loadDuration: 0,
      preloaded: false,
    };

    this.metrics.get(path)!.push(metric);

    return loadId;
  }

  /**
   * End route loading monitoring
   */
  endRouteLoad({
    path,
    options,
  }: {
    path: string;
    options?: {
      error?: string;
      bundleSize?: number;
      preloaded?: boolean;
    };
  }): void {
    const pathMetrics = this.metrics.get(path);
    if (!pathMetrics || pathMetrics.length === 0) {
      return;
    }

    const latestMetric = pathMetrics[pathMetrics.length - 1];
    const endTime = performance.now();

    latestMetric.loadEndTime = endTime;
    latestMetric.loadDuration = endTime - latestMetric.loadStartTime;
    latestMetric.bundleSize = options?.bundleSize;
    latestMetric.preloaded = options?.preloaded || false;
    latestMetric.error = options?.error;

    // Analyze performance and output suggestions
    this.analyzePerformance(latestMetric);
  }

  /**
   * Analyze single route performance
   */
  private analyzePerformance(metric: RoutePerformanceMetrics): void {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check load time
    if (metric.loadDuration > this.thresholds.loadTimeError) {
      issues.push(`Load time too long: ${metric.loadDuration.toFixed(2)}ms`);
      suggestions.push('Consider further component splitting or using preloading');
    } else if (metric.loadDuration > this.thresholds.loadTimeWarning) {
      issues.push(`Load time is long: ${metric.loadDuration.toFixed(2)}ms`);
      suggestions.push('Consider using preloading or optimizing component size');
    }

    // Check bundle size
    if (metric.bundleSize) {
      if (metric.bundleSize > this.thresholds.bundleSizeError) {
        issues.push(`Bundle size too large: ${(metric.bundleSize / 1024).toFixed(2)}KB`);
        suggestions.push('Consider code splitting or removing unnecessary dependencies');
      } else if (metric.bundleSize > this.thresholds.bundleSizeWarning) {
        issues.push(`Bundle size is large: ${(metric.bundleSize / 1024).toFixed(2)}KB`);
        suggestions.push('Consider optimizing dependencies or using dynamic imports');
      }
    }

    // Check errors
    if (metric.error) {
      issues.push(`Load error: ${metric.error}`);
      suggestions.push('Check if component code and dependencies are correct');
    }

    // Output analysis results
    if (issues.length > 0) {
      console.group(`🔍 [RoutePerformance] ${metric.path} Performance Analysis`);

      console.groupEnd();
    } else if (metric.loadDuration > 100) {
      // Load time exceeds 100ms but no performance issues, can add warning log here
    }
  }

  /**
   * Get route performance statistics
   */
  getRouteStats(path: string): {
    averageLoadTime: number;
    minLoadTime: number;
    maxLoadTime: number;
    totalLoads: number;
    errorRate: number;
    preloadRate: number;
  } | null {
    const pathMetrics = this.metrics.get(path);
    if (!pathMetrics || pathMetrics.length === 0) {
      return null;
    }

    const loadTimes = pathMetrics.map((m) => m.loadDuration);
    const errors = pathMetrics.filter((m) => m.error).length;
    const preloads = pathMetrics.filter((m) => m.preloaded).length;

    return {
      averageLoadTime: loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length,
      minLoadTime: Math.min(...loadTimes),
      maxLoadTime: Math.max(...loadTimes),
      totalLoads: pathMetrics.length,
      errorRate: errors / pathMetrics.length,
      preloadRate: preloads / pathMetrics.length,
    };
  }

  /**
   * Get performance report for all routes
   */
  getPerformanceReport(): {
    totalRoutes: number;
    averageLoadTime: number;
    slowestRoutes: Array<{ path: string; averageTime: number }>;
    mostErrorProneRoutes: Array<{ path: string; errorRate: number }>;
    recommendations: string[];
  } {
    const allPaths = Array.from(this.metrics.keys());
    const allStats = allPaths
      .map((path) => ({
        path,
        stats: this.getRouteStats(path)!,
      }))
      .filter((item) => item.stats);

    const totalLoadTime = allStats.reduce(
      (sum, item) => sum + item.stats.averageLoadTime,
      0,
    );
    const averageLoadTime = totalLoadTime / allStats.length;

    const slowestRoutes = allStats
      .sort((a, b) => b.stats.averageLoadTime - a.stats.averageLoadTime)
      .slice(0, 5)
      .map((item) => ({
        path: item.path,
        averageTime: item.stats.averageLoadTime,
      }));

    const mostErrorProneRoutes = allStats
      .filter((item) => item.stats.errorRate > 0)
      .sort((a, b) => b.stats.errorRate - a.stats.errorRate)
      .slice(0, 5)
      .map((item) => ({
        path: item.path,
        errorRate: item.stats.errorRate,
      }));

    const recommendations: string[] = [];

    if (averageLoadTime > this.thresholds.loadTimeWarning) {
      recommendations.push('Overall load time is high, consider enabling more preloading');
    }

    if (slowestRoutes.length > 0) {
      recommendations.push(`Prioritize optimizing slowest route: ${slowestRoutes[0].path}`);
    }

    if (mostErrorProneRoutes.length > 0) {
      recommendations.push(
        `Fix route with highest error rate: ${mostErrorProneRoutes[0].path}`,
      );
    }

    return {
      totalRoutes: allPaths.length,
      averageLoadTime,
      slowestRoutes,
      mostErrorProneRoutes,
      recommendations,
    };
  }

  /**
   * Clear performance data
   */
  clearMetrics(path?: string): void {
    if (path) {
      this.metrics.delete(path);
    } else {
      this.metrics.clear();
    }
  }

  /**
   * Set performance thresholds
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Export performance data
   */
  exportMetrics(): string {
    const data = {
      timestamp: new Date().toISOString(),
      thresholds: this.thresholds,
      metrics: Array.from(this.metrics.entries()).reduce(
        (obj, [key, value]) => {
          obj[key] = value;
          return obj;
        },
        {} as Record<string, any>,
      ),
      report: this.getPerformanceReport(),
    };

    return JSON.stringify(data, null, 2);
  }
}

// Create global instance
export const routePerformanceAnalyzer = new RoutePerformanceAnalyzer();

// Performance monitoring helper in development environment
if (process.env.NODE_ENV === 'development') {
  // Add to global object for easy debugging
  (window as any).__routePerformanceAnalyzer = routePerformanceAnalyzer;

  // Periodically output performance report
  setInterval(() => {
    const report = routePerformanceAnalyzer.getPerformanceReport();
    if (report.totalRoutes > 0) {
      console.group('📊 路由性能报告');
      console.table({
        总路由数: report.totalRoutes,
        平均加载时间: `${report.averageLoadTime.toFixed(2)}ms`,
        最慢路由: report.slowestRoutes[0]?.path || 'N/A',
        错误最多路由: report.mostErrorProneRoutes[0]?.path || 'N/A',
      });
      // TODO: Handle performance recommendations - if (report.recommendations.length > 0) { ... }
      console.groupEnd();
    }
  }, 30000); // Output every 30 seconds
}

export default RoutePerformanceAnalyzer;
