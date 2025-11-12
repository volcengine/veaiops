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
import type { APIResponseBoolean } from '../models/api-response-boolean';
import type { APIResponseInterest } from '../models/api-response-interest';
import type { APIResponseInterestList } from '../models/api-response-interest-list';
import type { InterestCreateRequest } from '../models/interest-create-request';
import type { InterestUpdateRequest } from '../models/interest-update-request';
import type { CancelablePromise } from '../core/cancelable-promise';
import type { BaseHttpRequest } from '../core/base-http-request';
export class OncallRuleService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Get Oncall Rules by App ID
   * Get interest rules according to App ID
   * @returns APIResponseInterestList Oncall rules retrieved successfully
   * @throws ApiError
   */
  public getApisV1ManagerRuleCenterOncall({
    channel,
    botId,
  }: {
    /**
     * Channel
     */
    channel: string,
    /**
     * App ID
     */
    botId: string,
  }): CancelablePromise<APIResponseInterestList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/manager/rule-center/oncall/{channel}/{bot_id}',
      path: {
        'channel': channel,
        'bot_id': botId,
      },
    });
  }
  /**
   * Create Oncall Interest Rule
   * Create a new oncall interest rule for a specific bot
   * @returns APIResponseInterest Interest rule created successfully
   * @throws ApiError
   */
  public postApisV1ManagerRuleCenterOncall({
    channel,
    botId,
    requestBody,
  }: {
    /**
     * Channel
     */
    channel: string,
    /**
     * App ID
     */
    botId: string,
    requestBody: InterestCreateRequest,
  }): CancelablePromise<APIResponseInterest> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/manager/rule-center/oncall/{channel}/{bot_id}',
      path: {
        'channel': channel,
        'bot_id': botId,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Update Interest Rule
   * Update an interest rule
   * @returns APIResponseInterest Interest rule updated successfully
   * @throws ApiError
   */
  public putApisV1ManagerRuleCenterOncall({
    interestUuid,
    requestBody,
  }: {
    /**
     * Interest rule UUID
     */
    interestUuid: string,
    requestBody: InterestUpdateRequest,
  }): CancelablePromise<APIResponseInterest> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/apis/v1/manager/rule-center/oncall/{interest_uuid}',
      path: {
        'interest_uuid': interestUuid,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Update Interest Active Status
   * Update the active status of an interest rule for a specific bot
   * @returns APIResponseBoolean Interest active status updated successfully
   * @throws ApiError
   */
  public putApisV1ManagerRuleCenterOncallActive({
    interestUuid,
    requestBody,
  }: {
    /**
     * Interest rule UUID
     */
    interestUuid: string,
    requestBody: {
      /**
       * Whether the interest rule is active
       */
      is_active: boolean;
    },
  }): CancelablePromise<APIResponseBoolean> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/apis/v1/manager/rule-center/oncall/{interest_uuid}/active',
      path: {
        'interest_uuid': interestUuid,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
