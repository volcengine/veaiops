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
 * State manager type safety utilities
 * Replaces as unknown and unsafe property deletion operations
 */

import type { BaseQuery, BaseRecord, PluginContext } from '@veaiops/types';

/**
 * State field deletion operation type
 */
export type StateFieldKey = string;

/**
 * Safe state cleaner
 */
export interface SafeStateCleaner<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  /** Remove state fields */
  removeStateFields: (
    context: PluginContext<RecordType, QueryType>,
    fields: StateFieldKey[],
  ) => void;

  /** Remove helper methods */
  removeHelperMethods: (
    context: PluginContext<RecordType, QueryType>,
    methods: string[],
  ) => void;

  /** Reset specific state fields */
  resetStateFields: <T extends Record<string, unknown>>(
    target: T,
    resetFields: Partial<T>,
  ) => T;

  /** Safely check if field exists */
  hasStateField: (
    context: PluginContext<RecordType, QueryType>,
    field: StateFieldKey,
  ) => boolean;

  /** Safely get state field value */
  getStateField: <T = unknown>(
    context: PluginContext<RecordType, QueryType>,
    field: StateFieldKey,
  ) => T | undefined;
}

/**
 * Create type-safe state cleaner
 */
export function createSafeStateCleaner<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(): SafeStateCleaner<RecordType, QueryType> {
  return {
    removeStateFields(
      context: PluginContext<RecordType, QueryType>,
      fields: StateFieldKey[],
    ): void {
      fields.forEach((field) => {
        if (field in context.state) {
          // Use Reflect.deleteProperty for safe deletion
          Reflect.deleteProperty(context.state, field);
        }
      });
    },

    removeHelperMethods(
      context: PluginContext<RecordType, QueryType>,
      methods: string[],
    ): void {
      methods.forEach((method) => {
        if (method in context.helpers) {
          // Use Reflect.deleteProperty for safe deletion
          Reflect.deleteProperty(context.helpers, method);
        }
      });
    },

    resetStateFields<T extends Record<string, unknown>>(
      target: T,
      resetFields: Partial<T>,
    ): T {
      return {
        ...target,
        ...resetFields,
      };
    },

    hasStateField(
      context: PluginContext<RecordType, QueryType>,
      field: StateFieldKey,
    ): boolean {
      return field in context.state;
    },

    getStateField<T = unknown>(
      context: PluginContext<RecordType, QueryType>,
      field: StateFieldKey,
    ): T | undefined {
      if (this.hasStateField(context, field)) {
        return (context.state as unknown as Record<string, unknown>)[
          field
        ] as T;
      }
      return undefined;
    },
  };
}

/**
 * Pagination state manager
 */
export interface PaginationStateManager<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  /** Cleanup pagination state */
  cleanupPaginationState: (
    context: PluginContext<RecordType, QueryType>,
  ) => void;

  /** Reset pagination state */
  resetPaginationState: (context: PluginContext<RecordType, QueryType>) => void;

  /** Set pagination parameters */
  setPaginationParams: (
    context: PluginContext<RecordType, QueryType>,
    params: { current?: number; pageSize?: number },
  ) => void;

  /** Get pagination parameters */
  getPaginationParams: (context: PluginContext<RecordType, QueryType>) => {
    current?: number;
    pageSize?: number;
  };
}

/**
 * Create pagination state manager
 */
export function createPaginationStateManager<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(): PaginationStateManager<RecordType, QueryType> {
  const stateCleaner = createSafeStateCleaner<RecordType, QueryType>();

  return {
    cleanupPaginationState(
      context: PluginContext<RecordType, QueryType>,
    ): void {
      // Cleanup pagination-related state fields
      stateCleaner.removeStateFields(context, [
        'current',
        'pageSize',
        'isChangingPage',
      ]);

      // Cleanup pagination-related methods
      stateCleaner.removeHelperMethods(context, ['setCurrent', 'setPageSize']);
    },

    resetPaginationState(context: PluginContext<RecordType, QueryType>): void {
      const resetState = stateCleaner.resetStateFields(
        context.state as unknown as Record<string, unknown>,
        {
          current: 1,
          pageSize: 20,
          isChangingPage: false,
        },
      );

      // Update state
      Object.assign(context.state, resetState);
    },

    setPaginationParams(
      context: PluginContext<RecordType, QueryType>,
      params: { current?: number; pageSize?: number },
    ): void {
      if (params.current !== undefined) {
        (context.state as unknown as Record<string, unknown>).current =
          params.current;
      }
      if (params.pageSize !== undefined) {
        (context.state as unknown as Record<string, unknown>).pageSize =
          params.pageSize;
      }
    },

    getPaginationParams(context: PluginContext<RecordType, QueryType>): {
      current?: number;
      pageSize?: number;
    } {
      return {
        current: stateCleaner.getStateField<number>(context, 'current'),
        pageSize: stateCleaner.getStateField<number>(context, 'pageSize'),
      };
    },
  };
}

