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

import type {
  CustomTableColumnProps,
  IQueryOptions,
} from '@/custom-table/types/components';
import type { SorterResult } from '@arco-design/web-react/es/Table/interface';
import { get, omit, pickBy } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';

/**
 * Sort columns by fields order
 */
function sortColumnsByFields<T = Record<string, unknown>>({
  columns,
  fields,
}: {
  columns: CustomTableColumnProps<T>[];
  fields?: string[];
}): CustomTableColumnProps<T>[] {
  if (!fields || fields.length === 0) {
    return columns;
  }

  return columns.sort((a, b) => {
    const aIndex = fields.indexOf(a.dataIndex ?? '');
    const bIndex = fields.indexOf(b.dataIndex ?? '');

    // If both are not in fields, keep original order
    if (aIndex === -1 && bIndex === -1) {
      return 0;
    }
    // If a is not in fields, put it at the end
    if (aIndex === -1) {
      return 1;
    }
    // If b is not in fields, put it at the front
    if (bIndex === -1) {
      return -1;
    }
    // Sort by order in fields
    return aIndex - bIndex;
  });
}

/**
 * Filter columns to display based on user-selected fields
 */
function filterTreeColumns<T = Record<string, unknown>>({
  baseColumns,
  fields,
}: {
  /** Custom base columns */
  baseColumns: CustomTableColumnProps<T>[];
  /** Fields to display */
  fields?: string[];
}): CustomTableColumnProps<T>[] {
  const filterColumns: CustomTableColumnProps<T>[] = [];

  baseColumns.forEach((baseColumn) => {
    const { children, dataIndex } = baseColumn;

    if (Array.isArray(children)) {
      const nextChildren = filterTreeColumns<T>({
        baseColumns: children,
        fields,
      });
      if (nextChildren.length) {
        filterColumns.push({
          ...baseColumn,
          children: nextChildren,
        });
      }
    } else if (!fields || (dataIndex && fields.includes(dataIndex))) {
      filterColumns.push({
        ...baseColumn,
      });
    }
  });

  return filterColumns;
}

/**
 * Transform columns, mainly for columns with CustomTitleComponent [custom header]
 */
function transferTreeColumns<T>(params: {
  /**
   * Special columns
   */
  columns: CustomTableColumnProps<T>[];
  /**
   * Sorter value
   */
  sorter: SorterResult | undefined;
  /**
   * Filter values obtained from table
   */
  filters: Record<string, unknown>;
  /**
   * Method to modify sorter and filter values within table
   * @param type Type
   * @param value Value
   * @returns void
   */
  handleChange: (params: {
    type: string;
    value?: Record<string, unknown>;
  }) => void;
  /**
   * Fuzzy search function within table header
   */
  queryOptions?: any;
}): CustomTableColumnProps<T>[] {
  const { columns, sorter, filters, handleChange, queryOptions } = params;

  return columns.map((column) => {
    const {
      dataIndex,
      filterDataIndex,
      title,
      children,
      CustomTitleComponent,
      customTitleProps,
    } = column;

    const lastColumn: CustomTableColumnProps<T> = {
      ...omit(column, ['children', 'customTitleProps', 'CustomTitleComponent']),
      title: column.title,
      dataIndex: column.dataIndex,
    };

    if (CustomTitleComponent) {
      const titleNode = (CustomTitleComponent as any)({
        dataIndex: dataIndex ?? '',
        filterDataIndex,
        title: title as string,
        sorter,
        filters: filters as Record<
          string,
          string | number | string[] | number[]
        >,
        onChange: handleChange,
        queryOptions,
        ...(customTitleProps as any),
      });
      lastColumn.title = titleNode;
    }

    if (Array.isArray(children) && children.length > 0) {
      const nextChildren = transferTreeColumns({
        columns: children,
        sorter,
        filters,
        handleChange,
        queryOptions,
      });
      lastColumn.children = nextChildren;
    }

    return lastColumn;
  });
}

/**
 *
 * @param originFilters Original table top filters
 * @param nextFilter Table filter to change
 * @returns Final table filter items
 */
const getNextFilters = (
  originFilters: Record<string, unknown>,
  nextFilter: Record<string, unknown>,
): Record<string, string[] | number[]> => {
  const key = Object.keys(nextFilter)[0];
  const nextValue = get(nextFilter, key);
  const originValue = get(originFilters, key);
  const nextFilters =
    nextValue !== originValue
      ? {
          ...originFilters,
          [key]: nextValue,
        }
      : originFilters;
  return pickBy(nextFilters, (v: unknown) => v !== null) as Record<
    string,
    string[] | number[]
  >;
};

/**
 * Complete table column business management Hook
 *
 * @description This is a complete business table column management implementation, including:
 * - Field filtering and sorting
 * - In-table filtering functionality
 * - Custom header component support
 * - Tree column structure handling
 * - Sorter and filter state management
 *
 *
 * @example
 * ```tsx
 * const { columns, sorter, filters, setFilters } = useTableColumns({
 *   baseColumns: myColumns,
 *   fields: ['name', 'age'],
 *   defaultSorter: { field: 'name', direction: 'ascend' }
 * });
 * ```
 */
export const useTableColumns = <T = Record<string, unknown>>({
  baseColumns,
  queryOptions,
  defaultSorter,
  fields,
  defaultFilters = {},
}: {
  /** Base columns */
  baseColumns: CustomTableColumnProps<T>[];
  /** Fields to display */
  fields?: string[];
  /** Default sorter */
  defaultSorter?: SorterResult;
  /** Default filters */
  defaultFilters?: Record<string, unknown>;
  /** Common function for field query */
  queryOptions?: any;
}) => {
  const [query, setQuery] = useState<Record<string, unknown>>({});
  const [sorter, setSorter] = useState<SorterResult | undefined>(defaultSorter);
  const [filters, setFilters] = useState<Record<string, string[] | number[]>>(
    defaultFilters as Record<string, string[] | number[]>,
  );

  /**
   * Parameter interface for methods that modify sorter and filters
   */
  interface HandleChangeParams {
    type: string;
    value?: unknown;
  }

  /** Method to modify sorter and filters */
  const handleChange = useCallback(({ type, value }: HandleChangeParams) => {
    switch (type) {
      case 'sorter':
        setSorter(value as SorterResult);
        break;
      case 'filters':
        setFilters((originFilters) =>
          getNextFilters(originFilters, value as Record<string, unknown>),
        );
        break;
      case 'query':
        setQuery((preQuery) => ({
          ...preQuery,
          ...(value as Record<string, unknown>),
        }));
        break;
      default:
        break;
    }
  }, []);

  /** Final columns */
  const columns = useMemo(() => {
    // 1. First filter fields based on fields
    const filterColumns: CustomTableColumnProps<T>[] = filterTreeColumns<T>({
      baseColumns,
      fields,
    });
    // 2. Convert custom columns to standard columns
    const standardColumns = transferTreeColumns<T>({
      columns: filterColumns,
      sorter,
      filters,
      handleChange,
      queryOptions,
    });
    // 3. Sort by fields order
    const sortColumns = sortColumnsByFields<T>({
      columns: standardColumns,
      fields,
    });

    return sortColumns;
  }, [baseColumns, fields, sorter, filters, handleChange, queryOptions]);

  return {
    /** Returned columns */
    columns,
    /** Query */
    query,
    /** Sorter */
    sorter,
    /** Filters */
    filters,
    /** Set filters */
    setFilters,
  };
};
