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

import type { BaseQuery, BaseRecord } from '@/custom-table/types';
import type { PaginationProps } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';

/**
 * Table render configuration parameter types
 */
export interface TableRenderConfig<RecordType extends BaseRecord = BaseRecord> {
  /** Table style configuration */
  style: {
    className: string;
    rowKey: string | ((record: RecordType) => React.Key);
  };

  /** Column configuration */
  columns: {
    baseColumns: ColumnProps<RecordType>[];
  };

  /** Data configuration */
  data: {
    formattedData: RecordType[];
    total: number;
    emptyStateElement: React.ReactNode;
  };

  /** Pagination configuration */
  pagination: {
    current: number;
    pageSize: number;
    config: PaginationProps | boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };

  /** Loading state configuration */
  loading: {
    isLoading: boolean;
    useCustomLoader: boolean;
  };
}

export type { BaseRecord, BaseQuery };
