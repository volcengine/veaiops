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
import type { AliyunMetricConfig } from '../models/aliyun-metric-config';
import type { AliyunMetricMetaListPayload } from '../models/aliyun-metric-meta-list-payload';
import type { AliyunProjectMetaPayload } from '../models/aliyun-project-meta-payload';
import type { APIResponse } from '../models/api-response';
import type { APIResponseBoolean } from '../models/api-response-boolean';
import type { APIResponseConnect } from '../models/api-response-connect';
import type { ConnectCreateRequest } from '../models/connect-create-request';
import type { ConnectUpdateRequest } from '../models/connect-update-request';
import type { PaginatedAPIResponse } from '../models/paginated-api-response';
import type { PaginatedAPIResponseAliyunContactGroupList } from '../models/paginated-api-response-aliyun-contact-group-list';
import type { PaginatedAPIResponseAliyunMetricList } from '../models/paginated-api-response-aliyun-metric-list';
import type { PaginatedAPIResponseConnectList } from '../models/paginated-api-response-connect-list';
import type { CancelablePromise } from '../core/cancelable-promise';
import type { BaseHttpRequest } from '../core/base-http-request';
export class DataSourceConnectService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Get All Connects
   * Get all Connect objects with optional pagination and name filtering
   * @returns PaginatedAPIResponseConnectList Successful Response
   * @throws ApiError
   */
  public getApisV1DatasourceConnect({
    skip,
    limit = 100,
    name,
  }: {
    /**
     * Number of connects to skip
     */
    skip?: number,
    /**
     * Maximum number of connects to return
     */
    limit?: number,
    /**
     * Filter connects by name (fuzzy matching)
     */
    name?: string,
  }): CancelablePromise<PaginatedAPIResponseConnectList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/connect/',
      query: {
        'skip': skip,
        'limit': limit,
        'name': name,
      },
    });
  }
  /**
   * Create Connect
   * Create a new Connect object
   * @returns APIResponseConnect Created Successfully
   * @throws ApiError
   */
  public postApisV1DatasourceConnect({
    requestBody,
  }: {
    requestBody: ConnectCreateRequest,
  }): CancelablePromise<APIResponseConnect> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/datasource/connect/',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get Connect
   * Get a Connect object by ID
   * @returns APIResponseConnect Successful Response
   * @throws ApiError
   */
  public getApisV1DatasourceConnect1({
    connectId,
  }: {
    connectId: string,
  }): CancelablePromise<APIResponseConnect> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/connect/{connect_id}',
      path: {
        'connect_id': connectId,
      },
    });
  }
  /**
   * Update Connect
   * Update a Connect object
   * @returns APIResponseConnect Updated Successfully
   * @throws ApiError
   */
  public putApisV1DatasourceConnect({
    connectId,
    requestBody,
  }: {
    connectId: string,
    requestBody: ConnectUpdateRequest,
  }): CancelablePromise<APIResponseConnect> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/apis/v1/datasource/connect/{connect_id}',
      path: {
        'connect_id': connectId,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Delete Connect
   * Delete a Connect object
   * @returns APIResponseBoolean Deleted Successfully
   * @throws ApiError
   */
  public deleteApisV1DatasourceConnect({
    connectId,
  }: {
    connectId: string,
  }): CancelablePromise<APIResponseBoolean> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/apis/v1/datasource/connect/{connect_id}',
      path: {
        'connect_id': connectId,
      },
    });
  }
  /**
   * Test Connect Endpoint
   * Test if a Connect object can be established
   * @returns APIResponse Connection test successful
   * @throws ApiError
   */
  public postApisV1DatasourceConnectDail({
    requestBody,
  }: {
    requestBody: ConnectCreateRequest,
  }): CancelablePromise<APIResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/datasource/connect/dail',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Describe Aliyun Contact Group List
   * Get contact group list from Aliyun by connect ID
   * @returns PaginatedAPIResponseAliyunContactGroupList Successful Response
   * @throws ApiError
   */
  public postApisV1DatasourceConnectAliyunDescribeContactGroupList({
    connectId,
    skip,
    limit = 100,
  }: {
    /**
     * Connect ID
     */
    connectId: string,
    /**
     * Number of records to skip for pagination
     */
    skip?: number,
    /**
     * Maximum number of records to return
     */
    limit?: number,
  }): CancelablePromise<PaginatedAPIResponseAliyunContactGroupList> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/datasource/connect/aliyun/{connect_id}/describe-contact-group-list',
      path: {
        'connect_id': connectId,
      },
      query: {
        'skip': skip,
        'limit': limit,
      },
    });
  }
  /**
   * Describe Aliyun Project Meta
   * Describe Aliyun project metadata
   * @returns PaginatedAPIResponse Successful Response
   * @throws ApiError
   */
  public postApisV1DatasourceConnectAliyunDescribeProjectMeta({
    connectId,
    requestBody,
    skip,
    limit = 10,
  }: {
    /**
     * Connect ID
     */
    connectId: string,
    requestBody: AliyunProjectMetaPayload,
    /**
     * Number of records to skip for pagination
     */
    skip?: number,
    /**
     * Maximum number of records to return
     */
    limit?: number,
  }): CancelablePromise<PaginatedAPIResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/datasource/connect/aliyun/{connect_id}/describe-project-meta',
      path: {
        'connect_id': connectId,
      },
      query: {
        'skip': skip,
        'limit': limit,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Describe Aliyun Metric Meta List
   * Describe Aliyun metric metadata list
   * @returns PaginatedAPIResponseAliyunMetricList Successful Response
   * @throws ApiError
   */
  public postApisV1DatasourceConnectAliyunDescribeMetricMetaList({
    connectId,
    requestBody,
    skip,
    limit = 1000,
  }: {
    /**
     * Connect ID
     */
    connectId: string,
    requestBody: AliyunMetricMetaListPayload,
    /**
     * Number of records to skip for pagination
     */
    skip?: number,
    /**
     * Maximum number of records to return
     */
    limit?: number,
  }): CancelablePromise<PaginatedAPIResponseAliyunMetricList> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/datasource/connect/aliyun/{connect_id}/describe-metric-meta-list',
      path: {
        'connect_id': connectId,
      },
      query: {
        'skip': skip,
        'limit': limit,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Search Aliyun Instances
   * Search Aliyun instances for a specific namespace and metric
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public postApisV1DatasourceConnectAliyunMetricsInstances({
    requestBody,
  }: {
    requestBody: AliyunMetricConfig,
  }): CancelablePromise<{
    code?: number;
    message?: string;
    data?: Array<Record<string, string>>;
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/datasource/connect/aliyun/metrics/instances',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
