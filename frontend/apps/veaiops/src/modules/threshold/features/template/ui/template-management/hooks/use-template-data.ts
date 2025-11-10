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
import { useApi } from '@veaiops/hooks';
import type { MetricTemplate } from 'api-generate';

/**
 * Template data fetching Hook
 */
export const useTemplateData = () => {
  // Use API Hook to fetch template list
  const {
    data: templates,
    loading,
    execute: fetchTemplates,
  } = useApi({
    apiCall: async () => {
      const response =
        await apiClient.metricTemplate.getApisV1DatasourceTemplate({
          skip: 0,
          limit: 100,
        });

      // Directly return API data, types are automatically matched
      return response.data || [];
    },
    options: { immediate: true },
  });

  return {
    templates: templates as MetricTemplate[] | undefined,
    loading,
    fetchTemplates,
  };
};
