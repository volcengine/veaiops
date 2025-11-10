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

import apiClient from "@/utils/api-client";
import { API_RESPONSE_CODE } from "@veaiops/constants";
import type {
    ChannelType,
    InformStrategyCreate,
    InformStrategyUpdate,
    PaginatedAPIResponseInformStrategyList
} from "api-generate";

/**
 * Message card notification strategy service
 *
 * Encapsulates message card notification strategy related API calls, provides unified API interface
 *
 * @example
 * ```typescript
 * const strategyService = new StrategyService();
 * const strategies = await strategyService.getStrategies({ skip: 0, limit: 10 });
 * ```
 */
export class StrategyService {
  /**
   * Get message card notification strategy list
   */
  async getStrategies(params?: {
    skip?: number;
    limit?: number;
    name?: string;
    channel?: string;
    botId?: string;
    showAll?: boolean;
  }): Promise<PaginatedAPIResponseInformStrategyList> {
    const response =
      await apiClient.informStrategy.getApisV1ManagerEventCenterInformStrategy({
        skip: params?.skip || 0,
        limit: params?.limit || 10,
        name: params?.name,
        channel: params?.channel as ChannelType | undefined,
        botId: params?.botId,
        showAll: params?.showAll,
      });

    return response;
  }

  /**
   * Create message card notification strategy
   */
  async createStrategy(strategyData: InformStrategyCreate) {
    const response =
      await apiClient.informStrategy.postApisV1ManagerEventCenterInformStrategy(
        {
          requestBody: strategyData,
        }
      );

    return response;
  }

  /**
   * Update message card notification strategy
   */
  async updateStrategy(strategyId: string, updateData: InformStrategyUpdate) {
    const response =
      await apiClient.informStrategy.putApisV1ManagerEventCenterInformStrategy({
        uid: strategyId,
        requestBody: updateData,
      });

    return response;
  }

  /**
   * Delete message card notification strategy
   */
  async deleteStrategy(strategyId: string) {
    const response =
      await apiClient.informStrategy.deleteApisV1ManagerEventCenterInformStrategy(
        {
          uid: strategyId,
        }
      );

    return response;
  }

  /**
   * Check if strategy name is duplicate
   */
  async checkStrategyNameDuplicate(name: string, excludeId?: string) {
    const response =
      await apiClient.informStrategy.getApisV1ManagerEventCenterInformStrategy({
        showAll: true,
      });

    if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
      const isDuplicate = response.data.some(
        (strategy: any) =>
          strategy.name === name && (!excludeId || strategy.id !== excludeId)
      );
      return isDuplicate;
    }

    return false;
  }
}

// Create singleton instance
export const strategyService = new StrategyService();
