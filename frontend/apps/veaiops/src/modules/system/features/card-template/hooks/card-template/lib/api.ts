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
import { API_RESPONSE_CODE } from '@veaiops/constants';
import type {
  AgentTemplateCreateRequest,
  AgentTemplateUpdateRequest,
} from 'api-generate';

/**
 * Update template parameter interface
 */
export interface UpdateTemplateParams {
  templateId: string;
  updateData: AgentTemplateUpdateRequest;
}

/**
 * Create template
 */
export const createTemplate = async (
  templateData: AgentTemplateCreateRequest,
): Promise<boolean> => {
  try {
    const response =
      await apiClient.agentTemplate.postApisV1ManagerEventCenterAgentTemplate(
        {
          requestBody: templateData,
        },
      );

    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      Message.success('模板创建成功');
      return true;
    } else {
      throw new Error(response.message || '创建模板失败');
    }
  } catch (error) {
    // ✅ Correct: Expose actual error information
    const errorMessage =
      error instanceof Error ? error.message : '创建模板失败';
    Message.error(errorMessage);
    return false;
  }
};

/**
 * Update template
 */
export const updateTemplate = async ({
  templateId,
  updateData,
}: UpdateTemplateParams): Promise<boolean> => {
  try {
    const response =
      await apiClient.agentTemplate.putApisV1ManagerEventCenterAgentTemplate(
        {
          agentTemplateId: templateId,
          requestBody: updateData,
        },
      );

    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      Message.success('模板更新成功');
      return true;
    }

    throw new Error(response.message || '更新模板失败');
  } catch (error) {
    // ✅ Correct: Expose actual error information
    const errorMessage =
      error instanceof Error ? error.message : '更新模板失败';
    Message.error(errorMessage);
    return false;
  }
};

/**
 * Delete template
 */
export const deleteTemplate = async (templateId: string): Promise<boolean> => {
  try {
    const response =
      await apiClient.agentTemplate.deleteApisV1ManagerEventCenterAgentTemplate(
        {
          agentTemplateId: templateId,
        },
      );

    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      Message.success('模板删除成功');
      return true;
    }

    throw new Error(response.message || '删除模板失败');
  } catch (error) {
    // ✅ Correct: Expose actual error information
    const errorMessage =
      error instanceof Error ? error.message : '删除模板失败';
    Message.error(errorMessage);
    return false;
  }
};
