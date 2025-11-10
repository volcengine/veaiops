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
 * Development experience optimization configuration
 * Provides debugging tools and performance monitoring in development environment
 */

import { memoryCache } from '@/utils/cache-manager';
import { performanceMonitor } from '@/utils/performance-monitor';
import React from 'react';

interface DevToolsConfig {
  /** Whether to enable performance monitoring */
  enablePerformanceMonitoring: boolean;
  /** Whether to enable cache debugging */
  enableCacheDebugging: boolean;
  /** Whether to enable component render tracking */
  enableRenderTracking: boolean;
  /** Whether to enable network request logging */
  enableNetworkLogging: boolean;
  /** Whether to enable error boundary debugging */
  enableErrorBoundaryDebugging: boolean;
}

class DevelopmentTools {
  private config: DevToolsConfig;
  private renderTracker: Map<string, number> = new Map<string, number>();

  constructor(config: Partial<DevToolsConfig> = {}) {
    this.config = {
      enablePerformanceMonitoring: true,
      enableCacheDebugging: true,
      enableRenderTracking: true,
      enableNetworkLogging: true,
      enableErrorBoundaryDebugging: true,
      ...config,
    };

    this.initialize();
  }

  /**
   * Initialize development tools
   */
  private initialize() {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Add global debug methods
    this.addGlobalDebugMethods();

    // Enable performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      this.enablePerformanceMonitoring();
    }

    // Enable cache debugging
    if (this.config.enableCacheDebugging) {
      this.enableCacheDebugging();
    }

    // Enable network request logging
    if (this.config.enableNetworkLogging) {
      this.enableNetworkLogging();
    }

    // Enable error boundary debugging
    if (this.config.enableErrorBoundaryDebugging) {
      this.enableErrorBoundaryDebugging();
    }
  }

  /**
   * Add global debug methods
   */
  private addGlobalDebugMethods() {
    if (typeof window === 'undefined') {
      return;
    }

    // Add to window object
    (window as any).__VOLCAIOPS_DEBUG__ = {
      // Get performance report
      getPerformanceReport: () => performanceMonitor.getPerformanceReport(),

      // Get cache statistics
      getCacheStats: () => memoryCache.getStats(),

      // Clear cache
      clearCache: () => memoryCache.clear(),

      // Get render statistics
      getRenderStats: () => Array.from(this.renderTracker.entries()),

      // Clear render statistics
      clearRenderStats: () => this.renderTracker.clear(),

      // Simulate slow network
      simulateSlowNetwork: (delay = 2000) => {
        this.simulateNetworkDelay(delay);
      },

      // Trigger error test
      triggerError: (message = 'Test error') => {
        throw new Error(message);
      },
    };
  }

  /**
   * Enable performance monitoring
   */
  private enablePerformanceMonitoring() {
    // Periodically output performance report
    setInterval(() => {
      const report = performanceMonitor.getPerformanceReport();
      if (report.score < 80) {
        // Output warning when performance score is below 80
        console.warn('[Performance] Low performance score:', report.score);
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Enable cache debugging
   */
  private enableCacheDebugging() {
    // Periodically output cache statistics
    setInterval(() => {
      memoryCache.getStats();
    }, 60000); // Output every minute
  }

  /**
   * Enable network request logging
   */
  private enableNetworkLogging() {
    if (typeof window === 'undefined') {
      return;
    }

    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0] instanceof Request ? args[0].url : args[0];

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // ✅ Correct: Convert error to Error object before throwing (complies with @typescript-eslint/only-throw-error rule)
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        throw errorObj;
      }
    };
  }

  /**
   * Enable error boundary debugging
   */
  private enableErrorBoundaryDebugging() {
    // Listen for uncaught errors
    window.addEventListener('error', (event) => {
      console.error('[DevTools] === Uncaught Error ===');
      console.error('[DevTools] Error:', event.error);
      console.error('[DevTools] Message:', event.message);
      console.error('[DevTools] Filename:', event.filename);
      console.error('[DevTools] Line:', event.lineno);
    });

    // Listen for unhandled Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[DevTools] === Unhandled Promise Rejection ===');
      console.error('[DevTools] Reason:', event.reason);
    });
  }

  /**
   * Simulate network delay
   */
  private simulateNetworkDelay(delay: number) {
    if (typeof window === 'undefined') {
      return;
    }

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return originalFetch(...args);
    };

    // Automatically restore after 5 minutes
    setTimeout(
      () => {
        window.fetch = originalFetch;
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Track component render
   */
  trackComponentRender(componentName: string) {
    if (!this.config.enableRenderTracking) {
      return;
    }

    const count = this.renderTracker.get(componentName) || 0;
    this.renderTracker.set(componentName, count + 1);

    // Warn if render count is too high
    if (count > 10) {
      console.warn(
        `[Performance] Component ${componentName} rendered ${count} times`,
      );
    }
  }

  /**
   * Get configuration
   */
  getConfig(): DevToolsConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<DevToolsConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create development tools instance
export const devTools = new DevelopmentTools();

/**
 * React Hook for component render tracking
 */
export const useRenderTracker = (componentName: string) => {
  if (process.env.NODE_ENV === 'development') {
    devTools.trackComponentRender(componentName);
  }
};

/**
 * Higher-order component for automatic component render tracking
 */
export const withRenderTracker = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string,
) => {
  if (process.env.NODE_ENV !== 'development') {
    return WrappedComponent;
  }

  const displayName =
    componentName || WrappedComponent.displayName || WrappedComponent.name;

  const TrackedComponent: React.FC<P> = (props) => {
    useRenderTracker(displayName);
    return React.createElement(WrappedComponent, props);
  };

  TrackedComponent.displayName = `withRenderTracker(${displayName})`;
  return TrackedComponent;
};

/**
 * Development environment specific logging tool
 */
export const devLog = {
  info: (_message: string, ..._args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[DevLog] ${_message}`, ..._args);
    }
    // Production environment - no logging
  },

  warn: (_message: string, ..._args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(_message, ..._args);
    }
    // Production environment - no logging
  },

  error: (_message: string, ..._args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(_message, ..._args);
    }
    // Production environment - no logging
  },

  group: (label: string) => {
    // console.log removed
  },

  groupEnd: () => {
    // console.log removed
  },
};
