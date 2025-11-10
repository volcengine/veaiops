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

import { PluginMethods, PluginNames } from '@/custom-table/constants';
import type { PluginContext, PluginManager } from '@/custom-table/types';
import { devLog } from '@/custom-table/utils';
import type { PaginationProps } from '@arco-design/web-react';
import type { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import type { Key } from 'react';
import { DEFAULT_TABLE_PROPS } from './table-renderer.constants';
import type { BaseQuery, BaseRecord } from './table-renderer.types';

/**
 * Merge table properties parameter interface
 */
export interface BuildOptimizedTablePropsParams<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  pluginManager: PluginManager;
  context: PluginContext<RecordType, QueryType>;
  isLoading: boolean;
  useCustomLoader: boolean;
}

/**
 * Merge table properties (default/user/plugin enhancements)
 */
export function buildOptimizedTableProps<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>({
  pluginManager,
  context,
  isLoading,
  useCustomLoader,
}: BuildOptimizedTablePropsParams<RecordType, QueryType>): Record<
  string,
  unknown
> {
  devLog.log({
    component: 'buildOptimizedTableProps',
    message: 'Starting to build table properties',
    data: {
      isLoading,
      useCustomLoader,
    },
  });

  const userDefinedTableProps = (
    context?.props as {
      tableProps?:
        | Record<string, unknown>
        | ((args: { loading: boolean }) => Record<string, unknown>);
    }
  )?.tableProps;

  let resolvedUserProps: Record<string, unknown>;
  if (typeof userDefinedTableProps === 'function') {
    const result = userDefinedTableProps({
      loading: isLoading && !useCustomLoader,
    });
    resolvedUserProps = result && typeof result === 'object' ? result : {};
  } else {
    resolvedUserProps =
      userDefinedTableProps && typeof userDefinedTableProps === 'object'
        ? userDefinedTableProps
        : {};
  }

  devLog.log({
    component: 'buildOptimizedTableProps',
    message: 'Resolving user table properties',
    data: {
      isFunction: typeof userDefinedTableProps === 'function',
      resolvedPropsKeys: Object.keys(resolvedUserProps),
    },
  });

  const columnWidthEnhancedProps =
    pluginManager.use({
      pluginName: PluginNames.COLUMN_WIDTH_PERSISTENCE,
      method: PluginMethods.APPLY_PERSISTENT_WIDTHS,
      args: [context, resolvedUserProps],
    }) || {};

  devLog.log({
    component: 'buildOptimizedTableProps',
    message: 'Applying column width enhancement',
    data: {
      hasColumnWidthEnhancement: Boolean(columnWidthEnhancedProps),
      columnWidthKeys: Object.keys(columnWidthEnhancedProps),
    },
  });

  const tableDefaultProps = DEFAULT_TABLE_PROPS;

  const result = {
    ...tableDefaultProps,
    ...resolvedUserProps,
    ...columnWidthEnhancedProps,
    scroll: {
      ...tableDefaultProps.scroll,
      ...(resolvedUserProps as { scroll?: Record<string, unknown> })?.scroll,
      ...(typeof columnWidthEnhancedProps === 'object' &&
      columnWidthEnhancedProps &&
      'scroll' in columnWidthEnhancedProps
        ? (columnWidthEnhancedProps as { scroll?: Record<string, unknown> })
            .scroll || {}
        : {}),
    },
  };

  devLog.log({
    component: 'buildOptimizedTableProps',
    message: 'Build completed',
    data: {
      resultKeys: Object.keys(result),
      scrollConfig: result.scroll,
    },
  });

  return result;
}

/**
 * Ensure each record has a stable key
 */
export function ensureRowKeys<RecordType extends BaseRecord = BaseRecord>(
  formattedData: RecordType[] | unknown,
  rowKey: string | ((record: RecordType) => Key),
): RecordType[] {
  devLog.log({
    component: 'ensureRowKeys',
    message: 'Starting to ensure row keys',
    data: {
      dataLength: Array.isArray(formattedData) ? formattedData.length : 0,
      rowKeyType: typeof rowKey,
    },
  });

  if (!Array.isArray(formattedData)) {
    devLog.warn({
      component: 'ensureRowKeys',
      message: 'Data is not an array, returning empty array',
      data: { formattedData },
    });
    return [] as RecordType[];
  }

  return (formattedData as RecordType[]).map((item, index) => {
    if (!item || typeof item !== 'object') {
      return { key: `table-row-empty-${index}` } as unknown as RecordType;
    }

    if (
      (item as { key?: string | number }).key !== undefined &&
      (item as { key?: string | number }).key !== null &&
      String((item as { key?: string | number }).key) !== ''
    ) {
      return item;
    }

    let keyValue: string;
    if (typeof rowKey === 'function') {
      try {
        keyValue = String(rowKey(item));
      } catch (error) {
        // rowKey function execution failed, use fallback (silent handling)
        keyValue = `table-row-fallback-${index}`;
      }
    } else if (
      typeof rowKey === 'string' &&
      (item as Record<string, unknown>)[rowKey] !== undefined &&
      (item as Record<string, unknown>)[rowKey] !== null
    ) {
      keyValue = String((item as Record<string, unknown>)[rowKey]);
    } else {
      const idFields = ['id', 'key', 'uuid', 'approvalId', 'entityId'] as const;
      const foundField = idFields.find(
        (field) =>
          (item as Record<string, unknown>)[field] !== undefined &&
          (item as Record<string, unknown>)[field] !== null &&
          String((item as Record<string, unknown>)[field]) !== '',
      );
      keyValue = foundField
        ? String((item as Record<string, unknown>)[foundField])
        : `table-row-${index}`;
    }

    if (!keyValue || keyValue === 'undefined' || keyValue === 'null') {
      keyValue = `table-row-${index}`;
    }

    // Ensure type-safe return of merged object as RecordType:
    // First treat object as Record<string, unknown> for merging, then assert as unknown, finally assert as RecordType
    // This avoids TypeScript error (TS2352) for unsafe conversion from { key: string } to RecordType
    const merged = {
      ...(item as Record<string, unknown>),
      key: keyValue,
    } as unknown as RecordType;
    return merged;
  });
}

