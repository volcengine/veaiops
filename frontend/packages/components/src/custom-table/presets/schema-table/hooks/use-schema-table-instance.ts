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
import { useMemo } from 'react';

import type { BaseRecord, SchemaTableInstance } from '@/custom-table/types';

interface UseSchemaTableInstanceOptions {
  dataSource: BaseRecord[];
  filters: Record<string, unknown>;
  selectedRows: BaseRecord[];
  selectedRowKeys: (string | number)[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  setDataSource: React.Dispatch<React.SetStateAction<BaseRecord[]>>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  setSelectedRowKeys: React.Dispatch<React.SetStateAction<(string | number)[]>>;
  setSelectedRows: React.Dispatch<React.SetStateAction<BaseRecord[]>>;
  setPagination: React.Dispatch<
    React.SetStateAction<{
      current: number;
      pageSize: number;
      total: number;
    }>
  >;
  loadData: (params?: Record<string, unknown>) => Promise<void>;
  handleReset: () => void;
}

/**
 * Schema Table Instance Methods Hook
 */
export const useSchemaTableInstance = ({
  dataSource,
  filters,
  selectedRows,
  selectedRowKeys,
  pagination,
  setDataSource,
  setFilters,
  setSelectedRowKeys,
  setSelectedRows,
  setPagination,
  loadData,
  handleReset,
}: UseSchemaTableInstanceOptions): SchemaTableInstance<BaseRecord> => {
  return useMemo<SchemaTableInstance<BaseRecord>>(
    () => ({
      reload: () => loadData(),
      getDataSource: () => dataSource,
      setDataSource,
      getFilters: () => filters,
      setFilters,
      resetFilters: handleReset,
      getSelectedRows: () => selectedRows,
      getSelectedRowKeys: () => selectedRowKeys,
      setSelectedRows: (keys: React.Key[]) => {
        const filteredKeys = keys.filter(
          (key): key is string | number =>
            typeof key === 'string' || typeof key === 'number',
        );
        setSelectedRowKeys(filteredKeys);
        const rows = dataSource.filter((_, index) => keys.includes(index));
        setSelectedRows(rows);
      },
      clearSelection: () => {
        setSelectedRowKeys([]);
        setSelectedRows([]);
      },
      getCurrentPage: () => pagination.current,
      getPageSize: () => pagination.pageSize,
      // Fix method signature: SchemaTableInstance.setPage expects (page, pageSize?) => void
      // But implementation uses object destructuring, changed to positional parameters to match interface definition
      setPage: (page: number, pageSize?: number) => {
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize: pageSize || prev.pageSize,
        }));
      },
      getSorter: () => null, // TODO: Implement sorter state retrieval
      setSorter: () => {
        // TODO: Implement sorter configuration
      },
      exportData: () => {
        // TODO: Implement data export
      },
      refresh: () => loadData(),
    }),
    [
      dataSource,
      filters,
      selectedRows,
      selectedRowKeys,
      pagination,
      setDataSource,
      setFilters,
      setSelectedRowKeys,
      setSelectedRows,
      setPagination,
      loadData,
      handleReset,
    ],
  );
};
