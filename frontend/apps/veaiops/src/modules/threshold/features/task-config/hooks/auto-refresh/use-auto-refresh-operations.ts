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

import { logger } from '@veaiops/utils';
import { useMemo } from 'react';
import {
  type AutoRefreshOperations,
  type UseAutoRefreshOperationsParams,
  createCreateOperation,
  createDeleteOperation,
  createUpdateOperation,
} from './lib';

/**
 * Hook for creating auto-refresh CRUD operations
 *
 * This Hook provides a generic way to wrap CRUD operations so they automatically trigger table refresh after successful execution.
 * Suitable for any async operation scenario that requires automatic table refresh.
 *
 * ## Core Features
 *
 * ✅ **Auto-refresh**: Automatically triggers table refresh after successful operation, no manual call needed
 * ✅ **Error handling**: Unified error handling and logging
 * ✅ **Type safety**: Full TypeScript type support
 * ✅ **Flexible configuration**: Supports optional API function configuration
 * ✅ **Generality**: Can be used for CRUD operations in any table component
 *
 * ## Basic Usage
 *
 * ```typescript
 * import { useAutoRefreshOperations } from '@/modules/threshold/features/task-config/hooks';
 *
 * const MyComponent = () => {
 *   const tableRef = useRef<TaskTableRef>(null);
 *
 *   // Get refresh function
 *   const refreshTable = useCallback(async () => {
 *     await tableRef.current?.refresh();
 *   }, []);
 *
 *   // Create auto-refresh operations
 *   const operations = useAutoRefreshOperations({
 *     refreshFn: refreshTable, // Refresh function
 *     deleteApi: async (id) => await deleteApi(id), // Delete API
 *     updateApi: async () => await batchUpdateApi(), // Update API
 *     createApi: async (data) => await createApi(data), // Create API (optional)
 *   });
 *
 *   // Use operations
 *   const handleDelete = async (id: string) => {
 *     try {
 *       const success = await operations.delete(id);
 *       if (success) {
 *         // Delete successful, table has been auto-refreshed (handled by hook)
 *       }
 *     } catch (error) {
 *       // Error already handled by hook, only need to handle UI feedback here
 *       message.error('Delete failed');
 *     }
 *   };
 *
 *   return <TaskTable ref={tableRef} onDelete={handleDelete} />;
 * };
 * ```
 *
 * @param params - Parameter object
 * @param params.refreshFn - Table refresh function, supports returning Promise<void> or Promise<{ success: boolean; error?: Error }>
 * @param params.deleteApi - Delete API function, receives id parameter, returns boolean indicating success
 * @param params.updateApi - Update API function, used for batch operations, etc., returns void
 * @param params.createApi - Create API function, receives data parameter (optional)
 * @returns Auto-refresh CRUD operations object
 */
export const useAutoRefreshOperations = ({
  refreshFn,
  deleteApi,
  updateApi,
  createApi,
}: UseAutoRefreshOperationsParams): AutoRefreshOperations => {
  return useMemo(
    () => ({
      /**
       * Delete operation - Automatically refreshes table after successful execution
       * @param id - ID of the record to delete
       * @returns Whether deletion was successful
       */
      delete: deleteApi
        ? createDeleteOperation(deleteApi, refreshFn)
        : async (id: string): Promise<boolean> => {
            // ✅ Correct: Use logger to record warning
            logger.warn({
              message: 'useAutoRefreshOperations: deleteApi not provided',
              data: { id },
              source: 'AutoRefreshOperations',
              component: 'delete',
            });
            return false;
          },

      /**
       * Update operation - Automatically refreshes table after successful execution
       * Suitable for batch updates, status changes, etc.
       *
       * @returns Returns result object in format { success: boolean; error?: Error }
       */
      update: updateApi
        ? createUpdateOperation(updateApi, refreshFn)
        : async (): Promise<{ success: boolean; error?: Error }> => {
            // ✅ Correct: Use logger to record warning
            logger.warn({
              message: 'useAutoRefreshOperations: updateApi not provided',
              data: undefined,
              source: 'AutoRefreshOperations',
              component: 'update',
            });
            return {
              success: false,
              error: new Error('updateApi not provided'),
            };
          },

      /**
       * Create operation - Automatically refreshes table after successful execution (optional)
       *
       * @param data - Data to create
       * @returns Returns result object in format { success: boolean; error?: Error }
       */
      create: createApi
        ? createCreateOperation(createApi, refreshFn)
        : undefined,
    }),
    [refreshFn, deleteApi, updateApi, createApi],
  );
};
