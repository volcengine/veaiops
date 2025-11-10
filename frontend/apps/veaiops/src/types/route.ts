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

import type React from 'react';

/**
 * Route configuration type definition
 */
export interface RouteConfig {
  /** Route path */
  path: string;
  /** React component element */
  element: React.ReactElement;
  /** Page title */
  title?: string;
  /** Icon name */
  icon?: string;
  /** Whether authentication is required */
  requireAuth?: boolean;
  /** Child route configuration */
  children?: RouteConfig[];
}

/**
 * Page configuration type
 */
export interface PageConfig {
  /** Common pages */
  common: Record<string, React.LazyExoticComponent<React.ComponentType>>;
  /** Time series anomaly module pages */
  timeseries: Record<string, React.LazyExoticComponent<React.ComponentType>>;
  /** Intelligent threshold module pages */
  threshold: Record<string, React.LazyExoticComponent<React.ComponentType>>;
  /** Oncall anomaly module pages */
  oncall: Record<string, React.LazyExoticComponent<React.ComponentType>>;
  /** Event center module pages */
  eventCenter: Record<string, React.LazyExoticComponent<React.ComponentType>>;
  /** System configuration module pages */
  system: Record<string, React.LazyExoticComponent<React.ComponentType>>;
}

/**
 * Route utility function types
 */
export interface RouteUtils {
  /** Get route configuration by path */
  getRouteByPath: (path: string) => RouteConfig | undefined;
  /** Get routes that require authentication */
  getAuthRequiredRoutes: () => RouteConfig[];
  /** Get public routes (no authentication required) */
  getPublicRoutes: () => RouteConfig[];
  /** Check if path requires authentication */
  requiresAuth: (path: string) => boolean;
}
