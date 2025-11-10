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
import type { MetricTemplate } from 'api-generate';
import { useCallback } from 'react';

interface UseTemplateActionsParams {
  fetchTemplates: () => void;
}

/**
 * Template operation handler Hook
 */
export const useTemplateActions = ({
  fetchTemplates,
}: UseTemplateActionsParams) => {
  // Clone template
  const handleCloneTemplate = useCallback(
    async (template: MetricTemplate) => {
      try {
        await apiClient.metricTemplate.postApisV1DatasourceTemplate({
          requestBody: {
            name: `${template.name} - 副本`,
            metric_type: template.metric_type,
            min_step: template.min_step,
            max_value: template.max_value,
            min_value: template.min_value,
            min_violation: template.min_violation,
            min_violation_ratio: template.min_violation_ratio,
            normal_range_start: template.normal_range_start,
            normal_range_end: template.normal_range_end,
            missing_value: template.missing_value,
            failure_interval_expectation: template.failure_interval_expectation,
            display_unit: template.display_unit,
            linear_scale: template.linear_scale,
            max_time_gap: template.max_time_gap,
            min_ts_length: template.min_ts_length,
          },
        });
        Message.success('模板克隆成功');
        fetchTemplates();
      } catch (error: unknown) {
        // ✅ Correct: expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || '模板克隆失败';
        Message.error(errorMessage);
      }
    },
    [fetchTemplates],
  );

  // Delete template
  const handleDeleteTemplate = useCallback(
    async (templateId: string) => {
      try {
        await apiClient.metricTemplate.deleteApisV1DatasourceTemplate({
          uid: templateId,
        });
        Message.success('模板删除成功');
        fetchTemplates();
      } catch (error: unknown) {
        // ✅ Correct: expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || '模板删除失败';
        Message.error(errorMessage);
      }
    },
    [fetchTemplates],
  );

  return {
    handleCloneTemplate,
    handleDeleteTemplate,
  };
};