/**
 * Generate unified onChange handler parameter interface
 */
export interface CreateOnChangeHandlerParams<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  pluginManager: PluginManager;
  context: PluginContext<RecordType, QueryType>;
}

/**
 * Generate unified onChange handler
 */
export function createOnChangeHandler<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>({
  pluginManager,
  context,
}: CreateOnChangeHandlerParams<RecordType, QueryType>) {
  devLog.log({
    component: 'createOnChangeHandler',
    message: 'Creating onChange handler',
    data: {
      hasPluginManager: Boolean(pluginManager),
      hasContext: Boolean(context),
    },
  });

  return (
    paginationInfo: PaginationProps,
    sorterInfo: SorterInfo | SorterInfo[],
    filtersInfo: Partial<Record<keyof RecordType, string[]>>,
    changeExtra: {
      currentData: RecordType[];
      currentAllData: RecordType[];
      action: 'paginate' | 'sort' | 'filter';
    },
  ) => {
    // Record all onChange events
    devLog.log({
      component: 'createOnChangeHandler',
      message: 'Table onChange triggered',
      data: {
        action: changeExtra.action,
        sorterInfo,
        sorterInfoType: typeof sorterInfo,
        sorterInfoIsArray: Array.isArray(sorterInfo),
        paginationInfo,
        filtersInfo,
        currentDataCount: changeExtra.currentData?.length,
      },
    });
    switch (changeExtra.action) {
      case 'sort': {
        const hasPlugin = Boolean(
          pluginManager.getPlugin(PluginNames.TABLE_SORTING),
        );
        const hasTableEvents = Boolean(
          pluginManager.getPlugin(PluginNames.TABLE_SORTING)?.tableEvents,
        );
        const hasOnSorterChange = Boolean(
          pluginManager.getPlugin(PluginNames.TABLE_SORTING)?.tableEvents?.[
            PluginMethods.ON_SORTER_CHANGE
          ],
        );
        devLog.log({
          component: 'createOnChangeHandler',
          message: 'Sort operation detected, calling TableSortingPlugin',
          data: {
            sorterInfo,
            hasPlugin,
            hasTableEvents,
            hasOnSorterChange,
          },
        });
        pluginManager
          .getPlugin(PluginNames.TABLE_SORTING)
          ?.tableEvents?.[PluginMethods.ON_SORTER_CHANGE]?.(
            context as unknown as PluginContext<BaseRecord, BaseQuery>,
            sorterInfo,
            changeExtra,
          );
        break;
      }
      case 'paginate': {
        const { current, pageSize } = paginationInfo || {};
        context.helpers.setCurrent?.(typeof current === 'number' ? current : 1);
        if (typeof pageSize === 'number') {
          context.helpers.setPageSize?.(pageSize);
        }
        pluginManager
          .getPlugin(PluginNames.TABLE_PAGINATION)
          ?.tableEvents?.onPageChange?.(
            context as unknown as PluginContext<BaseRecord, BaseQuery>,
            paginationInfo,
            changeExtra,
          );
        pluginManager
          .getPlugin(PluginNames.COLUMN_WIDTH_PERSISTENCE)
          ?.tableEvents?.onPageChange?.(
            context as unknown as PluginContext<BaseRecord, BaseQuery>,
            paginationInfo,
            changeExtra,
          );
        break;
      }
      case 'filter': {
        const normalized: Record<string, (string | number)[]> = {};
        if (filtersInfo) {
          Object.entries(filtersInfo as Record<string, unknown>).forEach(
            ([field, value]) => {
              if (Array.isArray(value)) {
                normalized[field] = value as (string | number)[];
              }
            },
          );
        }
        if (Object.keys(normalized).length > 0) {
          context.helpers.setFilters?.(normalized);
          context.helpers.setCurrent?.(1);
        }
        pluginManager
          .getPlugin(PluginNames.TABLE_FILTER)
          ?.tableEvents?.onFilterChange?.(
            context as unknown as PluginContext<BaseRecord, BaseQuery>,
            filtersInfo,
            changeExtra,
          );
        break;
      }
      default:
        break;
    }
  };
}

/**
 * Read column width persistence identifier (data-cwp-id)
 */
export function getColumnWidthPersistenceId<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(context: PluginContext<RecordType, QueryType>): string | undefined {
  const state = context.state as {
    columnWidthPersistence?: { tableId?: string };
  };
  return state?.columnWidthPersistence?.tableId || undefined;
}
