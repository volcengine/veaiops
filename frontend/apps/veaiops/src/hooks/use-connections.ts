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

/**
 * Connection management Hook
 */

import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import { API_RESPONSE_CODE, PAGINATION } from '@veaiops/constants';
import type { Connect, DataSourceType } from 'api-generate';
import { useCallback, useState } from 'react';
import type {
  ConnectCreateRequest,
  ConnectUpdateRequest,
} from '../modules/system/features/datasource/connection/lib/types';

interface ConnectionState {
  connections: Connect[];
  loading: boolean;
  error: string | null;
}

export interface UpdateConnectionParams {
  id: string;
  data: ConnectUpdateRequest;
}

export interface BatchToggleStatusParams {
  ids: string[];
  active: boolean;
}

interface UseConnectionsReturn extends ConnectionState {
  refresh: () => Promise<{ success: boolean; error?: Error }>;
  create: (data: ConnectCreateRequest) => Promise<Connect>;
  update: (params: UpdateConnectionParams) => Promise<Connect>;
  delete: (id: string) => Promise<boolean>;
  batchToggleStatus: (
    params: BatchToggleStatusParams,
  ) => Promise<{ success: boolean; error?: Error; results?: Connect[] }>;
}

export const useConnections = (type: DataSourceType): UseConnectionsReturn => {
  const [state, setState] = useState<ConnectionState>({
    connections: [],
    loading: false,
    error: null,
  });

  // Refresh connection list
  const refresh = useCallback(async (): Promise<{
    success: boolean;
    error?: Error;
  }> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response =
        await apiClient.dataSourceConnect.getApisV1DatasourceConnect({
          limit: PAGINATION.DEFAULT_LIMIT,
          skip: PAGINATION.DEFAULT_SKIP,
        });

      if (response.code === API_RESPONSE_CODE.SUCCESS) {
        // Temporary solution: still use frontend filtering until API is regenerated
        const allConnections = response.data || [];
        const filteredConnections = allConnections
          .filter((connect: Connect) => connect.type === type)
          // Filter out connections without ID to prevent subsequent operation failures
          .filter((connect: Connect) => {
            if (!connect.id && !connect._id) {
              return false;
            }
            return true;
          });

        setState((prev) => ({
          ...prev,
          connections: filteredConnections,
          loading: false,
        }));

        return { success: true };
        } else {
          throw new Error(response.message || '获取连接列表失败');
        }
    } catch (error: unknown) {
      // ✅ Correct: Expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = errorObj.message;

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));

      Message.error(errorMessage);

      return { success: false, error: errorObj };
    }
  }, [type]);

  // Create connection
  const create = useCallback(
    async (data: ConnectCreateRequest): Promise<Connect> => {
      try {
        const response =
          await apiClient.dataSourceConnect.postApisV1DatasourceConnect({
            requestBody: { ...data, type },
          });

        if (response.code === API_RESPONSE_CODE.SUCCESS) {
          // Refresh connection list (errors are handled in refresh)
          await refresh();
          return response.data!;
        } else {
          throw new Error(response.message || '创建连接失败');
        }
      } catch (error) {
        // Enhance error information to help upper components make better decisions
        if (error instanceof Error) {
          const enhancedError = new Error(error.message);
          enhancedError.name = error.name;
          enhancedError.stack = error.stack;
          // Add custom properties to help upper components determine error type
          (enhancedError as any).originalError = error;
          (enhancedError as any).context = {
            operation: 'create_connection',
            type,
            timestamp: Date.now(),
          };
          throw enhancedError;
        }

        // ✅ Correct: Convert error to Error object before throwing (complies with @typescript-eslint/only-throw-error rule)
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        throw errorObj;
      }
    },
    [type, refresh],
  );

  // Update connection
  const update = useCallback(
    async ({
      id,
      data,
    }: { id: string; data: ConnectUpdateRequest }): Promise<Connect> => {
      try {
        const response =
          await apiClient.dataSourceConnect.putApisV1DatasourceConnect({
            connectId: id,
            requestBody: data,
          });

        if (response.code === API_RESPONSE_CODE.SUCCESS) {
          // Refresh connection list (errors are handled in refresh)
          await refresh();
          return response.data!;
        } else {
          throw new Error(response.message || '更新连接失败');
        }
      } catch (error) {
        // Enhance error information to help upper components make better decisions
        if (error instanceof Error) {
          // Preserve original error information but add more context
          const enhancedError = new Error(error.message);
          enhancedError.name = error.name;
          enhancedError.stack = error.stack;
          // Add custom properties to help upper components determine error type
          (enhancedError as any).originalError = error;
          (enhancedError as any).context = {
            operation: 'update_connection',
            connectId: id,
            timestamp: Date.now(),
          };
          throw enhancedError;
        }

        // ✅ Correct: Convert error to Error object before throwing (complies with @typescript-eslint/only-throw-error rule)
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        throw errorObj;
      }
    },
    [refresh],
  );

  // Delete connection
  const deleteConnect = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response =
          await apiClient.dataSourceConnect.deleteApisV1DatasourceConnect({
            connectId: id,
          });

        if (response.code === API_RESPONSE_CODE.SUCCESS) {
          // Refresh connection list (errors are handled in refresh)
          await refresh();
          return true;
        } else {
          throw new Error(response.message || '删除连接失败');
        }
      } catch (error) {
        // Enhance error information to help upper components make better decisions
        if (error instanceof Error) {
          const enhancedError = new Error(error.message);
          enhancedError.name = error.name;
          enhancedError.stack = error.stack;
          // Add custom properties to help upper components determine error type
          (enhancedError as any).originalError = error;
          (enhancedError as any).context = {
            operation: 'delete_connection',
            connectId: id,
            timestamp: Date.now(),
          };
          throw enhancedError;
        }

        // ✅ Correct: Convert error to Error object before throwing (complies with @typescript-eslint/only-throw-error rule)
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        throw errorObj;
      }
    },
    [refresh],
  );

  // Batch toggle status
  const batchToggleStatus = useCallback(
    async ({
      ids,
      active,
    }: BatchToggleStatusParams): Promise<{
      success: boolean;
      error?: Error;
      results?: Connect[];
    }> => {
      try {
        const promises = ids.map((id) =>
          update({ id, data: { is_active: active } }),
        );
        const results = await Promise.all(promises);
        return { success: true, results };
      } catch (error: unknown) {
        // ✅ Correct: Expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        // ✅ Correct: Expose actual error information
        const errorMessage =
          error instanceof Error ? error.message : '批量切换状态失败，请重试';
        Message.error(errorMessage);
        return { success: false, error: errorObj };
      }
    },
    [update],
  );

  return {
    ...state,
    refresh,
    create,
    update,
    delete: deleteConnect,
    batchToggleStatus,
  };
};
