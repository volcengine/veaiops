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
 * VE-ARCH Components type exports
 * @description Provides type definitions related to component library
 *
 */

import type { SorterResult } from '@arco-design/web-react/es/Table/interface';
import type { ReactNode } from 'react';

// ===== Basic type definitions =====

/** Common option type, supports extended data */
export type Option<T = Record<string, any>> = {
  /** Display label, supports React node */
  label: ReactNode;
  /** Option value */
  value: string | number;
  /** Whether disabled */
  disabled?: boolean;
  /** Extended data */
  extra?: T;
};

// ===== Table related types =====

export type IQueryOptions<T = unknown> = (
  params?: Record<string, unknown>,
) => Promise<T[]> | T[];

/** Custom table header filter properties */
export interface TableColumnTitleProps {
  /** Column title */
  title: string;
  /** Column key in data */
  dataIndex: string;
  /** Filter key */
  filterDataIndex?: string;
  /** Sort value */
  sorter?: SorterResult;
  /** Filter value */
  filters: Record<string, string | number | string[] | number[]>;
  /** Value triggered by sort or filter */
  onChange: (
    type: string,
    value?: { [p: string]: (string | number)[] | string | number | null },
  ) => void;
  /** Query */
  queryOptions?: IQueryOptions;
  /** Whether table header has tooltip */
  tip?: ReactNode;
  /**
   * Whether to support multiple selection
   * @default true
   */
  multiple?: boolean;
}

// ===== Public component types =====

// Note: Public namespace is unused, removed
// /** Public namespace, used for compatibility with original import method */
// export const Public = {
//   // Other public components and utilities can be added here
// } as const;

// Named exports
