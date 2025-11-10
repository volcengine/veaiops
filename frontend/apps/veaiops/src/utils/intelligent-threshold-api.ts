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
import { API_RESPONSE_CODE } from '@veaiops/constants';
import type {
  APIResponse,
  APIResponseIntelligentThresholdTask,
  APIResponseMetricTemplate,
  MetricTemplateCreateRequest,
  MetricTemplateUpdateRequest,
  PaginatedAPIResponseMetricTemplateList,
} from 'api-generate';
import apiClient from './api-client';

/**
 * Parameters interface for updating metric template
 */
interface UpdateTemplateParams {
  templateId: string;
  request: MetricTemplateUpdateRequest;
}

/**
 * Intelligent threshold task management API
 */
export const IntelligentThresholdTaskAPI = {
  /**
   * Create intelligent threshold task
   */
  async createTask(request: any): Promise<APIResponseIntelligentThresholdTask> {
    try {
      const response =
        await apiClient.intelligentThresholdTask.postApisV1IntelligentThresholdTask(
          {
            requestBody: request,
          },
        );

      if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
        Message.success('智能阈值任务创建成功');
        return response;
      } else {
        throw new Error(response.message || '创建智能阈值任务失败');
      }
    } catch (error) {
      // ✅ Correct: Expose actual error information
      const errorMessage =
        error instanceof Error ? error.message : '创建智能阈值任务失败';

      Message.error(errorMessage);
      // ✅ Correct: Convert error to Error object before throwing (complies with @typescript-eslint/only-throw-error rule)
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      throw errorObj;
    }
  },
} as const;

/**
 * Metric template management API
 */
export const MetricTemplateAPI = {
  /**
   * Get metric template list
   */
  async listTemplates(params?: {
    skip?: number;
    limit?: number;
    name?: string;
  }): Promise<PaginatedAPIResponseMetricTemplateList> {
    try {
      const response =
        await apiClient.metricTemplate.getApisV1DatasourceTemplate({
          skip: params?.skip || 0,
          limit: params?.limit || 100,
        });

      if (response.code === API_RESPONSE_CODE.SUCCESS) {
        return response;
      } else {
        throw new Error(response.message || '获取指标模板列表失败');
      }
    } catch (error) {
      // ✅ Correct: Expose actual error information
      const errorMessage =
        error instanceof Error ? error.message : '获取指标模板列表失败';

      Message.error(errorMessage);
      // ✅ Correct: Convert error to Error object before throwing (complies with @typescript-eslint/only-throw-error rule)
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      throw errorObj;
    }
  },

  /**
   * Create metric template
   */
  async createTemplate(
    request: MetricTemplateCreateRequest,
  ): Promise<APIResponseMetricTemplate> {
    try {
      const response =
        await apiClient.metricTemplate.postApisV1DatasourceTemplate({
          requestBody: request,
        });

      if (response.code === API_RESPONSE_CODE.SUCCESS) {
        Message.success('指标模板创建成功');
        return response as APIResponseMetricTemplate;
      } else {
        throw new Error(response.message || '创建指标模板失败');
      }
    } catch (error) {
      // ✅ Correct: Expose actual error information
      const errorMessage =
        error instanceof Error ? error.message : '创建指标模板失败';

      Message.error(errorMessage);
      // ✅ Correct: Convert error to Error object before throwing (complies with @typescript-eslint/only-throw-error rule)
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      throw errorObj;
    }
  },

  /**
   * Get metric template details
   */
  async getTemplate(templateId: string): Promise<APIResponseMetricTemplate> {
    try {
      const response =
        await apiClient.metricTemplate.getApisV1DatasourceTemplate1({
          uid: templateId,
        });

      if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
        return response;
      } else {
        throw new Error(response.message || '获取指标模板详情失败');
      }
    } catch (error) {
      // ✅ Correct: Expose actual error information
      const errorMessage =
        error instanceof Error ? error.message : '获取指标模板详情失败';

      Message.error(errorMessage);
      // ✅ Correct: Convert error to Error object before throwing (complies with @typescript-eslint/only-throw-error rule)
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      throw errorObj;
    }
  },

  /**
   * Update metric template
   */
  async updateTemplate({
    templateId,
    request,
  }: UpdateTemplateParams): Promise<APIResponseMetricTemplate> {
    try {
      const response =
        await apiClient.metricTemplate.putApisV1DatasourceTemplate({
          uid: templateId,
          requestBody: request,
        });

      if (response.code === API_RESPONSE_CODE.SUCCESS) {
        Message.success('指标模板更新成功');
        return response as APIResponseMetricTemplate;
      } else {
        throw new Error(response.message || '更新指标模板失败');
      }
    } catch (error) {
      // ✅ Correct: Expose actual error information
      const errorMessage =
        error instanceof Error ? error.message : '更新指标模板失败';

      Message.error(errorMessage);
      // ✅ Correct: Convert error to Error object before throwing (complies with @typescript-eslint/only-throw-error rule)
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      throw errorObj;
    }
  },

  /**
   * Delete metric template
   */
  async deleteTemplate(templateId: string): Promise<APIResponse> {
    try {
      const response =
        await apiClient.metricTemplate.deleteApisV1DatasourceTemplate({
          uid: templateId,
        });

      if (response.code === API_RESPONSE_CODE.SUCCESS) {
        Message.success('指标模板删除成功');
        return response;
      } else {
        throw new Error(response.message || '删除指标模板失败');
      }
    } catch (error) {
      // ✅ Correct: Expose actual error information
      const errorMessage =
        error instanceof Error ? error.message : '删除指标模板失败';

      Message.error(errorMessage);
      // ✅ Correct: Convert error to Error object before throwing (complies with @typescript-eslint/only-throw-error rule)
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      throw errorObj;
    }
  },
} as const;
