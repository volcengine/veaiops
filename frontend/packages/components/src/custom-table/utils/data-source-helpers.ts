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

import type { BaseQuery, BaseRecord } from '@/custom-table/types/core/common';
import type { TableDataSource } from '@/custom-table/types/core/data-source';
import { formatTableData } from '@/custom-table/utils';
import { Message } from '@arco-design/web-react';
import { devLog } from './log-utils';

/**
 * Helper function to extract response data
 *
 * Why use unknown:
 * - response parameter needs to handle response structures from different APIs (response.data, response.result, etc.)
 * - newDataList needs to accommodate data of different RecordType, specific type cannot be determined before formatting
 * - Using unknown is safer than any, forcing type checking before use
 * - This data will be type-safely converted through formatTableData in subsequent steps
 */
export const extractResponseData = (
  response: unknown,
  dataSource: TableDataSource,
): { newDataList: unknown[]; responseTotal: number } => {
  let newDataList: unknown[] = [];
  let responseTotal = 0;

  if (dataSource.request && typeof dataSource.request === 'function') {
    const responseData = response as {
      data?: unknown[];
      total?: number;
    };
    if (responseData?.data && Array.isArray(responseData.data)) {
      newDataList = responseData.data;
      responseTotal = responseData.total ?? responseData.data.length;
      devLog.log({
        component: 'useDataSource',
        message: 'Data found in request response.data:',
        data: {
          dataLength: newDataList.length,
          total: responseTotal,
        },
      });
    } else {
      devLog.log({
        component: 'useDataSource',
        message: 'No data found in request response.data',
      });
    }
  } else {
    // Original serviceInstance[serviceMethod] logic
    const itemsKey = dataSource.responseItemsKey as string;
    const responseWithResult = response as {
      result?: Record<string, unknown>;
      [key: string]: unknown;
    };

    if (itemsKey && responseWithResult?.result?.[itemsKey]) {
      const items = responseWithResult.result[itemsKey];
      newDataList = Array.isArray(items) ? items : [];
      devLog.log({
        component: 'useDataSource',
        message: 'Data found in response.result[itemsKey]:',
        data: {
          dataLength: newDataList.length,
        },
      });
    } else if (itemsKey && responseWithResult?.[itemsKey]) {
      const items = responseWithResult[itemsKey];
      newDataList = Array.isArray(items) ? items : [];
      devLog.log({
        component: 'useDataSource',
        message: 'Data found in response[itemsKey]:',
        data: {
          dataLength: newDataList.length,
        },
      });
    } else {
      devLog.log({
        component: 'useDataSource',
        message: 'No data found in response[itemsKey]',
      });
    }
  }

  return { newDataList, responseTotal };
};

/**
 * Helper function to handle request errors
 *
 * Why use unknown:
 * - error object may come from different error sources (network errors, API errors, etc.)
 * - Need to be compatible with different error structures (error.status, error.code, error.statusCode, etc.)
 * - Using unknown type is safer, requires type checking before accessing properties
 */
