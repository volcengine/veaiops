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
 * Oncall rule service wrapper
 */
export const oncallRuleService = {
  /**
   * Create rule
   */
  createInterestRule: async (
    channel: string,
    botId: string,
    data: any, // Use any to handle form data, convert to InterestCreateRequest internally
  ): Promise<APIResponseInterest> => {
    // Convert form data to InterestCreateRequest
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
      // Include fields based on inspection category
      examples_positive: data.examples_positive,
      examples_negative: data.examples_negative,
      regular_expression: data.regular_expression,
    };

    // ✅ Fix: Generated API method uses object destructuring parameters
    return await apiClient.oncallRule.postApisV1ManagerRuleCenterOncall({
      channel,
      botId,
      requestBody,
    });
  },

  /**
   * Update rule
   */
  updateInterestRule: async (
    uuid: string,
    data: any, // Note: UpdateRuleRequest type has been removed
  ): Promise<APIResponseInterest> => {
    // Convert UpdateRuleRequest to InterestUpdateRequest
    // Note: InterestUpdateRequest type definition lacks inspect_history field, but backend InterestPayload supports it
    // TODO: Update OpenAPI spec to add inspect_history field to InterestUpdateRequest
    const requestBody: InterestUpdateRequest & { inspect_history?: number } = {
      name: data.name,
      description: data.description,
      level: data.level as InterestUpdateRequest.level | undefined,
      silence_delta: data.silence_delta,
      is_active: data.is_active,
      inspect_history: data.inspect_history,
      // Include fields based on inspection category (backend will automatically ignore other fields)
      examples_positive: data.examples_positive,
      examples_negative: data.examples_negative,
      regular_expression: data.regular_expression,
    };

    // ✅ Fix: Generated API method uses object destructuring parameters, parameter name is interestUuid
    return await apiClient.oncallRule.putApisV1ManagerRuleCenterOncall({
      interestUuid: uuid,
      requestBody,
    });
  },

  /**
   * Update rule active status
   */
  updateInterestActiveStatus: async (
    uuid: string,
    isActive: boolean,
  ): Promise<any> => {
    // ✅ Fix: Generated API method uses object destructuring parameters, parameter name is interestUuid
    return await apiClient.oncallRule.putApisV1ManagerRuleCenterOncallActive({
      interestUuid: uuid,
      requestBody: {
        is_active: isActive,
      },
    });
  },

  /**
   * Get rule list
   */
  getOncallRulesByAppId: async (
    channel: string,
    botId: string,
  ): Promise<APIResponseInterestList> => {
    // ✅ Fix: Generated API method uses object destructuring parameters
    return await apiClient.oncallRule.getApisV1ManagerRuleCenterOncall({
      channel,
      botId,
    });
  },
};
