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
 * Data source plugin type definition
 */

import type { BaseQuery, BaseRecord } from '@veaiops/types';
import type { PluginBaseConfig } from './core';

/**
 * Data source configuration
 */
export interface DataSourceConfig extends PluginBaseConfig {
  /** API endpoint */
  apiUrl?: string;
  /** Request method */
  method?: 'GET' | 'POST';
  /** Request headers */
  headers?: Record<string, string>;
  /** Request parameter transformation */
  transformRequest?: <TRequest = Record<string, unknown>>(
    query: BaseQuery,
  ) => TRequest;
  /** Response data transformation */
  transformResponse?: <TResponse = unknown>(
    response: TResponse,
  ) => { data: BaseRecord[]; total: number };
  /** Cache configuration */
  cache?: {
    enabled: boolean;
    ttl: number; // milliseconds
    key?: string;
  };
  /** Default page size */
  defaultPageSize?: number;
  /** Default current page */
  defaultCurrent?: number;
  /** Whether to auto reset */
  autoReset?: boolean;
  /** Whether to enable client-side sorting */
  enableClientSorting?: boolean;
  /** Whether to enable client-side filtering */
  enableClientFiltering?: boolean;
}

/**
 * Data source state
 */
export interface DataSourceState {
  /** Raw data */
  rawData: BaseRecord[];
  /** Filtered data */
  filteredData: BaseRecord[];
  /** Loading state */
  loading: boolean;
  /** Error information */
  error: Error | null;
  /** Total count */
  total: number;
  /** Last update time */
  lastUpdated: number;
}

/**
 * Data source methods
 */
export interface DataSourceMethods {
  /** Load data */
  loadData: (query?: BaseQuery) => Promise<void>;
  /** Refresh data */
  refreshData: () => Promise<void>;
  /** Clear data */
  clearData: () => void;
  /** Set data */
  setData: (data: BaseRecord[]) => void;
  /** Update single record */
  updateRecord: (record: BaseRecord) => void;
  /** Delete single record */
  deleteRecord: (id: string | number) => void;
}
