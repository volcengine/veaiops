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
import type { APIResponseIntelligentThresholdTask } from '../models/api-response-intelligent-threshold-task';
import type { APIResponseIntelligentThresholdTaskDetail } from '../models/api-response-intelligent-threshold-task-detail';
import type { APIResponseIntelligentThresholdTaskVersion } from '../models/api-response-intelligent-threshold-task-version';
import type { IntelligentThresholdTaskCreateRequest } from '../models/intelligent-threshold-task-create-request';
import type { IntelligentThresholdTaskStatus } from '../models/intelligent-threshold-task-status';
import type { PaginatedAPIResponseIntelligentThresholdTask } from '../models/paginated-api-response-intelligent-threshold-task';
import type { PaginatedAPIResponseIntelligentThresholdTaskVersion } from '../models/paginated-api-response-intelligent-threshold-task-version';
import type { RerunIntelligentThresholdTaskRequest } from '../models/rerun-intelligent-threshold-task-request';
import type { UpdateAutoRefreshSwitchPayload } from '../models/update-auto-refresh-switch-payload';
import type { UpdateTaskResultRequest } from '../models/update-task-result-request';
import type { CancelablePromise } from '../core/cancelable-promise';
import type { BaseHttpRequest } from '../core/base-http-request';
export class IntelligentThresholdTaskService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Create Intelligent Threshold Task
   * Create a new intelligent threshold task
   * @returns APIResponseIntelligentThresholdTask Created Successfully
   * @throws ApiError
   */
  public postApisV1IntelligentThresholdTask({
    requestBody,
  }: {
    requestBody: IntelligentThresholdTaskCreateRequest,
  }): CancelablePromise<APIResponseIntelligentThresholdTask> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/intelligent-threshold/task/',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * List Tasks
   * Get task list
   * @returns PaginatedAPIResponseIntelligentThresholdTask Get task list successfully
   * @throws ApiError
   */
  public getApisV1IntelligentThresholdTask({
    projects,
    taskName,
    datasourceType = 'Volcengine',
    autoUpdate,
    createdAtStart,
    createdAtEnd,
    updatedAtStart,
    updatedAtEnd,
    skip,
    limit = 100,
  }: {
    /**
     * List of project names
     */
    projects?: Array<string>,
    /**
     * Task name filter
     */
    taskName?: string,
    /**
     * Data source type
     */
    datasourceType?: 'Zabbix' | 'Aliyun' | 'Volcengine',
    /**
     * Auto update switch
     */
    autoUpdate?: boolean,
    /**
     * Creation time range start
     */
    createdAtStart?: string,
    /**
     * Creation time range end
     */
    createdAtEnd?: string,
    /**
     * Update time range start
     */
    updatedAtStart?: string,
    /**
     * Update time range end
     */
    updatedAtEnd?: string,
    /**
     * Number of records to skip
     */
    skip?: number,
    /**
     * Page size
     */
    limit?: number,
  }): CancelablePromise<PaginatedAPIResponseIntelligentThresholdTask> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/intelligent-threshold/task/',
      query: {
        'projects': projects,
        'task_name': taskName,
        'datasource_type': datasourceType,
        'auto_update': autoUpdate,
        'created_at_start': createdAtStart,
        'created_at_end': createdAtEnd,
        'updated_at_start': updatedAtStart,
        'updated_at_end': updatedAtEnd,
        'skip': skip,
        'limit': limit,
      },
    });
  }
  /**
   * Get Intelligent Threshold Task
   * Get an intelligent threshold task by ID
   * @returns APIResponseIntelligentThresholdTaskDetail Successful Response
   * @throws ApiError
   */
  public getApisV1IntelligentThresholdTask1({
    taskId,
  }: {
    taskId: string,
  }): CancelablePromise<APIResponseIntelligentThresholdTaskDetail> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/intelligent-threshold/task/{task_id}',
      path: {
        'task_id': taskId,
      },
    });
  }
  /**
   * Delete Task
   * Delete an intelligent threshold task and all its associated versions
   * @returns APIResponse Delete task successfully
   * @throws ApiError
   */
  public deleteApisV1IntelligentThresholdTask({
    taskId,
  }: {
    /**
     * Task ID
     */
    taskId: string,
  }): CancelablePromise<APIResponse> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/apis/v1/intelligent-threshold/task/{task_id}',
      path: {
        'task_id': taskId,
      },
    });
  }
  /**
   * Rerun Task
   * Rerun intelligent threshold task
   * @returns APIResponseIntelligentThresholdTaskVersion Task rerun successfully
   * @throws ApiError
   */
  public postApisV1IntelligentThresholdTaskRerun({
    requestBody,
  }: {
    requestBody: RerunIntelligentThresholdTaskRequest,
  }): CancelablePromise<APIResponseIntelligentThresholdTaskVersion> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/intelligent-threshold/task/rerun',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * List Task Versions
   * Get task version list
   * @returns PaginatedAPIResponseIntelligentThresholdTaskVersion Get version list successfully
   * @throws ApiError
   */
  public getApisV1IntelligentThresholdTaskVersions({
    taskId,
    status,
    createdAtStart,
    createdAtEnd,
    updatedAtStart,
    updatedAtEnd,
    skip,
    limit = 100,
  }: {
    /**
     * Task ID
     */
    taskId: string,
    /**
     * Filter by task status
     */
    status?: IntelligentThresholdTaskStatus,
    /**
     * Creation time range start
     */
    createdAtStart?: string,
    /**
     * Creation time range end
     */
    createdAtEnd?: string,
    /**
     * Update time range start
     */
    updatedAtStart?: string,
    /**
     * Update time range end
     */
    updatedAtEnd?: string,
    /**
     * Number of items to skip
     */
    skip?: number,
    /**
     * Maximum number of items to return
     */
    limit?: number,
  }): CancelablePromise<PaginatedAPIResponseIntelligentThresholdTaskVersion> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/intelligent-threshold/task/versions/',
      query: {
        'task_id': taskId,
        'status': status,
        'created_at_start': createdAtStart,
        'created_at_end': createdAtEnd,
        'updated_at_start': updatedAtStart,
        'updated_at_end': updatedAtEnd,
        'skip': skip,
        'limit': limit,
      },
    });
  }
  /**
   * Update Task Result Endpoint
   * Update task result
   * @returns APIResponse Update task result successfully
   * @throws ApiError
   */
  public postApisV1IntelligentThresholdTaskUpdateResult({
    taskId,
    requestBody,
  }: {
    taskId: string,
    requestBody: UpdateTaskResultRequest,
  }): CancelablePromise<APIResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/intelligent-threshold/task/{task_id}/update_result',
      path: {
        'task_id': taskId,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Auto Refresh Switch
   * Update auto_update field for a list of intelligent threshold tasks.
   * @returns APIResponse Successful Response
   * @throws ApiError
   */
  public postApisV1IntelligentThresholdTaskAutoRefreshSwitch({
    requestBody,
  }: {
    requestBody: UpdateAutoRefreshSwitchPayload,
  }): CancelablePromise<APIResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/intelligent-threshold/task/auto-refresh-switch',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
