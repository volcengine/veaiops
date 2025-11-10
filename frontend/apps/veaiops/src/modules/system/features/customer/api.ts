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

import apiClient from '@/utils/api-client';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';
import type { Customer, ImportLog, ImportResult } from 'api-generate';

/**
 * Get Customer list
 * Directly use API returned data, no complex transformation needed
 */
export const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    const response =
      await apiClient.customers.getApisV1ManagerSystemConfigCustomers({});

    if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
      // Directly use API returned data, response.data is Customer[] type
      return response.data as Customer[];
    }
    throw new Error(response.message || '获取Customer列表失败');
  } catch (error) {
    // ✅ Correct: Use logger to record error and expose actual error information
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: '获取Customer列表失败',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
      },
      source: 'CustomerAPI',
      component: 'getCustomers',
    });
    // ✅ Correct: Convert error to Error object before throwing (complies with @typescript-eslint/only-throw-error rule)
    throw errorObj;
  }
};

/**
 * Delete Customer
 *
 * @returns Returns result object in format { success: boolean; error?: Error }
 */
export const deleteCustomer = async (
  customerId: string,
): Promise<{ success: boolean; error?: Error }> => {
  try {
    const response =
      await apiClient.customers.deleteApisV1ManagerSystemConfigCustomers({
        customerId,
      });
    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      return { success: true };
    }
    const errorObj = new Error(response.message || '删除失败');
    return { success: false, error: errorObj };
  } catch (error) {
    // ✅ Correct: Use logger to record error and expose actual error information
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: '删除客户失败',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
        customerId,
      },
      source: 'CustomerAPI',
      component: 'deleteCustomer',
    });
    return { success: false, error: errorObj };
  }
};

// Use generated API types, no longer duplicate definitions
// ImportResult and ImportLog types are already imported from 'api-generate'

/**
 * Import Customer data
 * Uses Python backend dedicated import interface, supports detailed logs
 */
export const importCustomers = async (
  file: File,
  _onProgress?: (logs: ImportLog[]) => void,
): Promise<ImportResult> => {
  // Check file type
  if (!file.name.endsWith('.csv')) {
    throw new Error('仅支持CSV格式的文件');
  }

  // Call generated API interface
  const response =
    await apiClient.customers.postApisV1ManagerSystemConfigCustomersImport({
      formData: { file },
    });

  if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
    const importResult = response.data;

    // ✅ Correct: Use logger to output detailed logs
    if (importResult.logs && importResult.logs.length > 0) {
      importResult.logs.forEach((log) => {
        const logMessage = `[${log.timestamp}] ${log.level}: ${log.message}`;
        const logData = {
          timestamp: log.timestamp,
          level: log.level,
          message: log.message,
          log,
        };
        switch (log.level) {
          case 'ERROR':
            logger.error({
              message: logMessage,
              data: logData,
              source: 'CustomerAPI',
              component: 'importCustomers',
            });
            break;
          case 'WARNING':
            logger.warn({
              message: logMessage,
              data: logData,
              source: 'CustomerAPI',
              component: 'importCustomers',
            });
            break;
          default:
            logger.info({
              message: logMessage,
              data: logData,
              source: 'CustomerAPI',
              component: 'importCustomers',
            });
            break;
        }
      });
    }

    return importResult;
  } else {
    throw new Error(response.message || '导入失败');
  }
};
