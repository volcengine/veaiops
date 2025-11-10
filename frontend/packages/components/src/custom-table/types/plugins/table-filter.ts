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
 * Table filter plugin type definition
 */

import type { ReactNode } from 'react';
// FilterValue type is already defined in core/common.ts, import here to avoid duplicate definition
import type { FilterValue } from '../core/common';
import type { PluginBaseConfig } from './core';

/**
 * Table filter configuration
 */
export interface TableFilterConfig extends PluginBaseConfig {
  enabled?: boolean;
  showFilterIcon?: boolean;
  filterMode?: 'dropdown' | 'inline' | 'modal';
  customFilters?: Record<string, FilterValue>;
  isFilterAffixed?: boolean;
  isFilterCollection?: boolean;
  showReset?: boolean;
  filterConfigs?: FilterItemConfig[];
  isFilterShow?: boolean;
  filterStyleCfg?: Record<string, string | number | boolean>;
}

/**
 * Filter item configuration
 */
export interface FilterItemConfig {
  key: string;
  label: string;
  type: 'input' | 'select' | 'date' | 'custom';
  content?: ReactNode;
  options?: Array<{ label: string; value: FilterValue }>;
  placeholder?: string;
  defaultValue?: FilterValue;
}

/**
 * Table filter state
 */
export interface TableFilterState {
  filters: Record<string, unknown>;
  activeFilters: string[];
  isFilterVisible: boolean;
}
