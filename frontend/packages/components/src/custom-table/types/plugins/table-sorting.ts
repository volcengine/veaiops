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
 * Table sorting plugin type definition
 */

import type { PluginBaseConfig } from './core';
// Create local SorterInfo type definition
interface SorterInfo {
  field?: string;
  direction?: 'ascend' | 'descend';
  [key: string]: unknown;
}

/**
 * Table sorting configuration
 */
export interface TableSortingConfig extends PluginBaseConfig {
  enabled?: boolean;
  multiple?: boolean;
  defaultSorter?: SorterInfo[];
  sortMode?: 'single' | 'multiple';
  sortFieldMap?: Record<string, string>;
}

/**
 * Table sorting state
 */
export interface TableSortingState {
  sortedColumns: Array<{
    field: string;
    direction: 'ascend' | 'descend';
  }>;
  sortMode: 'single' | 'multiple';
}

/**
 * Table sorting methods
 */
export interface TableSortingMethods {
  setSorter: (field: string, direction: 'ascend' | 'descend' | null) => void;
  clearSorter: (field?: string) => void;
  resetSorter: () => void;
  getSorter: () => Array<{ field: string; direction: 'ascend' | 'descend' }>;
}
