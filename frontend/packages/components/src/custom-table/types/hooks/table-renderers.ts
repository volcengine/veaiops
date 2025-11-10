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
 * Table renderer Hook related type definitions
 */
import type { PaginationProps } from '@arco-design/web-react/es/Pagination/pagination';
import type { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import type React from 'react';
import type { BaseQuery, BaseRecord } from '../core';

/**
 * Table renderer configuration
 */
export interface TableRenderers {
  /** @name Empty data element renderer */
  noDataElement?: React.ComponentType<{
    error?: Error;
    loading?: boolean;
    dataSource?: Record<string, unknown>[];
  }>;

  /** @name Loading element renderer */
  loadingElement?: React.ComponentType<{
    loading?: boolean;
    tip?: string;
  }>;

  /** @name Error element renderer */
  errorElement?: React.ComponentType<{
    error?: Error;
    retry?: () => void;
  }>;

  /** @name Toolbar renderer */
  toolbarRenderer?: React.ComponentType<{
    selectedRowKeys?: (string | number)[];
    actions?: Record<string, (...args: unknown[]) => void>;
  }>;

  /** @name Table title renderer */
  titleRenderer?: React.ComponentType<{
    title?: React.ReactNode;
    actions?: React.ReactNode[];
  }>;

  /** @name Table footer renderer */
  footerRenderer?: React.ComponentType<{
    dataSource?: Record<string, unknown>[];
    pagination?: PaginationProps | boolean;
  }>;

  /** @name Table alert renderer */
  alertRenderer?: React.ComponentType<{
    message?: React.ReactNode;
    type?: 'info' | 'success' | 'warning' | 'error';
    showIcon?: boolean;
    closable?: boolean;
    onClose?: () => void;
  }>;
}

/**
 * Renderer context
 */
export interface RenderContext<RecordType extends BaseRecord = BaseRecord> {
  /** Table data */
  dataSource: RecordType[];
  /** Loading state */
  loading: boolean;
  /** Error information */
  error: Error | null;
  /** Selected row keys */
  selectedRowKeys: (string | number)[];
  /** Expanded row keys */
  expandedRowKeys: (string | number)[];
  /** Pagination information */
  pagination: PaginationProps | boolean;
  /** Filters */
  filters: Record<string, (string | number)[]>;
  /** Sorter */
  sorter: SorterInfo;
  /** Query parameters */
  query: BaseQuery;
  /** Table actions */
  actions: Record<string, (...args: unknown[]) => void>;
}

/**
 * Custom renderer
 */
export interface CustomRenderer<T = Record<string, unknown>> {
  /** Render function */
  render: (context: RenderContext & T) => React.ReactNode;
  /** Render condition */
  condition?: (context: RenderContext & T) => boolean;
  /** Priority */
  priority?: number;
  /** Whether to cache */
  cache?: boolean;
}