/**
 * Sorter state manager
 */
export interface SorterStateManager<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  /** Cleanup sorter state */
  cleanupSorterState: (context: PluginContext<RecordType, QueryType>) => void;

  /** Reset sorter state */
  resetSorterState: (context: PluginContext<RecordType, QueryType>) => void;

  /** Set sorter parameters */
  setSorterParam: (
    context: PluginContext<RecordType, QueryType>,
    sorter: Record<string, string | number>,
  ) => void;

  /** Get sorter parameters */
  getSorterParam: (
    context: PluginContext<RecordType, QueryType>,
  ) => Record<string, string | number>;
}

/**
 * Create sorter state manager
 */
export function createSorterStateManager<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(): SorterStateManager<RecordType, QueryType> {
  const stateCleaner = createSafeStateCleaner<RecordType, QueryType>();

  return {
    cleanupSorterState(context: PluginContext<RecordType, QueryType>): void {
      stateCleaner.removeStateFields(context, ['sorter']);
      stateCleaner.removeHelperMethods(context, ['setSorter', 'resetSorter']);
    },

    resetSorterState(context: PluginContext<RecordType, QueryType>): void {
      const resetState = stateCleaner.resetStateFields(
        context.state as unknown as Record<string, unknown>,
        {
          sorter: {},
        },
      );

      Object.assign(context.state, resetState);
    },

    setSorterParam(
      context: PluginContext<RecordType, QueryType>,
      sorter: Record<string, string | number>,
    ): void {
      (context.state as unknown as Record<string, unknown>).sorter = sorter;
    },

    getSorterParam(
      context: PluginContext<RecordType, QueryType>,
    ): Record<string, string | number> {
      return (
        stateCleaner.getStateField<Record<string, string | number>>(
          context,
          'sorter',
        ) || {}
      );
    },
  };
}

/**
 * Filter state manager
 */
export interface FilterStateManager<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  /** Cleanup filter state */
  cleanupFilterState: (context: PluginContext<RecordType, QueryType>) => void;

  /** Reset filter state */
  resetFilterState: (context: PluginContext<RecordType, QueryType>) => void;

  /** Set filter parameters */
  setFilterParams: (
    context: PluginContext<RecordType, QueryType>,
    filters: Record<
      string,
      string | number | boolean | (string | number | boolean)[]
    >,
  ) => void;

  /** Get filter parameters */
  getFilterParams: (
    context: PluginContext<RecordType, QueryType>,
  ) => Record<
    string,
    string | number | boolean | (string | number | boolean)[]
  >;
}

/**
 * Create filter state manager
 */
export function createFilterStateManager<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(): FilterStateManager<RecordType, QueryType> {
  const stateCleaner = createSafeStateCleaner<RecordType, QueryType>();

  return {
    cleanupFilterState(context: PluginContext<RecordType, QueryType>): void {
      stateCleaner.removeStateFields(context, [
        'filters',
        'visibleFilters',
        'isFilterExpanded',
      ]);
      stateCleaner.removeHelperMethods(context, ['setFilters', 'resetFilters']);
    },

    resetFilterState(context: PluginContext<RecordType, QueryType>): void {
      const resetState = stateCleaner.resetStateFields(
        context.state as unknown as Record<string, unknown>,
        {
          filters: {},
          visibleFilters: [],
          isFilterExpanded: false,
        },
      );

      Object.assign(context.state, resetState);
    },

    setFilterParams(
      context: PluginContext<RecordType, QueryType>,
      filters: Record<
        string,
        string | number | boolean | (string | number | boolean)[]
      >,
    ): void {
      (context.state as unknown as Record<string, unknown>).filters = filters;
    },

    getFilterParams(
      context: PluginContext<RecordType, QueryType>,
    ): Record<
      string,
      string | number | boolean | (string | number | boolean)[]
    > {
      return (
        stateCleaner.getStateField<
          Record<
            string,
            string | number | boolean | (string | number | boolean)[]
          >
        >(context, 'filters') || {}
      );
    },
  };
}
