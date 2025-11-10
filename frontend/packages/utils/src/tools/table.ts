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

import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from './logger/core';

/**
 * Custom Table utility functions
 */

/**
 * Custom Table pagination parameters interface
 */
export interface CustomTablePageReq {
  skip: number; // Number of records to skip
  limit: number; // Limit of records to return
}

/**
 * Custom Table request parameters interface
 *
 * @template Q - Query parameter type, representing other query conditions besides pagination parameters (e.g., name, channel, status, etc.)
 *
 * Why use generics instead of unknown:
 * - Generics provide better type inference, automatically deriving specific types of query parameters when used
 * - When business code passes specific QueryType, it can enjoy full type safety and IDE autocomplete
 * - Default to Record<string, unknown> as fallback to ensure compatibility
 *
 * @example
 * ```typescript
 * // Define specific query parameter type
 * interface BotQuery {
 *   name?: string;
 *   channel?: ChannelType;
 * }
 *
 * // Type will be inferred as BotQuery when used
 * const params: CustomTableParams<BotQuery> = {
 *   page_req: { skip: 0, limit: 10 },
 *   name: 'test',
 *   channel: 'lark',
 * };
 * ```
 */
export type CustomTableParams<
  Q extends Record<string, unknown> = Record<string, unknown>,
> = {
  page_req?: CustomTablePageReq;
} & Q;

/**
 * API pagination parameters interface
 */
export interface ApiPaginationParams {
  skip: number; // Number of records to skip
  limit: number; // Limit of records to return
}

/**
 * Convert Custom Table pagination parameters to API pagination parameters
 *
 * @param params - Parameter object
 * @param params.page_req - Custom Table pagination parameters
 * @param params.defaultLimit - Default limit, defaults to 10
 * @returns API pagination parameters
 *
 * @example
 * ```typescript
 * const page_req = { skip: 20, limit: 20 };
 * const apiParams = convertTablePaginationToApi({ page_req });
 * // Result: { skip: 20, limit: 20 }
 * ```
 */
export interface ConvertTablePaginationToApiParams {
  page_req?: CustomTablePageReq;
  defaultLimit?: number;
}

export function convertTablePaginationToApi({
  page_req,
  defaultLimit = 10,
}: ConvertTablePaginationToApiParams): ApiPaginationParams {
  if (!page_req) {
    return {
      skip: 0,
      limit: defaultLimit,
    };
  }

  const { skip = 0, limit = defaultLimit } = page_req;

  return {
    skip,
    limit,
  };
}

/**
 * Extract pagination and other parameters from Custom Table parameters
 *
 * @template Q - Query parameter type, automatically inferred from CustomTableParams<Q>
 * @param params - Extraction parameters
 * @param params.params - Custom Table request parameters
 * @param params.defaultLimit - Default limit, defaults to 10
 * @returns Object containing pagination parameters and other parameters, otherParams type will be inferred as Q
 *
 * @example
 * ```typescript
 * // Define query parameter type
 * interface BotQuery {
 *   name?: string;
 *   channel?: ChannelType;
 * }
 *
 * const params: CustomTableParams<BotQuery> = {
 *   page_req: { skip: 20, limit: 20 },
 *   name: 'test',
 *   channel: 'lark',
 * };
 *
 * const { pagination, otherParams } = extractTableParams({ params });
 * // pagination: { skip: 20, limit: 20 }
 * // otherParams: BotQuery - type will be automatically inferred
 * ```
 */
export interface ExtractTableParamsParams<
  Q extends Record<string, unknown> = Record<string, unknown>,
> {
  params: CustomTableParams<Q>;
  defaultLimit?: number;
}

export function extractTableParams<
  Q extends Record<string, unknown> = Record<string, unknown>,
>({
  params,
  defaultLimit = 10,
}: ExtractTableParamsParams<Q>): {
  pagination: ApiPaginationParams;
  /**
   * Other parameters (all parameters except page_req)
   * Type will be inferred as Q, providing full type safety
   */
  otherParams: Q;
} {
  const { page_req, ...rest } = params;
  const pagination = convertTablePaginationToApi({ page_req, defaultLimit });

  // Type assertion: rest type is Q, because CustomTableParams<Q> = { page_req?: CustomTablePageReq } & Q
  // After destructuring, the remaining properties excluding page_req are Q
  const otherParams = rest as Q;

  return {
    pagination,
    otherParams,
  };
}

/**
 * CustomTable sort column item interface
 * Corresponds to the sort_columns format built by CustomTable use-data-source
 */
export interface TableSortColumn {
  column: string; // Field name (snake_case)
  desc: boolean; // true=descending, false=ascending
}

