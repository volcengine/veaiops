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
import type { APIResponseIntelligentThresholdAlarm } from '../models/api-response-intelligent-threshold-alarm';
import type { APIResponseSyncAlarmRulesResponse } from '../models/api-response-sync-alarm-rules-response';
import type { IntelligentThresholdAlarmCreateRequest } from '../models/intelligent-threshold-alarm-create-request';
import type { SyncAlarmRulesPayload } from '../models/sync-alarm-rules-payload';
import type { CancelablePromise } from '../core/cancelable-promise';
import type { BaseHttpRequest } from '../core/base-http-request';
export class IntelligentThresholdAlarmService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Create Intelligent Threshold Alarm
   * Create a new intelligent threshold alarm
   * @returns APIResponseIntelligentThresholdAlarm Created Successfully
   * @throws ApiError
   */
  public postApisV1IntelligentThresholdAlarm({
    requestBody,
  }: {
    requestBody: IntelligentThresholdAlarmCreateRequest,
  }): CancelablePromise<APIResponseIntelligentThresholdAlarm> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/intelligent-threshold/alarm/',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Sync Alarm Rules
   * Sync alarm rules
   * @returns APIResponseSyncAlarmRulesResponse Sync alarm rules successfully
   * @throws ApiError
   */
  public postApisV1IntelligentThresholdAlarmSync({
    requestBody,
  }: {
    requestBody: SyncAlarmRulesPayload,
  }): CancelablePromise<APIResponseSyncAlarmRulesResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/intelligent-threshold/alarm/sync',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
