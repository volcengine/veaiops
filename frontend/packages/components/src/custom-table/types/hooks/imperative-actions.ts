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
 * Imperative action Hook related type definitions
 * Re-export types from api/imperative-actions.ts to maintain backward compatibility
 */
import type {
  DataActionMethods,
  ExpandActionMethods,
  FilterActionMethods,
  PaginationActionMethods,
  ResetOptions,
  SelectionActionMethods,
  StateActionMethods,
  UtilityActionMethods,
} from '../api';
import type { BaseQuery, BaseRecord } from '../core';

// Re-export API types to maintain backward compatibility
export type {
  DataActionMethods,
  FilterActionMethods,
  PaginationActionMethods,
  SelectionActionMethods,
  ExpandActionMethods,
  UtilityActionMethods,
  StateActionMethods,
  ResetOptions,
} from '../api/imperative-actions';

/**
 * ResetOptions is already defined in api/imperative-actions.ts, removed here to avoid duplication
 * If needed, please import from '@/custom-table/types/api' or '@/custom-table/types'
 */

/**
 * Imperative action context
 */
export interface ImperativeActionContext<
  RecordType extends BaseRecord = BaseRecord,
> {
  /** Data operation methods */
  data: DataActionMethods<RecordType>;
  /** Filter operation methods */
  filter: FilterActionMethods<BaseQuery>;
  /** Pagination operation methods */
  pagination: PaginationActionMethods;
  /** Selection operation methods */
  selection: SelectionActionMethods<RecordType>;
  /** Expand operation methods */
  expand: ExpandActionMethods;
  /** Utility operation methods */
  utility: UtilityActionMethods<RecordType>;
  /** State operation methods */
  state: StateActionMethods;
  /** Reset operation */
  reset: (options?: ResetOptions) => void;
}

/**
 * useImperativeActions Hook Props
 */
export interface UseImperativeActionsProps<
  RecordType extends BaseRecord = BaseRecord,
> {
  /** Table reference */
  tableRef?: React.RefObject<ImperativeActionContext<RecordType>>;
  /** Data refresh function */
  onRefresh?: () => Promise<void>;
  /** Query change callback */
  onQueryChange?: (query: BaseQuery) => void;
  /** Selection change callback */
  onSelectionChange?: (
    selectedKeys: React.Key[],
    selectedRows: RecordType[],
  ) => void;
  /** Expand change callback */
  onExpandChange?: (expandedKeys: React.Key[]) => void;
}

/**
 * useImperativeActions Hook return value
 */
export interface UseImperativeActionsReturn<
  RecordType extends BaseRecord = BaseRecord,
> {
  /** Imperative action context */
  actions: ImperativeActionContext<RecordType>;
  /** Whether an action is pending */
  isActionPending: boolean;
  /** Last executed action */
  lastAction: string | null;
  /** Action history record */
  actionHistory: Array<{
    action: string;
    timestamp: number;
    params?: unknown;
  }>;
}