/**
 * Convert CustomTable sorting parameters to API sorting parameters
 *
 * CustomTable format: sort_columns: [{ column: "created_at", desc: false }]
 * API required format: sortOrder: 'asc' | 'desc'
 *
 * @param params - Parameter object
 * @param params.sortColumns - CustomTable sort_columns parameter
 * @param params.allowedFields - List of allowed sortable fields (optional). If provided, only fields in the list will be processed
 * @returns API sorting parameter ('asc' | 'desc' | undefined)
 *
 * @example
 * ```typescript
 * // Basic usage
 * const sortOrder = convertTableSortToApi({ sortColumns: params.sort_columns });
 * // sortOrder: 'asc' | 'desc' | undefined
 *
 * // Restrict to only allow created_at field sorting
 * const sortOrder = convertTableSortToApi({ sortColumns: params.sort_columns, allowedFields: ['created_at'] });
 *
 * // Use in API request
 * const apiParams = {
 *   skip: 0,
 *   limit: 10,
 *   sortOrder: convertTableSortToApi({ sortColumns: params.sort_columns, allowedFields: ['created_at'] }),
 * };
 * ```
 */
export interface ConvertTableSortToApiParams {
  sortColumns: unknown;
  allowedFields?: string[];
}

export function convertTableSortToApi({
  sortColumns,
  allowedFields,
}: ConvertTableSortToApiParams): 'asc' | 'desc' | undefined {
  // Validate if sort_columns is a valid array
  if (!Array.isArray(sortColumns) || sortColumns.length === 0) {
    return undefined;
  }

  const firstSortColumn = sortColumns[0];

  // Validate sort_columns structure
  if (
    !firstSortColumn ||
    typeof firstSortColumn !== 'object' ||
    !('column' in firstSortColumn) ||
    !('desc' in firstSortColumn) ||
    typeof firstSortColumn.column !== 'string' ||
    typeof firstSortColumn.desc !== 'boolean'
  ) {
    return undefined;
  }

  const typedColumn = firstSortColumn as TableSortColumn;

  // If allowed fields list is specified, validate if field is in the list
  if (allowedFields && allowedFields.length > 0) {
    if (!allowedFields.includes(typedColumn.column)) {
      return undefined;
    }
  }

  // Conversion rule: desc: false -> 'asc' (ascending), desc: true -> 'desc' (descending)
  return typedColumn.desc ? 'desc' : 'asc';
}

/**
 * Create Custom Table request function wrapper
 *
 * @template T - API response type
 * @template Q - Query parameter type, used to infer CustomTableParams<Q> and other parameter types
 * @param params - Parameter object
 * @param params.apiCall - Actual API call function, receives pagination parameters and query parameters
 * @param params.defaultLimit - Default limit, defaults to 10
 * @returns Wrapped request function that receives CustomTableParams<Q> parameters
 *
 * @example
 * ```typescript
 * // Define query parameter type
 * interface BotQuery {
 *   name?: string;
 *   channel?: ChannelType;
 * }
 *
 * // Define response type
 * interface BotListResponse {
 *   data: Bot[];
 *   total: number;
 * }
 *
 * const request = createTableRequestWrapper<BotListResponse, BotQuery>({
 *   apiCall: async ({ skip, limit, name, channel }) => {
 *     // name and channel types will be correctly inferred as types in BotQuery
 *     return await apiClient.bots.getApisV1ManagerSystemConfigBots({
 *       skip, limit, name, channel
 *     });
 *   }
 * });
 *
 * // Use in dataSource
 * const dataSource = {
 *   request,
 *   ready: true,
 *   isServerPagination: true,
 * };
 * ```
 */
export interface CreateTableRequestWrapperParams<
  T = unknown,
  Q extends Record<string, unknown> = Record<string, unknown>,
> {
  apiCall: (params: ApiPaginationParams & Q) => Promise<T>;
  defaultLimit?: number;
}

export function createTableRequestWrapper<
  T = unknown,
  Q extends Record<string, unknown> = Record<string, unknown>,
>({ apiCall, defaultLimit = 10 }: CreateTableRequestWrapperParams<T, Q>) {
  return async (params: CustomTableParams<Q>): Promise<T> => {
    const { pagination, otherParams } = extractTableParams({
      params,
      defaultLimit,
    });

    return await apiCall({
      ...pagination,
      ...otherParams,
    });
  };
}

/**
 * Standard API response interface
 * Corresponds to standard response format returned by backend
 */
export interface StandardApiResponse<T = unknown> {
  code: number;
  message?: string;
  data?: T;
  total?: number;
  [key: string]: unknown;
}

