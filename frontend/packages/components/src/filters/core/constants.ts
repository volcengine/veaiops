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

import type { FilterStyle, FixFilterControlCls } from './types';

/**
 * Fixed filter control class name configuration
 * Used to uniformly control responsive width of filter components
 */
export const fixFilterControlCls: FixFilterControlCls = {
  className: 'sm:w-p20 md:w-p21 lg:w-p22 x:w-p23 xl:w-p24 2xl:w-p24 3xl:w-p25',
};

/**
 * Default filter style configuration
 */
export const defaultFilterStyle: FilterStyle = {
  isWithBackgroundAndBorder: false,
  style: {},
};

/**
 * Common CSS class name
 * Used for layout and spacing
 */
export const commonClassName = 'flex flex-wrap items-center gap-[10px]';

/**
 * Filter container ID
 */
export const FILTER_CONTAINER_ID = 'tableFilters';

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  FIELD_TYPE_REQUIRED: 'Field type is not defined',
  PLUGIN_NOT_FOUND: 'Component plugin not found',
  INVALID_CONFIG: 'Component configuration is invalid',
  RENDER_FAILED: 'Component rendering failed',
} as const;

/**
 * Warning messages
 */
export const WARNING_MESSAGES = {
  FIELD_TYPE_REQUIRED: 'Field type is required for rendering',
  PLUGIN_NOT_FOUND: (type: string) =>
    `Plugin for type "${type}" not found, using fallback`,
  INVALID_CONFIG: (type: string) => `Invalid config for plugin "${type}"`,
} as const;

/**
 * Log messages
 */
export const LOG_MESSAGES = {
  RENDER_ERROR: (type: string, _error: unknown) =>
    `Error rendering plugin "${type}":`,
} as const;
