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

import { isEmpty, omit, pick, snakeCase } from 'lodash-es';
import type React from 'react';

import type {
  QueryFormat,
  QuerySearchParamsFormat,
} from '@/custom-table/types/legacy-interface';
import type { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { getParamsObject } from '@veaiops/utils';
// Simulate SortColumn type to avoid dependency on external modules
interface SortColumn {
  field: string;
  direction: 'asc' | 'desc';
}

export const ACTIVE_TAB_KEYS = ['activeTab'];

const CustomTableUtil = {
  syncQueryOnSearchParams: ({
    useActiveKeyHook,
    setSearchParams,
    query,
    queryFormat,
    resetRef,
    activeKeyChangeRef,
    querySearchParamsFormat,
  }: {
    useActiveKeyHook: boolean;
    setSearchParams: (
      params: Record<string, string> | (() => Record<string, string>),
    ) => void;
    query: Record<string, unknown>;
    queryFormat: QueryFormat;
    resetRef: React.MutableRefObject<boolean>;
    activeKeyChangeRef: React.MutableRefObject<
      Record<string, unknown> & { value?: unknown; reset?: () => void }
    >;
    querySearchParamsFormat?: QuerySearchParamsFormat;
  }) => {
    // Use URLSearchParams in browser environment
    const preUrlSearchParams = new URLSearchParams(window.location.search);
    const queryInSearchParams = getParamsObject({
      searchParams: preUrlSearchParams,
      queryFormat: queryFormat
        ? Object.fromEntries(
            Object.entries(queryFormat).map(([key, fn]) => [
              key,
              (params: { value: string }) =>
                fn({ value: params.value, pre: undefined }),
            ]),
          )
        : undefined,
    });
    const paramsToSet = (() => {
      if (resetRef.current) {
        resetRef.current = false;
        return pick(queryInSearchParams, ACTIVE_TAB_KEYS);
      }
      if (activeKeyChangeRef?.current?.value) {
        activeKeyChangeRef?.current?.reset?.();
      }
      const queryWithoutActiveTabs = omit(query, ACTIVE_TAB_KEYS);
      const mergeQuery = useActiveKeyHook
        ? {
            ...(activeKeyChangeRef?.current?.value
              ? {}
              : queryWithoutActiveTabs),
            ...pick(queryInSearchParams, ACTIVE_TAB_KEYS),
          }
        : { ...queryInSearchParams, ...queryWithoutActiveTabs };
      // Optimize query mapping
      const formatQuery = querySearchParamsFormat
        ? Object.entries(querySearchParamsFormat)?.reduce<
            Record<string, unknown>
          >(
            (pre, [queryKey, func]) => ({
              ...pre,
              [queryKey]:
                typeof func === 'function'
                  ? func({
                      value: mergeQuery[queryKey as keyof typeof mergeQuery],
                    })
                  : mergeQuery[queryKey as keyof typeof mergeQuery],
            }),
            {},
          )
        : {};
      const finalQuery = { ...mergeQuery, ...formatQuery };
      return getParamsObject({
        searchParams: new URLSearchParams(
          Object.entries(finalQuery).map(([k, v]) => {
            let stringValue: string;
            if (typeof v === 'string') {
              stringValue = v;
            } else if (v === null || v === undefined) {
              stringValue = '';
            } else if (typeof v === 'object') {
              stringValue = JSON.stringify(v);
            } else {
              stringValue = String(v);
            }
            return [k, stringValue];
          }),
        ),
      });
    })();
    setSearchParams(paramsToSet as Record<string, string>);
  },
  /**
   * Generate sort column parameters interface
   */
  generateSortColumn: ({
    sorter,
    sortFieldMap,
  }: {
    sorter: SorterInfo;
    sortFieldMap: { [key: string]: string };
  }) => ({
    column:
      sortFieldMap[sorter.field as string] || snakeCase(sorter.field as string),
    desc: sorter.direction === 'descend',
  }),
  /**
   * Generate sort request
   * @param sorters
   * @param sorter
   * @param sortFieldMap
   */
  generateSortRequest: ({
    sorters,
    sorter,
    sortFieldMap = {},
    supportSortColumns,
  }: {
    sorter: SorterInfo;
    sorters: SorterInfo[];
    sortFieldMap?: Record<string, string>;
    supportSortColumns?: boolean;
  }) => {
    if ((sorters && sorters.length > 0) || supportSortColumns) {
      if (supportSortColumns && !isEmpty(sorter)) {
        return {
          sortColumns: [
            CustomTableUtil.generateSortColumn({ sorter, sortFieldMap }),
          ],
        };
      }
      // Multi-column sorting
      const sortColumns: SortColumn[] = sorters.map((sorter) => ({
        field:
          'field' in sorter && typeof sorter.field === 'string'
            ? sorter.field
            : 'unknown',
        direction: sorter.direction === 'descend' ? 'desc' : 'asc',
      }));

      return { sortColumns };
    } else if (sorter && !isEmpty(sorter)) {
      // Single-column sorting
      return {
        sortColumn: CustomTableUtil.generateSortColumn({
          sorter,
          sortFieldMap,
        }),
      };
    } else {
      return {}; // If sorters is empty and sorter is also empty, return empty object
    }
  },
};

export { CustomTableUtil };
