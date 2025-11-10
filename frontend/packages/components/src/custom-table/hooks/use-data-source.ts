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

import { useRequest } from 'ahooks';
import { isEmpty, snakeCase } from 'lodash-es';
/**
 * Data source plugin core Hook
 * Migrated from plugins/data-source/hooks/use-data-source.ts
 */
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  buildRequestResult,
  devLog,
  extractResponseData,
  filterEmptyDataByKeys,
  formatTableData,
  handleRequestError,
} from '@/custom-table';
// ✅ Optimization: Use shortest path, merge imports from same source
import { DEFAULT_DATA_SOURCE_CONFIG } from '@/custom-table/plugins/data-source/config';
import type { DataSourceConfig, TableDataSource } from '@/custom-table/types';
import { logger } from '@veaiops/utils';

/**
 * useDataSource Hook
 *
 * Why props uses any:
 * - props comes from CustomTable component, contains dynamic properties like dataSource, query, sorter, filters, etc.
 * - Different tables have different query parameter types (QueryType) and record types (RecordType)
 * - Using generics would make type inference at call sites too complex
 * - props is destructured to get specific fields in actual use, type safety is ensured by usage of specific fields
 */
export interface UseDataSourceParams {
  props: Record<string, unknown>;
  config?: DataSourceConfig;
}

