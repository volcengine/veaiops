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

import { createTableRequestWrapper, logger } from "@veaiops/utils";
import type { IntelligentThresholdTaskStatus } from "api-generate";
import apiClient from "@/utils/api-client";

/**
 * Task version list API call function
 * @param params - Object containing pagination and filter parameters
 */
const fetchTaskVersionList = async (params: Record<string, any>) => {
  // Extract query conditions from parameters
  const { skip, limit, task_id, sort_columns, ...otherParams } = params;

  // Log request start
  logger.info({
    message: '[fetchTaskVersionList] Starting to fetch task versions',
    data: {
      taskId: task_id,
      skip: skip || 0,
      limit: limit ?? 50,
      hasStatus: Boolean(otherParams.status),
      hasCreatedAtRange: Boolean(
        otherParams.createdAtStart && otherParams.createdAtEnd,
      ),
      hasUpdatedAtRange: Boolean(
        otherParams.updatedAtStart && otherParams.updatedAtEnd,
      ),
      sortColumns: sort_columns,
    },
    source: 'TaskVersionRequest',
    component: 'fetchTaskVersionList',
  });

  const apiParams = {
    taskId: task_id as string,
    skip: skip || 0,
      limit: limit ?? 50, // ✅ Use 50 to match pageSize, not 100
    ...(otherParams.status && {
      status: otherParams.status as IntelligentThresholdTaskStatus,
    }),
    ...(otherParams.createdAtStart && {
      createdAtStart: otherParams.createdAtStart as string,
    }),
    ...(otherParams.createdAtEnd && {
      createdAtEnd: otherParams.createdAtEnd as string,
    }),
    ...(otherParams.updatedAtStart && {
      updatedAtStart: otherParams.updatedAtStart as string,
    }),
    ...(otherParams.updatedAtEnd && {
      updatedAtEnd: otherParams.updatedAtEnd as string,
    }),
  };

  try {
    const response =
      await apiClient.intelligentThresholdTask.getApisV1IntelligentThresholdTaskVersions(
        apiParams,
      );

    // Log successful response
    logger.info({
      message: '[fetchTaskVersionList] Successfully fetched task versions',
      data: {
        taskId: task_id,
        skip: apiParams.skip,
        limit: apiParams.limit,
        responseCode: response.code,
        dataCount: response.data?.length || 0,
        total: response.total || 0,
      },
      source: 'TaskVersionRequest',
      component: 'fetchTaskVersionList',
    });

    // ✅ Use response.total as the authoritative total count (from backend pagination)
    // Don't use response.data.length as fallback, as it only represents current page data
    return {
      data: response.data || [],
      total: response.total ?? 0,
      success: true,
    };
  } catch (error: unknown) {
    // Log error with full context
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: '[fetchTaskVersionList] Failed to fetch task versions',
      data: {
        taskId: task_id,
        skip: apiParams.skip,
        limit: apiParams.limit,
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
        apiParams,
      },
      source: 'TaskVersionRequest',
      component: 'fetchTaskVersionList',
    });

    // Re-throw error to be handled by caller
    throw error;
  }
};

/**
 * Create task version table request wrapper
 */
export const createTaskVersionTableRequestWrapper = (taskId?: string) => {
  // Log wrapper creation
  logger.info({
    message: '[createTaskVersionTableRequestWrapper] Creating request wrapper',
    data: {
      taskId,
      hasTaskId: Boolean(taskId),
      defaultLimit: 50,
    },
    source: 'TaskVersionRequest',
    component: 'createTaskVersionTableRequestWrapper',
  });

  const wrappedRequest = createTableRequestWrapper({
    apiCall: fetchTaskVersionList,
    defaultLimit: 50,
  });

  return async (params: Record<string, any>) => {
    // Log request invocation
    logger.debug({
      message: '[createTaskVersionTableRequestWrapper] Request invoked',
      data: {
        taskId,
        hasTaskId: Boolean(taskId),
        paramsKeys: Object.keys(params),
        pageReq: (params as { page_req?: { skip?: number; limit?: number } })
          .page_req,
      },
      source: 'TaskVersionRequest',
      component: 'createTaskVersionTableRequestWrapper',
    });

    if (!taskId) {
      logger.warn({
        message:
          '[createTaskVersionTableRequestWrapper] No taskId provided, returning empty data',
        data: {
          paramsKeys: Object.keys(params),
        },
        source: 'TaskVersionRequest',
        component: 'createTaskVersionTableRequestWrapper',
      });
      return { data: [], total: 0, success: true };
    }

    return wrappedRequest({
      ...params,
      task_id: taskId,
    });
  };
};
