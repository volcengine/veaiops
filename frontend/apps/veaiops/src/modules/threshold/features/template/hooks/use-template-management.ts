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

import { Message } from '@arco-design/web-react';
import { useEffect, useState } from 'react';

import apiClient from '@/utils/api-client';
import type {
  MetricTemplate,
  MetricTemplateCreateRequest,
  MetricTemplateUpdateRequest,
  MetricType,
} from 'api-generate';
import type { TemplateFormData, ThresholdTemplate } from '../types/template';

export const useTemplateManagement = () => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ThresholdTemplate[]>([]);

  // Fetch template list
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response =
        await apiClient.metricTemplate.getApisV1DatasourceTemplate({
          skip: 0,
          limit: 100,
        });

      // Convert API returned data to frontend required format
      const templatesData: ThresholdTemplate[] = (
        (response.data as MetricTemplate[]) || []
      ).map((template: MetricTemplate, index: number) => ({
        ...template,
        template_id: template._id || `template_${index}`,
        template_name: template.name || '未命名模板',
        description: template.name || '暂无描述',
        usage_count: Math.floor(Math.random() * 50) + 1, // Simulate usage count
        status: 'active' as const, // Simulated data
      }));

      setTemplates(templatesData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '获取模板列表失败';
      Message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Create template
  const createTemplate = async (data: TemplateFormData) => {
    const templateData: MetricTemplateCreateRequest = {
      name: data.template_name,
      metric_type: data.metric_type as unknown as MetricType,
      min_step: data.min_step ?? 0,
      max_value: data.max_value ?? 0,
      min_value: data.min_value ?? 0,
      min_violation: data.min_violation ?? 0,
      min_violation_ratio: data.min_violation_ratio ?? 0,
      normal_range_start: data.normal_range_start ?? 0,
      normal_range_end: data.normal_range_end ?? 0,
      missing_value: data.missing_value || null,
      failure_interval_expectation: data.failure_interval_expectation ?? 0,
      display_unit: data.display_unit ?? '',
      linear_scale: data.linear_scale ?? 1,
      max_time_gap: data.max_time_gap ?? 0,
      min_ts_length: data.min_ts_length ?? 0,
    };

    await apiClient.metricTemplate.postApisV1DatasourceTemplate({
      requestBody: templateData,
    });
  };

  /**
   * updateTemplate parameters interface
   */
  interface UpdateTemplateParams {
    templateId: string;
    data: TemplateFormData;
  }

  // Update template
  const updateTemplate = async ({ templateId, data }: UpdateTemplateParams) => {
    const templateData: MetricTemplateUpdateRequest = {
      name: data.template_name,
      metric_type: data.metric_type as unknown as MetricType,
      min_step: data.min_step ?? 0,
      max_value: data.max_value ?? 0,
      min_value: data.min_value ?? 0,
      min_violation: data.min_violation ?? 0,
      min_violation_ratio: data.min_violation_ratio ?? 0,
      normal_range_start: data.normal_range_start ?? 0,
      normal_range_end: data.normal_range_end ?? 0,
      missing_value: data.missing_value || null,
      failure_interval_expectation: data.failure_interval_expectation ?? 0,
      display_unit: data.display_unit ?? '',
      linear_scale: data.linear_scale ?? 1,
      max_time_gap: data.max_time_gap ?? 0,
      min_ts_length: data.min_ts_length ?? 0,
    };

    await apiClient.metricTemplate.putApisV1DatasourceTemplate({
      uid: templateId,
      requestBody: templateData,
    });
  };

  // Clone template
  const cloneTemplate = async (template: ThresholdTemplate) => {
    const cloneData = {
      name: `${template.template_name} - 副本`,
      metric_type: template.metric_type as unknown as MetricType,
      min_step: template.min_step ?? 0,
      max_value: template.max_value ?? 0,
      min_value: template.min_value ?? 0,
      min_violation: template.min_violation ?? 0,
      min_violation_ratio: template.min_violation_ratio ?? 0,
      normal_range_start: template.normal_range_start ?? 0,
      normal_range_end: template.normal_range_end ?? 0,
      missing_value: template.missing_value ?? null,
      failure_interval_expectation: template.failure_interval_expectation ?? 0,
      display_unit: template.display_unit ?? '',
      linear_scale: template.linear_scale ?? 1,
      max_time_gap: template.max_time_gap ?? 0,
      min_ts_length: template.min_ts_length ?? 0,
    };

    await apiClient.metricTemplate.postApisV1DatasourceTemplate({
      requestBody: cloneData,
    });
  };

  // Delete template
  const deleteTemplate = async (templateId: string) => {
    await apiClient.metricTemplate.deleteApisV1DatasourceTemplate({
      uid: templateId,
    });
  };

  return {
    loading,
    templates,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    cloneTemplate,
    deleteTemplate,
  };
};
