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
import { useCallback } from 'react';
import { metricTemplateApi } from '../lib/api-service';
import type {
  MetricTemplateCreateRequest,
  MetricTemplateUpdateRequest,
} from '../lib/types';

/**
 * Metric template CRUD operations Hook
 * Provides API call logic for creating, updating, and deleting metric templates
 */
export const useMetricTemplateCrud = () => {
  /**
   * Create metric template
   */
  const createTemplate = useCallback(
    async (data: MetricTemplateCreateRequest) => {
      try {
        const response = await metricTemplateApi.create(data);

        if (response.code === API_RESPONSE_CODE.SUCCESS) {
          Message.success('创建指标模板成功');
          return true;
        } else {
          throw new Error(response.message || 'Failed to create');
        }
      } catch (error) {
        // ✅ Correct: Expose actual error information
        const errorMessage =
          error instanceof Error ? error.message : '创建指标模板失败，请重试';
        Message.error(errorMessage);
        // ✅ Correct: Convert error to Error object before throwing (conforms to @typescript-eslint/only-throw-error rule)
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        throw errorObj;
      }
    },
    [],
  );

  /**
   * Update metric template
   */
  interface UpdateTemplateParams {
    templateId: string;
    data: MetricTemplateUpdateRequest;
  }

  const updateTemplate = useCallback(
    async ({ templateId, data }: UpdateTemplateParams) => {
      try {
        const response = await metricTemplateApi.update({
          uid: templateId,
          data,
        });
        if (response.code === API_RESPONSE_CODE.SUCCESS) {
          Message.success('更新指标模板成功');
          return true;
        } else {
          throw new Error(response.message || 'Failed to update');
        }
      } catch (error) {
        // ✅ Correct: Expose actual error information
        const errorMessage =
          error instanceof Error ? error.message : '更新指标模板失败，请重试';
        Message.error(errorMessage);
        // ✅ Correct: Convert error to Error object before throwing (conforms to @typescript-eslint/only-throw-error rule)
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        throw errorObj;
      }
    },
    [],
  );

  /**
   * Delete metric template
   */
  const deleteTemplate = useCallback(
    async (templateId: string): Promise<boolean> => {
      try {
        const response = await metricTemplateApi.delete(templateId);

        if (response.code === API_RESPONSE_CODE.SUCCESS) {
          Message.success('删除指标模板成功');
          return true;
        } else {
          throw new Error(response.message || 'Failed to delete');
        }
      } catch (error) {
        // ✅ Correct: Expose actual error information
        const errorMessage =
          error instanceof Error ? error.message : '删除指标模板失败，请重试';
        Message.error(errorMessage);
        return false;
      }
    },
    [],
  );

  return {
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};