export const handleRequestError = (
  e: unknown,
  _requestId: string,
  dataSource: TableDataSource,
): void => {
  // Handle different types of error objects
  let error:
    | Error
    | {
        message?: string;
        msg?: string;
        status?: number;
        code?: number;
        statusCode?: number;
      };

  if (e instanceof Error) {
    error = e;
  } else if (typeof e === 'object' && e !== null) {
    error = e as {
      message?: string;
      msg?: string;
      status?: number;
      code?: number;
      statusCode?: number;
    };
  } else {
    error = { message: String(e) };
  }

  const errorMessage =
    (error as { message?: string; msg?: string }).message ||
    (error as { msg?: string }).msg ||
    'Request failed';
  const statusCode: number | undefined =
    (error as { status?: number; code?: number; statusCode?: number }).status ||
    (error as { code?: number }).code ||
    (error as { statusCode?: number }).statusCode;

  // Log detailed error information
  devLog.error({
    component: 'useDataSource',
    message: 'Request failed:',
    data: {
      error: errorMessage,
      statusCode: statusCode ?? 'unknown',
      url: (dataSource as { apiUrl?: string })?.apiUrl || 'unknown',
    },
  });

  // ✅ Correct: Decide whether to show error message based on error type, prioritize showing actual error information
  // Note: For specific status codes (404, 500+), append actual error information to the base message
  // Error messages (user-facing)
  if (statusCode === 404) {
    const finalMessage =
      errorMessage && errorMessage !== 'Request failed'
        ? `Resource not found: ${errorMessage}`
        : 'Resource not found';
    Message.error(finalMessage);
  } else if (statusCode && statusCode >= 500) {
    const finalMessage =
      errorMessage && errorMessage !== 'Request failed'
        ? `Server error: ${errorMessage}`
        : 'Server error, please try again later';
    Message.error(finalMessage);
  } else if (statusCode && statusCode >= 400) {
    // ✅ Correct: Show actual error information
    Message.error(errorMessage);
  } else {
    // ✅ Correct: For errors without status codes, prioritize showing actual error information
    const finalMessage =
      errorMessage && errorMessage !== 'Request failed'
        ? errorMessage
        : 'Request failed, please check your network connection';
    Message.error(finalMessage);
  }

  // Convert unknown type error to Error object
  const errorObj = e instanceof Error ? e : new Error(String(errorMessage));
  dataSource?.onError?.(errorObj);
  dataSource?.onFinally?.();
};

/**
 * Build request result
 *
 * Why use unknown:
 * - response needs to handle response structures from different APIs
 * - newDataList cannot determine specific RecordType before formatting
 * - query uses Record<string, unknown> to be compatible with different query parameter types
 * - Using unknown is safer than any, forcing type checking before use
 * - This data will be type-safely converted in subsequent steps
 */
export const buildRequestResult = (
  response: unknown,
  newDataList: unknown[],
  responseTotal: number,
  dataSource: TableDataSource,
  current: number,
  setCurrent: (updater: number | ((prev: number) => number)) => void,
  isQueryChange: boolean,
  query: Record<string, unknown>,
): { list: unknown[]; total: number } => {
  // Handle empty pagination case
  if (newDataList.length === 0 && current > 1) {
    setCurrent((prevState: number) => prevState - 1);
  }

  // Extract responseData first for subsequent calculations
  const responseData = response as {
    Result?: { pageResp?: { totalCount?: number } };
    result?: { pageResp?: { totalCount?: number } };
    [key: string]: unknown;
  };

  // Format result
  const result = {
    list: formatTableData({
      sourceData: newDataList,
      addRowKey: Boolean(dataSource?.addRowKey),
      arrayFields: dataSource?.arrayFields || [],
      formatDataConfig: (dataSource?.formatDataConfig || {}) as Record<
        string,
        unknown
      >,
    }),
    total:
      dataSource.request && typeof dataSource.request === 'function'
        ? responseTotal
        : responseData.Result?.pageResp?.totalCount ||
          responseData.result?.pageResp?.totalCount ||
          newDataList?.length ||
          0,
  };

  devLog.log({
    component: 'useDataSource',
    message: 'Final result:',
    data: {
      listLength: result.list?.length || 0,
      total: result.total,
      responseTotal,
      isRequestFunction:
        dataSource.request && typeof dataSource.request === 'function',
    },
  });

  // Success callback
  const responseResultData =
    (responseData.Result as Record<string, unknown>) ||
    (responseData.result as Record<string, unknown>) ||
    {};
  if (dataSource?.onSuccess) {
    // result.list has been processed in formatTableData, type has been converted
    // Use type assertion because formatTableData returns formatted data that meets BaseRecord requirements
    dataSource.onSuccess({
      query: query as BaseQuery,
      v: result?.list as BaseRecord[],
      extra: responseResultData
        ? Object.keys(responseResultData)
            .filter((key) => key !== dataSource.responseItemsKey)
            .reduce((obj: Record<string, unknown>, key: string) => {
              obj[key] = responseResultData[key];
              return obj;
            }, {})
        : {},
      isQueryChange,
    });
  }

  dataSource?.onFinally?.();

  return result;
};
