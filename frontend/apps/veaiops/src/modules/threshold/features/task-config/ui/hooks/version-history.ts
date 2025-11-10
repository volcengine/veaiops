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
import type { IntelligentThresholdTaskVersion } from 'api-generate';
import { useEffect, useState } from 'react';
import type { TaskVersionFiltersQuery } from '../version/filters';

/**
 * Version history management Hook
 */
export const useVersionHistory = (
  taskId: string | undefined,
  shouldFetch: boolean,
  filters?: TaskVersionFiltersQuery,
) => {
  const [versions, setVersions] = useState<IntelligentThresholdTaskVersion[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  /**
   * Fetch task version history
   */
  const fetchVersionHistory = async (
    id: string,
    filterParams?: TaskVersionFiltersQuery,
  ) => {
    try {
      setLoading(true);

      // Build API request parameters
      const apiParams: Record<string, any> = {
        taskId: id,
        skip: 0,
        limit: 50,
      };

      // Add filter parameters
      if (filterParams?.status) {
        apiParams.status = filterParams.status;
      }
      if (filterParams?.createdAtStart) {
        apiParams.createdAtStart = filterParams.createdAtStart;
      }
      if (filterParams?.createdAtEnd) {
        apiParams.createdAtEnd = filterParams.createdAtEnd;
      }
      if (filterParams?.updatedAtStart) {
        apiParams.updatedAtStart = filterParams.updatedAtStart;
      }
      if (filterParams?.updatedAtEnd) {
        apiParams.updatedAtEnd = filterParams.updatedAtEnd;
      }

      const response =
        await apiClient.intelligentThresholdTask.getApisV1IntelligentThresholdTaskVersions(
          apiParams as any, // Type conversion to match API interface
        );

      if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
        setVersions(response.data);
      } else {
        setVersions([]);
      }
    } catch (error) {
      // Silent handling: clear list when fetching version history fails
      setVersions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldFetch && taskId) {
      fetchVersionHistory(taskId, filters);
    }
  }, [taskId, shouldFetch, filters]);

  return {
    versions,
    loading,
    refetch: taskId ? () => fetchVersionHistory(taskId, filters) : undefined,
  };
};
