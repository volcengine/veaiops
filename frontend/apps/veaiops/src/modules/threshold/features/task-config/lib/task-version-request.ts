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

import { createTableRequestWrapper } from "@veaiops/utils";
import type { IntelligentThresholdTaskStatus } from "api-generate";
import apiClient from "@/utils/api-client";

/**
 * Task version list API call function
 * @param params - Object containing pagination and filter parameters
 */
const fetchTaskVersionList = async (params: Record<string, any>) => {
  // Extract query conditions from parameters
  const { skip, limit, task_id, sort_columns, ...otherParams } = params;

  // Build API request parameters, ensure parameter names align with interface
  const apiParams = {
    taskId: task_id as string,
    skip: skip || 0,
    limit: limit || 100,
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

  const response =
    await apiClient.intelligentThresholdTask.getApisV1IntelligentThresholdTaskVersions(
      apiParams
    );

  return {
    data: response.data || [],
    total: response.data?.length || 0,
    success: true,
  };
};

/**
 * Create task version table request wrapper
 */
export const createTaskVersionTableRequestWrapper = (taskId?: string) => {
  const wrappedRequest = createTableRequestWrapper({
    apiCall: fetchTaskVersionList,
    defaultLimit: 20,
  });

  return async (params: Record<string, any>) => {
    if (!taskId) {
      return { data: [], total: 0, success: true };
    }

    return wrappedRequest({
      ...params,
      task_id: taskId,
    });
  };
};