/**
 * Compatibility type: supports pagination response with optional code
 * Used to handle types like PaginatedAPIResponse
 */
export interface PaginatedApiResponse<T = unknown> {
  code?: number;
  message?: string;
  data?: T;
  total?: number;
  [key: string]: unknown;
}

/**
 * Table data response interface
 * Response format required by CustomTable
 */
export interface TableDataResponse<T = unknown> {
  data: T[];
  total: number;
  success: boolean;
}

/**
 * Configuration options for handling API responses
 */
export interface HandleApiResponseOptions {
  /**
   * Error message prefix, defaults to empty string
   */
  errorMessagePrefix?: string;
  /**
   * Default error message, used when error information cannot be extracted
   */
  defaultErrorMessage?: string;
  /**
   * Whether to show error message, defaults to true
   */
  showErrorMessage?: boolean;
  /**
   * Data transformation function, converts API response data to format required by table
   */
  transformData?: <T>(data: unknown) => T[];
  /**
   * Function to extract total, if API response doesn't have total field, can use this function to calculate
   */
  extractTotal?: (
    response: StandardApiResponse | PaginatedApiResponse,
  ) => number;
  /**
   * Custom error handling function
   */
  onError?: (
    error: unknown,
    response?: StandardApiResponse | PaginatedApiResponse,
  ) => void;
}

/**
 * Handle standard API response, convert to table data format
 *
 * @param params - Processing parameters
 * @param params.response - API response
 * @param params.options - Processing options
 * @returns Table data response
 *
 * @example
 * ```typescript
 * // Basic usage
 * const tableResponse = handleApiResponse({ response });
 * // Result: { data: [...], total: 100, success: true }
 *
 * // With data transformation
 * const tableResponse = handleApiResponse({
 *   response,
 *   options: {
 *     transformData: (data) => (Array.isArray(data) ? data : [])
 *   }
 * });
 *
 * // Custom error handling
 * const tableResponse = handleApiResponse({
 *   response,
 *   options: {
 *     onError: (error) => {
 *       logger.error({ message: 'Custom error handling', data: { error }, source: 'Module', component: 'method' });
 *     }
 *   }
 * });
 * ```
 */
export interface HandleApiResponseParams<T = unknown> {
  response: StandardApiResponse<T> | PaginatedApiResponse<T>;
  options?: HandleApiResponseOptions;
}

export function handleApiResponse<T = unknown>({
  response,
  options = {},
}: HandleApiResponseParams<T>): TableDataResponse<T> {
  const {
    errorMessagePrefix = '',
    defaultErrorMessage = 'Failed to fetch data, please retry',
    showErrorMessage = true,
    transformData,
    extractTotal,
    onError,
  } = options;

  // Check if response is successful (compatible with optional code)
  const responseCode = response.code ?? API_RESPONSE_CODE.SUCCESS;
  if (
    responseCode === API_RESPONSE_CODE.SUCCESS &&
    response.data !== undefined
  ) {
    // Process data
    let dataArray: T[] = [];
    if (transformData) {
      dataArray = transformData<T>(response.data);
    } else if (Array.isArray(response.data)) {
      dataArray = response.data as T[];
    } else {
      // If data is not an array, convert to array
      dataArray = [response.data as T];
    }

    // Extract total
    let total = 0;
    if (extractTotal) {
      total = extractTotal(response);
    } else {
      const { total: responseTotal } = response;
      if (typeof responseTotal === 'number' && responseTotal >= 0) {
        total = responseTotal;
      } else {
        // If no total field, use data length
        total = dataArray.length;
      }
    }

    return {
      data: dataArray,
      total,
      success: true,
    };
  }

  // Handle error response
  const errorMessage = response.message || defaultErrorMessage;
  const fullErrorMessage = errorMessagePrefix
    ? `${errorMessagePrefix}: ${errorMessage}`
    : errorMessage;

  // ✅ Use logger to record errors (not directly using Message, avoid depending on UI library in utils package)
  if (showErrorMessage) {
    logger.error({
      message: fullErrorMessage,
      data: { response, errorMessage, errorMessagePrefix },
      source: 'TableUtils',
      component: 'handleApiResponse',
    });
  }

  if (onError) {
    onError(new Error(errorMessage), response);
  }

  return {
    data: [],
    total: 0,
    success: false,
  };
}

