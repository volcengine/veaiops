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

/* generated using openapi-typescript-codegen -- do not edit */
import type { APIResponse } from '../models/api-response';
import type { APIResponseBot } from '../models/api-response-bot';
import type { APIResponseBotList } from '../models/api-response-bot-list';
import type { APIResponseString } from '../models/api-response-string';
import type { APIResponseValidateBotResult } from '../models/api-response-validate-bot-result';
import type { BotCreateRequest } from '../models/bot-create-request';
import type { BotUpdateRequest } from '../models/bot-update-request';
import type { ChannelType } from '../models/channel-type';
import type { ValidateBotRequest } from '../models/validate-bot-request';
import type { CancelablePromise } from '../core/cancelable-promise';
import type { BaseHttpRequest } from '../core/base-http-request';
export class BotsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Get All Bots
   * Get all bots with optional filtering and pagination
   * @returns APIResponseBotList Successful Response
   * @throws ApiError
   */
  public getApisV1ManagerSystemConfigBots({
    skip,
    limit = 100,
    name,
    channel,
  }: {
    /**
     * Number of bots to skip
     */
    skip?: number,
    /**
     * Maximum number of bots to return
     */
    limit?: number,
    /**
     * Filter bots by name (fuzzy matching)
     */
    name?: string,
    /**
     * Filter bots by channel type
     */
    channel?: ChannelType,
  }): CancelablePromise<APIResponseBotList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/manager/system-config/bots/',
      query: {
        'skip': skip,
        'limit': limit,
        'name': name,
        'channel': channel,
      },
    });
  }
  /**
   * Create Bot
   * Create a new bot
   * @returns APIResponseBot Created Successfully
   * @throws ApiError
   */
  public postApisV1ManagerSystemConfigBots({
    requestBody,
  }: {
    requestBody: BotCreateRequest,
  }): CancelablePromise<APIResponseBot> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/manager/system-config/bots/',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get Bot
   * Get a bot by ID
   * @returns APIResponseBot Successful Response
   * @throws ApiError
   */
  public getApisV1ManagerSystemConfigBots1({
    uid,
  }: {
    uid: string,
  }): CancelablePromise<APIResponseBot> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/manager/system-config/bots/{uid}',
      path: {
        'uid': uid,
      },
    });
  }
  /**
   * Update Bot
   * Update a bot
   * @returns APIResponseBot Updated Successfully
   * @throws ApiError
   */
  public putApisV1ManagerSystemConfigBots({
    uid,
    requestBody,
  }: {
    uid: string,
    requestBody: BotUpdateRequest,
  }): CancelablePromise<APIResponseBot> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/apis/v1/manager/system-config/bots/{uid}',
      path: {
        'uid': uid,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Delete Bot
   * Delete a bot
   * @returns APIResponse Deleted Successfully
   * @throws ApiError
   */
  public deleteApisV1ManagerSystemConfigBots({
    uid,
  }: {
    uid: string,
  }): CancelablePromise<APIResponse> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/apis/v1/manager/system-config/bots/{uid}',
      path: {
        'uid': uid,
      },
    });
  }
  /**
   * Get Bot Secret
   * Get a decrypted secret value from a bot by its ID and field name
   * @returns APIResponseString Secret retrieved successfully
   * @throws ApiError
   */
  public getApisV1ManagerSystemConfigBotsSecrets({
    uid,
    fieldName,
  }: {
    /**
     * The ID of the bot Document to retrieve
     */
    uid: string,
    /**
     * The name of the secret field to decrypt
     */
    fieldName: 'secret' | 'agent_cfg.api_key' | 'volc_cfg.ak' | 'volc_cfg.sk',
  }): CancelablePromise<APIResponseString> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/manager/system-config/bots/{uid}/secrets',
      path: {
        'uid': uid,
      },
      query: {
        'field_name': fieldName,
      },
    });
  }
  /**
   * Validate Bot Config
   * Validate bot configuration and connectivity (AppID/Secret, Webhook/Callback, Agent API Base)
   * @returns APIResponseValidateBotResult Validation result
   * @throws ApiError
   */
  public postApisV1ManagerSystemConfigBotsValidate({
    requestBody,
  }: {
    requestBody: ValidateBotRequest,
  }): CancelablePromise<APIResponseValidateBotResult> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/manager/system-config/bots/validate',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
