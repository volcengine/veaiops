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
 * CustomTable React Context
 */

import type {
  ColumnProps,
  SorterInfo,
} from '@arco-design/web-react/es/Table/interface';
import type { BaseQuery, BaseRecord, PluginContext } from '@veaiops/types';
import { createContext } from 'react';

/**
 * CustomTable's React Context
 * Used to pass plugin context through component tree
 * Uses covariant PluginContext type, supports arbitrary generic parameter extensions
 */
// To solve generic covariance issues, use broader Context type
// Supports arbitrary extensions of Record and Query types
// 🐛 Fix React 18 Context.Consumer.Provider warning
// Use concrete default values instead of null to avoid Context type inference issues
const defaultContextValue: PluginContext<BaseRecord, BaseQuery> = {
  props: {
    finalQuery: {},
    baseColumns: [],
    configs: {},
  },
  state: {
    current: 1,
    pageSize: 10,
    query: {},
    sorter: {} as SorterInfo,
    filters: {},
    loading: false,
    formattedTableData: [],
    tableTotal: 0,
    tableColumns: [],
    selectedRowKeys: [],
  },
  helpers: {
    setCurrent: (_current: number) => {
      // Set current page number
    },
    setPageSize: (_pageSize: number) => {
      // Set page size
    },
    setQuery: (_query: BaseQuery) => {
      // Set query conditions
    },
    setFilters: (_filters: Record<string, (string | number)[]>) => {
      // Set filter conditions
    },
    setSorter: (_sorter: SorterInfo) => {
      // Set sort conditions
    },
    setLoading: (_loading: boolean) => {
      // Set loading state
    },
    setFormattedTableData: (_data: BaseRecord[]) => {
      // Set formatted table data
    },
    setTableTotal: (_total: number) => {
      // Set table total
    },
    setTableColumns: (_columns: ColumnProps<BaseRecord>[]) => {
      // Set table columns
    },
    setSelectedRowKeys: (_keys: (string | number)[]) => {
      // Set selected row keys
    },
  },
};

export const CustomTableContext =
  createContext<PluginContext>(defaultContextValue);
