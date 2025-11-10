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

import React, { Suspense, memo } from 'react';
import { routePerformanceAnalyzer } from '../../../utils/route-performance-analyzer';
import { RouteErrorBoundary, RouteLoadingFallback } from './components';
import type { LazyComponent, RouteConfig, RouteConfigItem } from './types';

/**
 * Create lazy-loaded route configuration
 * @param config Route configuration object
 */
export const createLazyRoute = (config: {
  path: string;
  component: LazyComponent;
  title: string;
  requireAuth?: boolean;
  preload?: boolean;
  meta?: RouteConfig['meta'];
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}): RouteConfig => {
  const {
    path,
    component: LazyComponent,
    title,
    requireAuth = true,
    preload = false,
    meta,
    fallback,
  } = config;

  // Preload functionality
  const handlePreload = !preload
    ? undefined
    : () => {
        try {
          // Trigger component preload
          (LazyComponent as any).preload?.();
        } catch (error) {
          // Silent handling: preload failure does not affect normal component loading
        }
      };

  // Create wrapped component to support performance monitoring
  const WrappedComponent = memo((props: any) => {
    const startTime = performance.now();
    // Start route load monitoring
    routePerformanceAnalyzer.startRouteLoad({ path, componentName: title });

    React.useEffect(() => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // End route load monitoring
      routePerformanceAnalyzer.endRouteLoad({
        path,
        options: {
          preloaded: preload,
        },
      });

      // Record route load performance
      if (loadTime > 100) {
        // Only record loads exceeding 100ms
      }
    }, [startTime]);

    return React.createElement(LazyComponent, {
      ...props,
      onMouseEnter: handlePreload,
    });
  });

  WrappedComponent.displayName = `LazyRoute(${title})`;

  return {
    path,
    element: React.createElement(RouteErrorBoundary, {
      fallback,
      // biome-ignore lint/correctness/noChildrenProp: RouteErrorBoundary requires children prop
      children: React.createElement(
        Suspense,
        { fallback: React.createElement(RouteLoadingFallback) },
        React.createElement(WrappedComponent),
      ),
    }),
    title,
    requireAuth,
    meta,
  };
};

/**
 * Batch create route configurations
 * @param routes Route configuration array
 */
export const createLazyRoutes = (routes: RouteConfigItem[]): RouteConfig[] => {
  // Use Map to cache created routes, avoid duplicate creation
  const routeCache = new Map<string, RouteConfig>();

  return routes.map((routeConfig) => {
    const cacheKey = `${routeConfig.path}_${routeConfig.title}`;

    if (routeCache.has(cacheKey)) {
      return routeCache.get(cacheKey)!;
    }

    const route = createLazyRoute(routeConfig);
    routeCache.set(cacheKey, route);

    return route;
  });
};

/**
 * Create route group, supports nested routes
 * @param groupConfig Route group configuration
 */
export const createRouteGroup = (groupConfig: {
  prefix: string;
  routes: RouteConfigItem[];
  middleware?: Array<(route: RouteConfig) => RouteConfig>;
}): RouteConfig[] => {
  const { prefix, routes, middleware = [] } = groupConfig;

  const processedRoutes = routes.map((route) => ({
    ...route,
    path: `${prefix}${route.path}`,
  }));

  let createdRoutes = createLazyRoutes(processedRoutes);

  // Apply middleware
  middleware.forEach((middlewareFn) => {
    createdRoutes = createdRoutes.map(middlewareFn);
  });

  return createdRoutes;
};
