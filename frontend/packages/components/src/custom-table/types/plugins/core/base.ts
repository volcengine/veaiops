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
 * Plugin system base type definition
 */

import type { BaseQuery, BaseRecord } from '@veaiops/types';
// Key type already defined in core/common.ts, import here for internal use
import type { Key } from '../../core/common';
import type {
  LifecyclePhaseEnum,
  PluginPriority,
  PluginPriorityEnum,
  PluginStatusEnum,
} from '../../core/enums';

/**
 * Arco Table scroll configuration type
 */
export interface ArcoScrollConfig {
  x?: number | string | boolean;
  y?: number | string | boolean;
}

// Note: Enums and Key types are already exported in core, do not re-export here to avoid conflicts with core
// When using these types within plugin system, import from core or top-level types
// To use within plugin system, you can:
// 1. Import from core: import { PluginPriorityEnum } from '../../core/enums'
// 2. Import from top-level: import { PluginPriorityEnum } from '@/custom-table/types'

/**
 * Plugin lifecycle phase (based on enum, extended version)
 */
export type PluginLifecycle =
  | LifecyclePhaseEnum
  | 'install'
  | 'setup'
  | 'uninstall'
  | 'activate'
  | 'deactivate'
  | 'onMount'
  | 'onDestroy';

/**
 * Plugin status (based on enum)
 */
export type PluginStatus = PluginStatusEnum;
