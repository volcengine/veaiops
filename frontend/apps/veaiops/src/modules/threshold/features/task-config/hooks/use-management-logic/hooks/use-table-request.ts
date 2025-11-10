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

import { taskDataSource } from '@task-config/lib';
import {
  type CustomTableParams,
  type TableDataResponse,
  logger,
} from '@veaiops/utils';
import type {
  IntelligentThresholdTask,
  PaginatedAPIResponseIntelligentThresholdTask,
} from 'api-generate';
import { useMemo } from 'react';

/**
 * Table request logic Hook
 */
export const useTableRequest = () => {
  // 🎯 Data request logic
  // Note: Use CustomTableParams type to match createServerPaginationDataSource expectations
  const request = useMemo(
    () =>
      async (
        params: CustomTableParams,
      ): Promise<TableDataResponse<IntelligentThresholdTask>> => {
        try {
          // Transform to TaskQueryParams format
          const queryParams = {
            ...params,
            page_req: {
              skip: (params.skip as number) || 0,
              limit: (params.limit as number) || 20,
            },
            datasource_type: params.datasource_type,
            task_name: params.task_name,
            auto_update: params.auto_update,
            created_at_start: params.created_at_start,
            created_at_end: params.created_at_end,
            updated_at_start: params.updated_at_start,
            updated_at_end: params.updated_at_end,
          };

          const result: PaginatedAPIResponseIntelligentThresholdTask =
            await taskDataSource.request(
              queryParams as Record<string, unknown>,
            );
          return {
            data: result.data || [],
            total: result.total || 0,
            success: true,
          };
        } catch (error: unknown) {
          // ✅ Correct: use logger to record error and expose actual error information
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          logger.error({
            message: 'Failed to fetch task list',
            data: {
              error: errorObj.message,
              stack: errorObj.stack,
              errorObj,
            },
            source: 'useManagementLogic',
            component: 'request',
          });
          return { data: [], total: 0, success: false };
        }
      },
    [],
  );

  return { request };
};
