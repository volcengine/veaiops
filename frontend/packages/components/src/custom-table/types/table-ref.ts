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
 * Generic table reference interface
 * Provides out-of-the-box ref types, eliminating duplicate definitions on the business side
 */

import type { BaseQuery, BaseRecord } from '@veaiops/types';
import type { CustomTableHelpers } from './plugins/core';

/**
 * Base table ref interface
 * Contains the most commonly used table operation methods
 */
export interface BaseTableRef {
  /** Refresh table data */
  refresh: () => Promise<void>;
  /** Reload data */
  reload?: () => Promise<void>;
}

/**
 * Enhanced table ref interface
 * Contains complete table operation methods
 */
export interface EnhancedTableRef<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> extends BaseTableRef {
  /** Get table data */
  getData: () => RecordType[];
  /** Set table query parameters */
  setQuery: (query: QueryType | ((prev: QueryType) => QueryType)) => void;
  /** Get current query parameters */
  getQuery: () => QueryType;
  /** Get table helper methods */
  helpers?: CustomTableHelpers<RecordType, QueryType>;
}

/**
 * Automatic type inference function
 * Returns different ref types based on required functionality
 * Note: This is a type helper function, should use useRef<EnhancedTableRef>() in actual use
 */
export function createTableRef(): EnhancedTableRef<BaseRecord, BaseQuery> {
  // This is a type helper function, should use useRef<EnhancedTableRef>() in actual use
  throw new Error(
    'createTableRef is a type helper only. Use useRef<EnhancedTableRef>() instead.',
  );
}

/**
 * Full table ref interface
 * Contains all possible table operation methods
 */
export interface FullTableRef<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> extends BaseTableRef {
  // Data operations
  reload: () => Promise<void>;
  getData: () => RecordType[];
  setData: (data: RecordType[]) => void;

  // Query operations
  setQuery: (query: QueryType | ((prev: QueryType) => QueryType)) => void;
  getQuery: () => QueryType;

  // Refresh operations (new business semantic methods)
  afterCreate?: () => Promise<void>;
  afterUpdate?: () => Promise<void>;
  afterDelete?: () => Promise<void>;
  afterImport?: () => Promise<void>;
  afterBatchOperation?: () => Promise<void>;

  // Helper methods
  helpers?: CustomTableHelpers<RecordType, QueryType>;
}

/**
 * Most commonly used table ref type
 * Provides basic refresh functionality
 */
export type TableRef = BaseTableRef;