export const useDataSource = ({ props, config = {} }: UseDataSourceParams) => {
  const {
    dataSource: rawDataSource = {},
    query: rawQuery = {},
    sorter: rawSorter = {},
    filters: rawFilters = {},
    current: rawCurrent = 1,
    pageSize: rawPageSize = 10,
    isFilterEffective = true,
  } = props;

  // Debug: Record rawDataSource state
  logger.debug({
    message: '[useDataSource] Props destructuring completed',
    data: {
      hasRawDataSource: Boolean(rawDataSource),
      rawDataSourceType: typeof rawDataSource,
      rawDataSourceKeys: rawDataSource ? Object.keys(rawDataSource) : [],
      hasRequest: Boolean((rawDataSource as any)?.request),
      requestType: typeof (rawDataSource as any)?.request,
    },
    source: 'CustomTable',
    component: 'useDataSource',
  });

  // Type assertion: field types in props are uncertain, need to assert to specific types
  const dataSource = rawDataSource as TableDataSource;
  const query = rawQuery as Record<string, unknown>;
  const sorter = rawSorter as {
    field?: string;
    direction?: 'ascend' | 'descend';
  };
  const filters = rawFilters as Record<string, unknown>;
  const current = rawCurrent as number;
  const pageSize = rawPageSize as number;

  const { enableClientFiltering = false } = {
    ...DEFAULT_DATA_SOURCE_CONFIG,
    ...config,
  };

  // State
  const [resetEmptyData, setResetEmptyData] = useState(false);
  // Manually controlled state
  const [manualLoading, setManualLoading] = useState<boolean | null>(null);
  const [manualError, setManualError] = useState<Error | null>(null);

  // Build refresh dependencies - exclude dataSource.request function reference to avoid infinite loop
  const refreshDeps = useMemo(() => {
    // Create a dataSource copy without function references
    const stableDataSource = dataSource
      ? {
          ...dataSource,
          request: undefined, // Exclude request function reference
        }
      : dataSource;

    let deps: Array<unknown> = [filters, sorter, stableDataSource];
    if (isFilterEffective) {
      deps = [query, ...deps];
    }
    if (dataSource?.isServerPagination) {
      deps = [...deps, current, pageSize];
    }
    return deps;
  }, [
    filters,
    sorter,
    dataSource,
    dataSource?.isServerPagination,
    dataSource?.ready,
    dataSource?.manual,
    dataSource?.responseItemsKey,
    dataSource?.payload,
    isFilterEffective,
    query,
    current,
    pageSize,
  ]);

  // Generate request ID for log tracking
  const generateRequestId = useCallback(() => {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }, []);

  // 🔍 Debug: Record dataSource state in buildRequestParams
  useEffect(() => {
    logger.debug({
      message: '[useDataSource] dataSource state (before buildRequestParams)',
      data: {
        hasDataSource: Boolean(dataSource),
        dataSourceType: typeof dataSource,
        dataSourceKeys: dataSource ? Object.keys(dataSource) : [],
        hasRequest: Boolean(dataSource?.request),
        requestType: typeof dataSource?.request,
        ready: dataSource?.ready,
        manual: dataSource?.manual,
        isServerPagination: dataSource?.isServerPagination,
      },
      source: 'CustomTable',
      component: 'useDataSource/dataSource-state',
    });
  }, [dataSource]);

  // Helper function to build request parameters
  const buildRequestParams = () => {
    // Build pagination parameters - use skip/limit format
    const pageReq = dataSource?.isServerPagination
      ? {
          page_req: {
            skip: (current - 1) * pageSize,
            limit: pageSize,
          },
        }
      : {};

    const formatPageReq =
      (
        dataSource?.paginationConvert as
          | ((pageReq: Record<string, unknown>) => Record<string, unknown>)
          | undefined
      )?.(pageReq) || pageReq;

    // Build sorting parameters - use sort_columns format directly
    // Check if sorter has field property, not if object is empty
    const sortColumnsReq = sorter?.field
      ? {
          sort_columns: [
            {
              column:
                (props.sortFieldMap as Record<string, string> | undefined)?.[
                  sorter.field
                ] || snakeCase(sorter.field),
              desc: sorter.direction === 'descend',
            },
          ],
        }
      : {};

    // Record sorting parameters log
    // Note: Extract complex object parameters as variables to avoid TypeScript parsing errors (TS1136)
    const sortLoggerMessage = 'Building sort parameters';
    const sortLoggerData = {
      sorter,
      sortColumnsReq,
      hasSorterField: Boolean(sorter?.field),
      sortFieldMap: props.sortFieldMap,
      sorterField: sorter?.field,
      sorterDirection: sorter?.direction,
      willIncludeSortColumns: Boolean(sortColumnsReq.sort_columns),
    };
    logger.info({
      message: sortLoggerMessage,
      data: sortLoggerData,
      source: 'CustomTable',
      component: 'useDataSource/buildRequestParams',
    });

    // Build column filter parameters
    const emptyColumnReq = dataSource?.isEmptyColumnsFilter
      ? {
          emptyColumns:
            (
              props.formatFilterColumns as
                | ((
                    filters: Record<string, unknown>,
                  ) => Record<string, unknown>)
                | undefined
            )?.(filters) || filters,
        }
      : {};

    // Merge all request parameters
    const payload = filterEmptyDataByKeys({
      ...query,
      ...filters,
      ...dataSource?.payload,
      ...sortColumnsReq,
      ...formatPageReq,
      ...emptyColumnReq,
    });

    const finalPayload =
      (
        dataSource?.formatPayload as
          | ((payload: Record<string, unknown>) => Record<string, unknown>)
          | undefined
      )?.(payload) || payload;
    // Record final request parameters log
    logger.info({
      message: 'Final request parameters',
      data: {
        payload,
        finalPayload,
        hasSortColumns: Boolean(finalPayload.sort_columns),
        sortColumns: finalPayload.sort_columns,
        hasQuery: Boolean(query && Object.keys(query).length > 0),
        hasFilters: Boolean(filters && Object.keys(filters).length > 0),
        hasPagination: Boolean(formatPageReq.page_req),
      },
      source: 'CustomTable',
      component: 'useDataSource/buildRequestParams',
    });

    return finalPayload;
  };

  // Helper function to send API request
  /**
   * Why requestParams uses any:
   * - Request parameter types are determined by different API services and cannot be predetermined
   * - Parameters are passed to dataSource.request function, whose type is defined by the service instance
   * - Using any allows flexible request parameter passing, type safety is ensured by the API service layer
   */
  const sendApiRequest = async (requestParams: Record<string, unknown>) => {
    // 🔍 Debug: Record dataSource state in detail (sendApiRequest entry)
    logger.debug({
      message: '[useDataSource] sendApiRequest entry - dataSource state',
      data: {
        hasDataSource: Boolean(dataSource),
        dataSourceType: typeof dataSource,
        dataSourceKeys: dataSource ? Object.keys(dataSource) : [],
        hasRequest: Boolean(dataSource?.request),
        requestType: typeof dataSource?.request,
        hasServiceInstance: Boolean(dataSource?.serviceInstance),
        serviceMethod: dataSource?.serviceMethod,
        ready: dataSource?.ready,
        manual: dataSource?.manual,
        isServerPagination: dataSource?.isServerPagination,
        requestParams,
      },
      source: 'CustomTable',
      component: 'sendApiRequest/entry',
    });

    // Record API request parameters
    logger.info({
      message: 'Sending API request',
      data: {
        requestParams,
        hasSortColumns: Boolean(requestParams.sort_columns),
        sort_columns: requestParams.sort_columns,
        sortColumnsDetail: Array.isArray(requestParams.sort_columns)
          ? requestParams.sort_columns.map((sc) => ({
              column: sc.column,
              desc: sc.desc,
            }))
          : undefined,
        page_req: requestParams.page_req,
        dataSource: {
          hasRequest: Boolean(dataSource.request),
          requestType: typeof dataSource.request,
          hasServiceInstance: Boolean(dataSource.serviceInstance),
          serviceMethod: dataSource.serviceMethod,
          ready: dataSource.ready,
          isServerPagination: dataSource.isServerPagination,
        },
      },
      source: 'CustomTable',
      component: 'sendApiRequest',
    });

    if (dataSource.request && typeof dataSource.request === 'function') {
      // Mode 1: Use request function directly
      return await dataSource.request(requestParams);
    }

    if (dataSource.serviceInstance && dataSource.serviceMethod) {
      // Mode 2: Use serviceInstance[serviceMethod]
      // Why use type assertion:
      // - serviceMethod is a dynamic method name, TypeScript cannot infer specific method type
      // - Need type assertion to ensure call safety, type safety is ensured by runtime service instance

      const serviceMethod = dataSource.serviceMethod as string;

      const serviceInstance = dataSource.serviceInstance as Record<
        string,
        (
          params: Record<string, unknown>,

          options?: { pluginConfig?: Record<string, unknown> },
        ) => Promise<unknown>
      >;

      return await serviceInstance[serviceMethod](requestParams, {
        pluginConfig: {
          ...(dataSource?.pluginConfig || {
            showNotice: {
              stage: 'fail',
            },
            title: 'Notification',
            content: 'List data request',
          }),
        },
      });
    }

    throw new Error(
      'DataSource configuration error: must provide request function or serviceInstance + serviceMethod',
    );
  };

  // Request data
  const { data, loading, error, run, cancel } = useRequest(
    async () => {
      const requestId = generateRequestId();

      // Record request start log

      try {
        // If request is cancelled, return early
        if (dataSource?.isCancel) {
          return { list: [], total: 0 };
        }

        const requestParams = buildRequestParams();
        const response = await sendApiRequest(requestParams);

        // Double check if cancelled
        if (dataSource?.isCancel) {
          return { list: [], total: 0 };
        }

        const { newDataList, responseTotal } = extractResponseData(
          response,
          dataSource,
        );

        devLog.log({
          component: 'useDataSource',
          message: 'API Response extracted:',
          data: {
            response,
            newDataListLength: newDataList?.length,
            responseTotal,
          },
        });

        const result = buildRequestResult(
          response,
          newDataList,
          responseTotal,
          dataSource,
          current,
          props.setCurrent as (
            updater: number | ((prev: number) => number),
          ) => void,
          props.isQueryChange as boolean,
          query,
        );

        return result;
      } catch (error) {
        handleRequestError(error, requestId, dataSource);
        return { list: [], total: 0 };
      }
    },
    {
      debounceWait: 300,
      retryCount: 0, // Disable auto retry to avoid infinite loop on 404 errors
      refreshDeps,
      ready: dataSource.ready,
      manual: dataSource.manual,
      onError: (_error) => {
        // Record useRequest level errors
      },
      onSuccess: (_result) => {
        // Record request success log
      },
    },
  );

  // Frontend filter table data
  const formattedTableData = (() => {
    if ((!data && !dataSource?.dataList) || resetEmptyData) {
      return [];
    }

    let newFilterData = [];

    if (!isEmpty(dataSource?.dataList)) {
      // Why use type assertion and type conversion:
      // - dataSource.dataList may be an array of any type of data
      // - formatTableData is a generic function that requires explicit type parameters
      // - This data will be type-safely converted inside formatTableData
      const formatDataList = formatTableData<unknown, unknown>({
        sourceData: (dataSource?.dataList as unknown[]) || [],
        addRowKey: Boolean(dataSource?.addRowKey),
        arrayFields: (dataSource?.arrayFields as string[]) || [],
        formatDataConfig:
          (dataSource?.formatDataConfig as Record<string, unknown>) || {},
      });
      newFilterData = Array.isArray(formatDataList) ? formatDataList : [];
    } else {
      newFilterData = Array.isArray(data?.list) ? data.list : [];
    }

    const isFilterEmpty = isEmpty(filterEmptyDataByKeys(filters));
    const querySearchKey = dataSource?.querySearchKey;
    const search = querySearchKey
      ? (query[querySearchKey] as string | undefined)
      : undefined;

    // Client-side keyword search
    if (search && !isEmpty(dataSource?.querySearchMatchKeys)) {
      const keyword = String(search).toLowerCase();

      // Use unknown type because data item type is determined by dataSource configuration
      newFilterData = newFilterData.filter((item: unknown) => {
        const itemObj = item as Record<string, unknown>;
        return (
          dataSource?.querySearchMatchKeys?.some((key: string) =>
            String(itemObj?.[key]).toLowerCase().includes(keyword),
          ) ?? false
        );
      });
    }

    // Client-side filtering
    if (
      enableClientFiltering &&
      !isFilterEmpty &&
      !dataSource?.isServerPagination
    ) {
      newFilterData =
        (
          props.filterTableData as
            | ((data: unknown[], filters: Record<string, unknown>) => unknown[])
            | undefined
        )?.(newFilterData, filters) || newFilterData;
    }

    return newFilterData;
  })();

  // Calculate table total
  const tableTotal = (() => {
    const result =
      data?.total && dataSource?.isServerPagination
        ? data.total
        : formattedTableData?.length || 0;

    devLog.log({
      component: 'useDataSource',
      message: 'tableTotal calculation:',
      data: {
        'data?.total': data?.total,
        isServerPagination: dataSource?.isServerPagination,
        'formattedTableData?.length': formattedTableData?.length,
        result,
        'data structure': Object.keys(data || {}),
      },
    });

    return result;
  })();

  // Load more data
  const loadMoreData = useCallback(() => {
    run();
  }, [run]);

  // Monitor sorting state changes
  useEffect(() => {
    logger.log({
      message: 'Sort state change listener triggered',
      data: {
        sorter,
        sorterKeys: Object.keys(sorter),
        hasField: Boolean(sorter?.field),
        field: sorter?.field,
        direction: sorter?.direction,
        sorterType: typeof sorter,
        sorterIsEmpty: Object.keys(sorter || {}).length === 0,
      },
      source: 'CustomTable',
      component: 'useDataSource/sorterChange',
    });
  }, [sorter]);

  // Set handler functions
  useEffect(() => {
    dataSource?.onProcess?.({
      run: () => {
        run?.();
        setResetEmptyData(false);
      },
      stop: cancel,
      resetQuery: ({ resetEmptyData: newResetEmptyData = false } = {}) => {
        (props.setQuery as (query: Record<string, unknown>) => void)({});
        (
          props.setSearchParams as
            | ((params: Record<string, unknown>) => void)
            | undefined
        )?.({});
        setResetEmptyData(newResetEmptyData);
      },
    });
  }, [dataSource, run, cancel, props.setQuery, props.setSearchParams]);

  // Methods to manually control loading and error
  const setLoading = useCallback((loading: boolean) => {
    setManualLoading(loading);
  }, []);

  const setError = useCallback((error: Error | null) => {
    setManualError(error);
  }, []);

  // Actual loading and error state: manual state takes priority, otherwise use request state
  const finalLoading = manualLoading !== null ? manualLoading : loading;
  const finalError = manualError !== null ? manualError : error;

  return {
    data: formattedTableData,
    loading: finalLoading,
    error: finalError,
    tableTotal,
    resetEmptyData,
    setResetEmptyData,
    loadMoreData,
    // New: Manual control methods
    setLoading,
    setError,
  };
};
