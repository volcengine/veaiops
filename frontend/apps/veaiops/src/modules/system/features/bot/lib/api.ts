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

/**
 * Bot API service
 * Unified management of Bot and Bot attribute related API calls
 */

import { API_RESPONSE_CODE } from '@veaiops/constants';
import apiClient from '@/utils/api-client';
import type {
  BotCreateRequest,
  BotUpdateRequest,
  ChannelType,
  AttributeKey,
  BotAttribute,
  BotAttributePayload,
} from 'api-generate';

/**
 * Get Bot list parameters interface
 */
export interface GetBotsParams {
  skip?: number;
  limit?: number;
  name?: string;
  channel?: ChannelType;
}

/**
 * Get Bot list
 */
export const getBots = async (params: GetBotsParams = {}) => {
  const response = await apiClient.bots.getApisV1ManagerSystemConfigBots(
    params
  );
  return {
    data: response.data || [],
    total: response.data?.length || 0,
  };
};

/**
 * Delete Bot
 */
export const deleteBot = async (botId: string): Promise<boolean> => {
  const response = await apiClient.bots.deleteApisV1ManagerSystemConfigBots({
    uid: botId,
  });

  if (response.code === API_RESPONSE_CODE.SUCCESS) {
    return true;
  }

  throw new Error(response.message || "删除Bot失败");
};

/**
 * Create Bot
 */
export const createBot = async (data: BotCreateRequest) => {
  const response = await apiClient.bots.postApisV1ManagerSystemConfigBots({
    requestBody: data,
  });
  return response;
};

/**
 * updateBot parameters interface
 */
export interface UpdateBotParams {
  botId: string;
  data: BotUpdateRequest;
}

/**
 * Update Bot
 */
export const updateBot = async ({
  botId,
  data,
}: UpdateBotParams) => {
  const response = await apiClient.bots.putApisV1ManagerSystemConfigBots({
    uid: botId,
    requestBody: data,
  });
  return response;
};

/**
 * Get Bot secret information parameters interface
 */
export interface GetBotSecretParams {
  botId: string;
  fieldName: 'secret' | 'agent_cfg.api_key' | 'volc_cfg.ak' | 'volc_cfg.sk';
}

/**
 * Get Bot secret information
 */
export const getBotSecret = async ({
  botId,
  fieldName,
}: GetBotSecretParams): Promise<string> => {
  const response =
    await apiClient.bots.getApisV1ManagerSystemConfigBotsSecrets({
      uid: botId,
      fieldName,
    });

  if (response.code === API_RESPONSE_CODE.SUCCESS) {
    return response.data || '';
  }

  throw new Error(response.message || '获取加密信息失败');
};

// ==================== Bot Attributes API ====================

/**
 * Request parameters interface for getting Bot attribute list
 *
 * Corresponds to API: getApisV1ManagerSystemConfigBotAttributes
 * Based on parameter definitions in api-generate
 */
export interface FetchAttributesParams {
  /** Number of records to skip */
  skip?: number;
  /** Maximum number of records to return */
  limit?: number;
  /** Filter by attribute name (multiple selection) */
  names?: Array<AttributeKey> | string[];
  /** Filter by attribute value (fuzzy search) */
  value?: string;
}

/**
 * Get special attention list API
 */
export async function fetchAttributesApi(
  params: FetchAttributesParams,
): Promise<{
  data: BotAttribute[];
  total: number;
}> {
  const response =
    await apiClient.botAttributes.getApisV1ManagerSystemConfigBotAttributes(
      params,
    );

  if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
    return {
      data: response.data,
      total: response.data.length,
    };
  }

  return {
    data: [],
    total: 0,
  };
}

/**
 * Create special attention API
 */
export async function createAttributeApi(
  payload: BotAttributePayload,
): Promise<boolean> {
  const response =
    await apiClient.botAttributes.postApisV1ManagerSystemConfigBotAttributes({
      requestBody: payload,
    });

  if (response.code === API_RESPONSE_CODE.SUCCESS) {
    return true;
  }

  throw new Error(response.message || '创建失败');
}

/**
 * Update special attention API
 */
export async function updateAttributeApi(params: {
  botAttributeId: string;
  value: string;
}): Promise<boolean> {
  const response =
    await apiClient.botAttributes.putApisV1ManagerSystemConfigBotAttributes(
      params,
    );

  if (response.code === API_RESPONSE_CODE.SUCCESS) {
    return true;
  }

  throw new Error(response.message || '更新失败');
}

/**
 * Delete special attention API
 */
export async function deleteAttributeApi(params: {
  botAttributeId: string;
}): Promise<boolean> {
  const response =
    await apiClient.botAttributes.deleteApisV1ManagerSystemConfigBotAttributes1(
      params,
    );

  if (response.code === API_RESPONSE_CODE.SUCCESS) {
    return true;
  }

  throw new Error(response.message || '删除失败');
}
