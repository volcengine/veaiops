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
import type {
  APIResponseInterest,
  APIResponseInterestList,
  InterestCreateRequest,
  InterestUpdateRequest,
} from 'api-generate';

/**
 * Oncall规则服务封装
 */
export const oncallRuleService = {
  /**
   * 创建规则
   */
  createInterestRule: async (
    channel: string,
    botId: string,
    data: any, // 使用 any 以便处理表单数据，内部转换为 InterestCreateRequest
  ): Promise<APIResponseInterest> => {
    // 将表单数据转换为 InterestCreateRequest
    const requestBody: InterestCreateRequest = {
      name: data.name,
      description: data.description,
      level: data.level as InterestCreateRequest.level | undefined,
      silence_delta: data.silence_delta,
      is_active: data.is_active,
      inspect_history: data.inspect_history,
      action_category:
        data.action_category as InterestCreateRequest.action_category,
      inspect_category:
        data.inspect_category as InterestCreateRequest.inspect_category,
      // 根据检测类别，只包含对应的字段
      examples_positive: data.examples_positive,
      examples_negative: data.examples_negative,
      regular_expression: data.regular_expression,
    };

    // ✅ 修复：生成的 API 方法使用对象解构参数
    return await apiClient.oncallRule.postApisV1ManagerRuleCenterOncall({
      channel,
      botId,
      requestBody,
    });
  },

  /**
   * 更新规则
   */
  updateInterestRule: async (
    uuid: string,
    data: any, // 注意：UpdateRuleRequest 类型已移除
  ): Promise<APIResponseInterest> => {
    // 将 UpdateRuleRequest 转换为 InterestUpdateRequest
    // 注意：InterestUpdateRequest 类型定义中缺少 inspect_history 字段，但后端 InterestPayload 支持该字段
    // TODO: 更新 OpenAPI 规范，在 InterestUpdateRequest 中添加 inspect_history 字段
    const requestBody: InterestUpdateRequest & { inspect_history?: number } = {
      name: data.name,
      description: data.description,
      level: data.level as InterestUpdateRequest.level | undefined,
      silence_delta: data.silence_delta,
      is_active: data.is_active,
      inspect_history: data.inspect_history,
      // 根据检测类别，只包含对应的字段（后端会自动忽略其他字段）
      examples_positive: data.examples_positive,
      examples_negative: data.examples_negative,
      regular_expression: data.regular_expression,
    };

    // ✅ 修复：生成的 API 方法使用对象解构参数，参数名为 interestUuid
    return await apiClient.oncallRule.putApisV1ManagerRuleCenterOncall({
      interestUuid: uuid,
      requestBody,
    });
  },

  /**
   * 更新规则激活状态
   */
  updateInterestActiveStatus: async (
    uuid: string,
    isActive: boolean,
  ): Promise<any> => {
    // ✅ 修复：生成的 API 方法使用对象解构参数，参数名为 interestUuid
    return await apiClient.oncallRule.putApisV1ManagerRuleCenterOncallActive({
      interestUuid: uuid,
      requestBody: {
        is_active: isActive,
      },
    });
  },

  /**
   * 获取规则列表
   */
  getOncallRulesByAppId: async (
    channel: string,
    botId: string,
  ): Promise<APIResponseInterestList> => {
    // ✅ 修复：生成的 API 方法使用对象解构参数
    return await apiClient.oncallRule.getApisV1ManagerRuleCenterOncall({
      channel,
      botId,
    });
  },
};
