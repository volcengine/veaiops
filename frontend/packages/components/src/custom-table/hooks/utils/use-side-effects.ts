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

import type { BaseQuery } from '@/custom-table/types';
import { getParamsObject } from '@/custom-table/utils';
import { useDeepCompareEffect, useMount } from 'ahooks';
import { createTypedQuery } from './type-converters';

export const useSideEffects = <QueryType extends BaseQuery>({
  syncQueryOnSearchParams,
  queryFormat,
  tableState,
  initQuery,
  isPaginationInCache,
  finalQuery,
  filters,
  onQueryChange,
  dataSource,
  dataSourceHook,
  helpers,
}: {
  syncQueryOnSearchParams: boolean;
  queryFormat: Record<string, unknown>;
  tableState: any;
  initQuery: Partial<QueryType>;
  isPaginationInCache: boolean;
  finalQuery: QueryType;
  filters: Record<string, (string | number)[]>;
  onQueryChange?: (query: QueryType) => void;
  dataSource: any;
  dataSourceHook: any;
  helpers: any;
}) => {
  useDeepCompareEffect(() => {
    if (!syncQueryOnSearchParams) {
      const newSearchParams = getParamsObject({
        searchParams: tableState.searchParams,
        queryFormat,
      });
      tableState.setQuery(
        createTypedQuery<QueryType>({
          ...(tableState.query as Record<string, unknown>),
          ...newSearchParams,
        }),
      );
    }
  }, [syncQueryOnSearchParams ? null : tableState.searchParams]);

  useDeepCompareEffect(() => {
    tableState.setQuery(
      createTypedQuery<QueryType>({
        ...(tableState.query as Record<string, unknown>),
        ...initQuery,
      }),
    );
  }, [initQuery]);

  useDeepCompareEffect(() => {
    if (!isPaginationInCache) {
      tableState.setCurrent(1);
    }
    tableState.isQueryChangeRef.current = true;
    onQueryChange?.(finalQuery);
  }, [finalQuery, tableState.sorter, filters, isPaginationInCache]);

  useDeepCompareEffect(() => {
    // Trigger external loading callback (compatible with legacy onLoadingChange)
  }, [dataSourceHook.loading]);

  useMount(() => {
    if (dataSource && 'onProcess' in dataSource) {
      const { onProcess } = dataSource as {
        onProcess?: (handler: {
          run: () => void;
          stop: () => void;
          resetQuery: (params?: { resetEmptyData?: boolean }) => void;
        }) => void;
      };
      onProcess?.({
        run: () => {
          dataSourceHook.setResetEmptyData?.(false);
        },
        stop: () => {
          // Cancel logic is handled internally by dataSourceHook
        },
        resetQuery: helpers.reset,
      });
    }
  });
};
