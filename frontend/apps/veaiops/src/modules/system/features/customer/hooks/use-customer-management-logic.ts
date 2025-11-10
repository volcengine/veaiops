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
import { Message } from '@arco-design/web-react';
import {
  type CustomerTableData,
  deleteCustomer,
  importCustomers,
} from '@customer';
import { useManagementRefresh } from '@veaiops/hooks';
import type { TableDataSource } from '@veaiops/types';
import {
  createServerPaginationDataSource,
  createTableRequestWithResponseHandler,
  logger,
} from '@veaiops/utils';
import type { Customer } from 'api-generate';
import { useCallback, useMemo, useState } from 'react';

/**
 * Customer management business logic Hook
 * Provides complete customer management functionality - following standard model management pattern
 */
export const useCustomerManagementLogic = (
  refreshTable?: () =>
    | Promise<boolean>
    | Promise<{ success: boolean; error?: Error }>,
) => {
  // Use management refresh Hook (only for import operations)
  // ✅ Note: Delete operation refresh is automatically handled by useBusinessTable, no need for afterDelete
  // Adapt refreshTable return type (may be boolean or result object)
  const refreshFn = refreshTable
    ? async () => {
        const result = await refreshTable();
        // If result object is returned, ignore it (useManagementRefresh expects void)
        // Result object will be handled internally by useManagementRefresh
      }
    : undefined;
  const { afterImport } = useManagementRefresh(refreshFn);

  // State management
  const [importDrawerVisible, setImportDrawerVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Delete customer
  // ✅ Note: Refresh after deletion is automatically handled by useBusinessTable, no need to manually call afterDelete
  const handleDelete = useCallback(
    async (customerId: string): Promise<boolean> => {
      try {
        const result = await deleteCustomer(customerId);
        if (result.success) {
          Message.success('客户删除成功');
          // ✅ Refresh is automatically handled by useBusinessTable, no need to manually refresh
          return true;
        } else {
          // Error handling: expose error information
          const errorMessage =
            result.error instanceof Error
              ? result.error.message
              : '删除失败，请重试';
          Message.error(errorMessage);
          return false;
        }
      } catch (error) {
        // Error handling: expose error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || '删除失败，请重试';
        Message.error(errorMessage);
        return false;
      }
    },
    [],
  );

  // Import customer
  const handleImport = useCallback(
    async (file: File): Promise<boolean> => {
      try {
        setUploading(true);
        const result = await importCustomers(file);

        if (result) {
          Message.success('客户导入成功');
          setImportDrawerVisible(false);

          // Refresh table after successful import
          const refreshResult = await afterImport();
          if (!refreshResult.success && refreshResult.error) {
            logger.warn({
              message: '导入后刷新表格失败',
              data: {
                error: refreshResult.error.message,
                stack: refreshResult.error.stack,
                errorObj: refreshResult.error,
              },
              source: 'CustomerManagement',
              component: 'handleImport',
            });
          }
          return true;
        } else {
          Message.error('导入失败，请重试');
          return false;
        }
      } catch (error) {
        // ✅ Correct: expose actual error information
        const errorMessage =
          error instanceof Error ? error.message : '导入失败，请重试';
        Message.error(errorMessage);
        return false;
      } finally {
        setUploading(false);
      }
    },
    [afterImport],
  );

  // Open import drawer
  const handleOpenImportDrawer = useCallback(() => {
    setImportDrawerVisible(true);
  }, []);

  // Close import drawer
  const handleCloseImportDrawer = useCallback(() => {
    setImportDrawerVisible(false);
  }, []);

  return {
    // State
    importDrawerVisible,
    uploading,

    // Event handlers
    handleDelete,
    handleImport,
    handleOpenImportDrawer,
    handleCloseImportDrawer,
  };
};

/**
 * Customer table configuration Hook
 * Provides configuration required by CustomTable
 */
export const useCustomerTableConfig = (): {
  dataSource: TableDataSource<Customer>;
} => {
  // 🎯 Use utility function to create request function
  const request = useMemo(
    () =>
      createTableRequestWithResponseHandler({
        apiCall: async ({ skip, limit, name }) => {
          const response =
            await apiClient.customers.getApisV1ManagerSystemConfigCustomers({
              skip,
              limit,
              name: name as string | undefined,
            });
          // API response conforms to StandardApiResponse format, perform type assertion
          return response as unknown as {
            code: number;
            data?: Customer[];
            total?: number;
            message?: string;
          };
        },
        options: {
          errorMessagePrefix: '获取客户列表失败',
          defaultLimit: 20,
        },
      }),
    [],
  );

  // 🎯 Use utility function to create data source
  const dataSource = useMemo(
    () => createServerPaginationDataSource({ request }),
    [request],
  );

  return {
    dataSource,
  };
};

/**
 * Customer action configuration Hook
 * Provides table action button configuration
 */
export const useCustomerActionConfig = () => {
  return {
    // Can dynamically configure action buttons based on customer status
    getAvailableActions: (customer: CustomerTableData) => {
      const actions = [];

      // Edit operation
      if (customer.is_active !== false) {
        actions.push('edit');
      }

      // Delete operation
      if (customer.is_active !== true) {
        actions.push('delete');
      }

      // View details
      actions.push('view');

      return actions;
    },
  };
};
