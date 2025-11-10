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
 * Table pagination plugin lifecycle methods
 */
import { createPaginationStateManager } from '@/custom-table/types/utils/state-managers';
import { createPaginationHelpers } from './helpers';
import type { ExtendedPaginationConfig } from './types';
import { getStateNumber } from './utils';

/**
 * Plugin installation
 */
export function install(_context: any) {
  // Operations during installation
}

/**
 * Plugin setup
 */
/**
 * Setup parameters interface
 */
export interface SetupParams {
  context: any;
  finalConfig: ExtendedPaginationConfig;
}

/**
 * Plugin setup
 */
export function setup({ context, finalConfig }: SetupParams): void {
  // Initialize pagination handling
  const currentPage = getStateNumber({
    value: context.state.current,
    defaultValue: 1,
  });
  const currentPageSize = getStateNumber({
    value: context.state.pageSize,
    defaultValue: finalConfig.defaultPageSize || 10,
  });

  // Plugin setup logic - don't call Hooks, only configure
  // Hook calls have been moved to component level
  // Pagination state is managed by outer component, here only set default values
  Object.assign(context.state, {
    current: currentPage || 1,
    pageSize: currentPageSize || finalConfig.defaultPageSize || 10,
    isChangingPage: false,
  });

  // Add pagination-related methods to context
  Object.assign(context.helpers, createPaginationHelpers(context));
}

/**
 * After plugin update
 */
export function afterUpdate(context: any) {
  // Operations when configuration or data updates
  // Update pagination-related methods
  Object.assign(context.helpers, createPaginationHelpers(context));
}

/**
 * Plugin uninstallation
 */
export function uninstall(context: any) {
  // Cleanup operations during uninstallation
  // Use type-safe state manager to clean up pagination state
  const paginationManager = createPaginationStateManager();
  // Type assertion to be compatible with different PluginContext generic parameters
  paginationManager.cleanupPaginationState(context);

  // Clean up additional pagination methods
  const { helpers } = context;
  const helpersRecord = helpers as unknown as Record<string, unknown>;

  [
    'goToFirst',
    'goToLast',
    'goToNext',
    'goToPrevious',
    'resetPagination',
  ].forEach((method) => {
    if (method in helpers) {
      delete helpersRecord[method];
    }
  });
}
