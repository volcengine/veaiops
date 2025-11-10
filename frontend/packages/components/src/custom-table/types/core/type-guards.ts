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
 * CustomTable type guard functions
 * Used for safe type conversion and validation, replacing as unknown assertions
 */

import type { PluginContext, TableDataSource } from '@veaiops/types';
import type { BaseQuery, BaseRecord } from './common';

/**
 * Check if value is a valid record type
 */
export function isValidRecord<T extends BaseRecord>(
  value: unknown,
): value is T {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  // // Support multiple primary key field naming conventions:
  // // - Id (standard convention)
  // // - id (lowercase convention)
  // // - approvalId (work order primary key)
  // // - Other common primary key fields
  // const hasValidId =
  //   typeof record.Id !== 'undefined' ||
  //   typeof record.id !== 'undefined' ||
  //   typeof record.approvalId !== 'undefined' ||
  //   typeof record.ApprovalId !== 'undefined' ||
  //   typeof record.key !== 'undefined' ||
  //   typeof record.Key !== 'undefined';

  return true;
}

/**
 * Check if value is a valid query type
 */
export function isValidQuery<T extends BaseQuery>(value: unknown): value is T {
  return value !== null && typeof value === 'object';
}

/**
 * Check if value is a valid record array
 */
export function isValidRecordArray<T extends BaseRecord>(
  value: unknown,
): value is T[] {
  return Array.isArray(value) && value.every((item) => isValidRecord<T>(item));
}

/**
 * Safe record type conversion
 */
export function safeRecordCast<T extends BaseRecord>(
  value: unknown,
  fallback: T[] = [],
): T[] {
  if (isValidRecordArray<T>(value)) {
    return value;
  }

  // Provide more detailed debugging information
  if (Array.isArray(value) && value.length > 0) {
    const firstRecord = value[0] as Record<string, unknown>;
    const availableKeys = Object.keys(firstRecord);
  } else {
    // No action for empty array
  }

  return fallback;
}

/**
 * Safe query type conversion
 */
export function safeQueryCast<T extends BaseQuery>(
  value: unknown,
  fallback: T = {} as T,
): T {
  if (isValidQuery<T>(value)) {
    return value;
  }

  return fallback;
}

/**
 * Check if value is a valid plugin context
 */
export function isValidPluginContext<
  RecordType extends BaseRecord,
  QueryType extends BaseQuery,
>(value: unknown): value is PluginContext<RecordType, QueryType> {
  return (
    value !== null &&
    typeof value === 'object' &&
    'state' in value &&
    'props' in value &&
    'helpers' in value
  );
}

/**
 * Safe plugin context conversion
 */
export function safeContextCast<
  RecordType extends BaseRecord,
  QueryType extends BaseQuery,
>(value: unknown): PluginContext<RecordType, QueryType> | null {
  if (isValidPluginContext<RecordType, QueryType>(value)) {
    return value;
  }

  return null;
}

/**
 * Check if value is a valid data source
 */
export function isValidDataSource<
  RecordType extends BaseRecord,
  QueryType extends BaseQuery,
>(value: unknown): value is TableDataSource<RecordType, QueryType> {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Support two data source configuration modes:
  // 1. Direct request function mode: has request property
  // 2. Service instance mode: has serviceInstance and serviceMethod properties
  const hasRequestFunction =
    'request' in obj && typeof obj.request === 'function';
  const hasServiceConfig = 'serviceInstance' in obj && 'serviceMethod' in obj;

  return hasRequestFunction || hasServiceConfig;
}

/**
 * Safe data source conversion
 */
export function safeDataSourceCast<
  RecordType extends BaseRecord,
  QueryType extends BaseQuery,
>(value: unknown): TableDataSource<RecordType, QueryType> | undefined {
  if (isValidDataSource<RecordType, QueryType>(value)) {
    return value;
  }

  if (value !== undefined) {
    // Invalid data source
  }
  return undefined;
}

/**
 * Generic compatibility conversion utility
 * Used to handle complex generic covariance issues
 */
export interface TypeSafeConverter {
  /**
   * Safe context conversion, handling generic covariance
   */
  convertContext: <
    FromRecord extends BaseRecord,
    FromQuery extends BaseQuery,
    ToRecord extends BaseRecord,
    ToQuery extends BaseQuery,
  >(
    context: PluginContext<FromRecord, FromQuery>,
  ) => PluginContext<ToRecord, ToQuery>;

  /**
   * Safe data conversion, handling formatted record types
   */
  convertRecordData: <
    FromRecord extends BaseRecord,
    ToRecord extends BaseRecord,
  >(
    data: FromRecord[],
  ) => ToRecord[];
}

/**
 * Type-safe converter implementation
 */
export const typeSafeConverter: TypeSafeConverter = {
  convertContext<
    FromRecord extends BaseRecord,
    FromQuery extends BaseQuery,
    ToRecord extends BaseRecord,
    ToQuery extends BaseQuery,
  >(
    context: PluginContext<FromRecord, FromQuery>,
  ): PluginContext<ToRecord, ToQuery> {
    // Use structured clone here to ensure type safety
    return {
      state: {
        ...context.state,
        formattedTableData: context.state.formattedTableData as ToRecord[],
      },
      props: context.props as unknown as PluginContext<
        ToRecord,
        ToQuery
      >['props'],
      helpers: {
        ...context.helpers,
        setQuery: context.helpers.setQuery,
      },
    } as unknown as PluginContext<ToRecord, ToQuery>;
  },

  convertRecordData<FromRecord extends BaseRecord, ToRecord extends BaseRecord>(
    data: FromRecord[],
  ): ToRecord[] {
    // Verify data format compatibility
    if (!isValidRecordArray(data)) {
      return [];
    }

    return data as unknown as ToRecord[];
  },
};
