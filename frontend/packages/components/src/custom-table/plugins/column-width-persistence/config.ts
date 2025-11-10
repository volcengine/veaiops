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
 * Column width persistence plugin default configuration
 */

import { PluginPriorityEnum } from '@/custom-table/types/core/enums';
import type { ColumnWidthPersistenceConfig } from './types';

/**
 * Column width persistence plugin default configuration
 * Optimized configuration based on actual business scenarios, suitable for most table usage
 */
export const DEFAULT_COLUMN_WIDTH_PERSISTENCE_CONFIG: Required<ColumnWidthPersistenceConfig> =
  {
    /** Base plugin configuration */
    priority: PluginPriorityEnum.MEDIUM,
    enabled: true,
    autoInstall: true,
    dependencies: [],
    conflicts: [],

    /** Column width persistence specific configuration - optimized based on work-flow actual usage */
    enableAutoDetection: true, // Auto-detect column width changes
    detectionDelay: 300, // 300ms debounce delay, balance responsiveness and performance
    storageKeyPrefix: 'custom-table-column-width',
    enableLocalStorage: true, // Enable local storage persistence
    minColumnWidth: 60, // Minimum column width 60px, ensure content readability
    maxColumnWidth: 600, // Maximum column width 600px, suitable for most business scenarios
  };

/**
 * Plugin constants
 */
export const PLUGIN_CONSTANTS = {
  /** Plugin name */
  PLUGIN_NAME: 'column-width-persistence' as const,

  /** Plugin version */
  VERSION: '1.0.0' as const,

  /** Plugin description */
  DESCRIPTION:
    'Table column width persistence plugin, supports keeping column width fixed when paginating' as const,

  /** Storage key separator */
  STORAGE_KEY_SEPARATOR: ':' as const,

  /** Column width detection selector */
  COLUMN_SELECTOR: 'th[data-index]' as const,

  /** Table container selector */
  TABLE_CONTAINER_SELECTOR: '.arco-table' as const,
} as const;
