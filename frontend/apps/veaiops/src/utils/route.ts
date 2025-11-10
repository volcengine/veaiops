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

import { routesConfig } from '@/config/route-config';
import type { RouteConfig, RouteUtils } from '@/types/route';

/**
 * Route utility functions
 * Provides utility functions related to routing
 */
export const routeUtils: RouteUtils = {
  /**
   * Get route configuration by path
   * @param path Route path
   * @returns Route configuration object or undefined
   */
  getRouteByPath: (path: string): RouteConfig | undefined => {
    return routesConfig.find((route) => route.path === path);
  },

  /**
   * Get routes that require authentication
   * @returns Array of route configurations that require authentication
   */
  getAuthRequiredRoutes: (): RouteConfig[] => {
    return routesConfig.filter((route) => route.requireAuth !== false);
  },

  /**
   * Get routes that do not require authentication
   * @returns Array of public route configurations
   */
  getPublicRoutes: (): RouteConfig[] => {
    return routesConfig.filter((route) => route.requireAuth === false);
  },

  /**
   * Check if path requires authentication
   * @param path Route path
   * @returns Whether authentication is required
   */
  requiresAuth: (path: string): boolean => {
    const route = routeUtils.getRouteByPath(path);
    return route?.requireAuth !== false;
  },
};