/**
 * Create table request function wrapper with error handling
 *
 * This function automatically handles:
 * - Pagination parameter conversion (page_req -> skip/limit)
 * - API response format conversion (StandardApiResponse -> TableDataResponse)
 * - Error handling and message display
 *
 * @template T - API response data type
 * @template Q - Query parameter type, used to infer CustomTableParams<Q> and other parameter types
 * @param params - Parameter object
 * @param params.apiCall - Actual API call function, receives pagination parameters and query parameters, returns StandardApiResponse
 * @param params.options - Configuration options
 * @returns Wrapped request function that receives CustomTableParams<Q> parameters and returns TableDataResponse
 *
 * @example
 * ```typescript
 * // Define query parameter type
 * interface BotQuery {
 *   name?: string;
 *   channel?: ChannelType;
 * }
 *
 * // Define response data type
 * interface Bot {
 *   _id: string;
 *   name: string;
 *   channel: ChannelType;
 * }
 *
 * // Use generic parameters
 * const request = createTableRequestWithResponseHandler<Bot, BotQuery>({
 *   apiCall: async ({ skip, limit, name, channel }) => {
 *     // name and channel types will be correctly inferred as types in BotQuery
 *     return await apiClient.bots.getApisV1ManagerSystemConfigBots({
 *       skip, limit, name, channel
 *     });
 *   },
 *   options: {
 *     errorMessagePrefix: 'Failed to fetch bot list'
 *   }
 * });
 *
 * // Use in dataSource
 * const dataSource = {
 *   request,
 *   ready: true,
 *   isServerPagination: true,
 * };
 * ```
 */
export interface CreateTableRequestWithResponseHandlerParams<
  T = unknown,
  Q extends Record<string, unknown> = Record<string, unknown>,
> {
  apiCall: (
    params: ApiPaginationParams & Q,
  ) => Promise<StandardApiResponse<T> | PaginatedApiResponse<T>>;
  options?: HandleApiResponseOptions & { defaultLimit?: number };
}

export function createTableRequestWithResponseHandler<
  T = unknown,
  Q extends Record<string, unknown> = Record<string, unknown>,
>({
  apiCall,
  options = {},
}: CreateTableRequestWithResponseHandlerParams<T, Q>): (
  params: CustomTableParams<Q>,
) => Promise<TableDataResponse<T>> {
  const { defaultLimit = 10, ...responseOptions } = options;

  return async (
    params: CustomTableParams<Q>,
  ): Promise<TableDataResponse<T>> => {
    try {
      // Extract pagination and other parameters
      const { pagination, otherParams } = extractTableParams({
        params,
        defaultLimit,
      });

      // Call API
      const apiResponse = await apiCall({
        ...pagination,
        ...otherParams,
      });

      // Handle response (supports StandardApiResponse and PaginatedApiResponse)
      // handleApiResponse function internally handles type compatibility, ensuring code is correctly converted to number
      return handleApiResponse<T>({
        response: apiResponse,
        options: responseOptions,
      });
    } catch (error: unknown) {
      // ✅ Correct: expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage =
        errorObj.message ||
        options.defaultErrorMessage ||
        'Failed to fetch data, please retry';

      // ✅ Use logger to record errors (not directly using Message, avoid depending on UI library in utils package)
      // Note: If user-friendly error messages need to be displayed, should use onError callback in the calling code
      if (options.showErrorMessage !== false) {
        const fullErrorMessage = options.errorMessagePrefix
          ? `${options.errorMessagePrefix}: ${errorMessage}`
          : errorMessage;
        logger.error({
          message: fullErrorMessage,
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
            params,
          },
          source: 'TableUtils',
          component: 'createTableRequestWithResponseHandler',
        });
      }

      // Custom error handling
      if (options.onError) {
        options.onError(error);
      }

      return {
        data: [],
        total: 0,
        success: false,
      };
    }
  };
}

/**
 * Standard table data source configuration
 *
 * @template Q - Query parameter type, used to infer CustomTableParams<Q>
 */
export interface StandardTableDataSource<
  Q extends Record<string, unknown> = Record<string, unknown>,
> {
  request?: (params: CustomTableParams<Q>) => Promise<TableDataResponse>;
  ready: boolean;
  isServerPagination?: boolean;
  dataList?: unknown[];
  manual?: boolean;
}

/**
 * Create standard server-side pagination data source configuration
 *
 * @template Q - Query parameter type, used to infer CustomTableParams<Q>
 * @param params - Parameter object
 * @param params.request - Request function that receives CustomTableParams<Q> parameters
 * @param params.ready - Whether ready, defaults to true
 * @returns Data source configuration object
 *
 * @example
 * ```typescript
 * // Define query parameter type
 * interface BotQuery {
 *   name?: string;
 *   channel?: ChannelType;
 * }
 *
 * const request = (params: CustomTableParams<BotQuery>) => {
 *   // Implement request logic
 * };
 * const dataSource = createServerPaginationDataSource<BotQuery>({ request });
 * // Result: { request, ready: true, isServerPagination: true }
 * ```
 */
