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

import type { TableRenderConfig } from '@/custom-table/components/core/renderers/table-renderer.types';
import type { BaseRecord } from '@/custom-table/types/core';
import React from 'react';

export interface UseTableRenderConfigParams<RecordType extends BaseRecord> {
  tableClassName: string;
  rowKey: string | ((record: RecordType) => React.Key);
  baseColumns: any[];
  formattedData: any[];
  total: number;
  emptyStateElement: React.ReactNode;
  current: number;
  pageSize: number;
  pagination: any;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading: boolean;
  useCustomLoader: boolean;
}

export function useTableRenderConfig<RecordType extends BaseRecord>({
  tableClassName,
  rowKey,
  baseColumns,
  formattedData,
  total,
  emptyStateElement,
  current,
  pageSize,
  pagination,
  onPageChange,
  onPageSizeChange,
  loading,
  useCustomLoader,
}: UseTableRenderConfigParams<RecordType>): TableRenderConfig<RecordType> {
  return React.useMemo(
    () => ({
      style: {
        className: tableClassName,
        rowKey: rowKey as string | ((record: RecordType) => React.Key),
      },
      columns: {
        baseColumns: baseColumns || [],
      },
      data: {
        formattedData,
        total,
        emptyStateElement,
      },
      pagination: {
        current,
        pageSize,
        config: pagination,
        onPageChange,
        onPageSizeChange,
      },
      loading: {
        isLoading: loading,
        useCustomLoader,
      },
    }),
    [
      tableClassName,
      rowKey,
      baseColumns,
      formattedData,
      total,
      emptyStateElement,
      current,
      pageSize,
      pagination,
      onPageChange,
      onPageSizeChange,
      loading,
      useCustomLoader,
    ],
  );
}
