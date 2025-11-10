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

import type { ReactNode } from 'react';

// Since types package doesn't directly depend on arco-design, we use type-compatible approach
type SorterResult = any;

/**
 * Table component type definitions
 * @description Provides table-related type definitions
 */

// ===== Table-related types =====

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
  /** Sorter value */
  sorter?: SorterResult;
  /** Filter values */
  filters: Record<string, string | number | string[] | number[]>;
  /** Callback triggered by sorting or filtering */
  onChange: (
    type: string,
    value?: { [p: string]: (string | number)[] | string | number | null },
  ) => void;
  /** Query options */
  queryOptions?: IQueryOptions;
  /** Tooltip in table header */
  tip?: ReactNode;
  /**
   * Whether to support multiple selection
   * @default true
   */
  multiple?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Whether to show tooltip */
  showTip?: boolean;
  /** Frontend enum configuration */
  frontEnum?: unknown;
}