export interface CreateServerPaginationDataSourceParams<
  Q extends Record<string, unknown> = Record<string, unknown>,
> {
  request: (params: CustomTableParams<Q>) => Promise<TableDataResponse>;
  ready?: boolean;
}

export function createServerPaginationDataSource<
  Q extends Record<string, unknown> = Record<string, unknown>,
>({
  request,
  ready = true,
}: CreateServerPaginationDataSourceParams<Q>): StandardTableDataSource<Q> {
  // Debug: validate request parameter
  logger.debug({
    message: '[createServerPaginationDataSource] Creating data source',
    data: {
      hasRequest: Boolean(request),
      requestType: typeof request,
      ready,
    },
    source: 'TableUtils',
    component: 'createServerPaginationDataSource',
  });

  const dataSource = {
    request,
    ready,
    isServerPagination: true,
  };

  // Validate returned object
  logger.debug({
    message: '[createServerPaginationDataSource] Returning data source',
    data: {
      hasRequest: Boolean(dataSource.request),
      requestType: typeof dataSource.request,
      ready: dataSource.ready,
      isServerPagination: dataSource.isServerPagination,
    },
    source: 'TableUtils',
    component: 'createServerPaginationDataSource',
  });

  return dataSource;
}

/**
 * Create local data source configuration
 *
 * @param params - Parameter object
 * @param params.dataList - Data list
 * @param params.ready - Whether ready, defaults to true
 * @returns Data source configuration object
 *
 * @example
 * ```typescript
 * const dataSource = createLocalDataSource({ dataList: [{ id: 1, name: 'test' }] });
 * // Result: { dataList: [...], manual: true, ready: true }
 * ```
 */
export interface CreateLocalDataSourceParams {
  dataList: unknown[];
  ready?: boolean;
}

export function createLocalDataSource({
  dataList,
  ready = true,
}: CreateLocalDataSourceParams): StandardTableDataSource<
  Record<string, unknown>
> {
  return {
    dataList,
    manual: true,
    ready,
  };
}

/**
 * Standard table properties configuration interface
 */
export interface StandardTableProps {
  rowKey?: string;
  scroll?: { x?: number | string; y?: number | string };
  pagination?: {
    pageSize?: number;
    showTotal?: (total: number) => string;
    showJumper?: boolean;
    sizeCanChange?: boolean;
    showSizeChanger?: boolean;
    sizeOptions?: number[];
  };
}

/**
 * Create standard table properties configuration
 *
 * @param options - Configuration options
 * @returns Table properties configuration object
 *
 * @example
 * ```typescript
 * // Basic usage
 * const tableProps = createStandardTableProps({
 *   rowKey: '_id',
 *   pageSize: 10,
 *   scrollX: 1200
 * });
 *
 * // Custom pagination options
 * const tableProps = createStandardTableProps({
 *   rowKey: '_id',
 *   pageSize: 20,
 *   sizeOptions: [20, 50, 100]
 * });
 * ```
 */
export function createStandardTableProps(
  options: {
    rowKey?: string;
    pageSize?: number;
    scrollX?: number | string;
    scrollY?: number | string;
    showTotal?: boolean | ((total: number) => string);
    showJumper?: boolean;
    sizeCanChange?: boolean;
    showSizeChanger?: boolean;
    sizeOptions?: number[];
  } = {},
): StandardTableProps {
  const {
    rowKey = '_id',
    pageSize = 10,
    scrollX = 1500,
    scrollY,
    showTotal: showTotalOption = true,
    showJumper = true,
    sizeCanChange = true,
    showSizeChanger = true,
    sizeOptions = [10, 20, 50, 100],
  } = options;

  const pagination: StandardTableProps['pagination'] = {
    pageSize,
    showJumper,
    sizeCanChange,
    showSizeChanger,
    sizeOptions,
  };

  // Handle showTotal
  if (showTotalOption) {
    pagination.showTotal = (total: number) => `Total ${total} records`;
  } else if (typeof showTotalOption === 'function') {
    pagination.showTotal = showTotalOption;
  }

  const scroll: StandardTableProps['scroll'] = {};
  if (scrollX !== undefined) {
    scroll.x = scrollX;
  }
  if (scrollY !== undefined) {
    scroll.y = scrollY;
  }

  return {
    rowKey,
    ...(Object.keys(scroll).length > 0 && { scroll }),
    pagination,
  };
}
