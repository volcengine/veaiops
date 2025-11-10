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
import type { AliyunDataSourceConfig } from '../models/aliyun-data-source-config';
import type { APIResponse } from '../models/api-response';
import type { APIResponseBoolean } from '../models/api-response-boolean';
import type { APIResponseDataSource } from '../models/api-response-data-source';
import type { APIResponseDataSourceList } from '../models/api-response-data-source-list';
import type { APIResponseStringList } from '../models/api-response-string-list';
import type { APIResponseVolcengineMetricList } from '../models/api-response-volcengine-metric-list';
import type { APIResponseVolcengineProductList } from '../models/api-response-volcengine-product-list';
import type { APIResponseZabbixHostList } from '../models/api-response-zabbix-host-list';
import type { APIResponseZabbixMediatypeList } from '../models/api-response-zabbix-mediatype-list';
import type { APIResponseZabbixTemplateList } from '../models/api-response-zabbix-template-list';
import type { APIResponseZabbixTemplateMetricList } from '../models/api-response-zabbix-template-metric-list';
import type { APIResponseZabbixUserGroupList } from '../models/api-response-zabbix-user-group-list';
import type { BaseTimeseriesRequestPayload } from '../models/base-timeseries-request-payload';
import type { VolcengineDataSourceConfig } from '../models/volcengine-data-source-config';
import type { VolcengineMetricConfig } from '../models/volcengine-metric-config';
import type { ZabbixDataSourceConfig } from '../models/zabbix-data-source-config';
import type { CancelablePromise } from '../core/cancelable-promise';
import type { BaseHttpRequest } from '../core/base-http-request';
export class DataSourcesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Get All Zabbix Datasource
   * Get all Zabbix data sources with optional pagination and name filtering
   * @returns APIResponseDataSourceList Successful Response
   * @throws ApiError
   */
  public getApisV1DatasourceZabbix({
    skip,
    limit = 100,
    name,
    isActive,
  }: {
    /**
     * Number of data sources to skip
     */
    skip?: number,
    /**
     * Maximum number of data sources to return
     */
    limit?: number,
    /**
     * Filter by name (fuzzy matching)
     */
    name?: string,
    /**
     * Filter by active status
     */
    isActive?: boolean,
  }): CancelablePromise<APIResponseDataSourceList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/zabbix/',
      query: {
        'skip': skip,
        'limit': limit,
        'name': name,
        'is_active': isActive,
      },
    });
  }
  /**
   * Create Zabbix Datasource
   * Create a new Zabbix data source
   * @returns APIResponseDataSource Created Successfully
   * @throws ApiError
   */
  public postApisV1DatasourceZabbix({
    requestBody,
  }: {
    requestBody: ZabbixDataSourceConfig,
  }): CancelablePromise<APIResponseDataSource> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/datasource/zabbix/',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get Zabbix Datasource By Id
   * Get a Zabbix data source by ID
   * @returns APIResponseDataSource Successful Response
   * @throws ApiError
   */
  public getApisV1DatasourceZabbix1({
    datasourceId,
  }: {
    datasourceId: string,
  }): CancelablePromise<APIResponseDataSource> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/zabbix/{datasource_id}',
      path: {
        'datasource_id': datasourceId,
      },
    });
  }
  /**
   * Update Zabbix Datasource
   * Update a Zabbix data source
   * @returns APIResponseDataSource Updated Successfully
   * @throws ApiError
   */
  public putApisV1DatasourceZabbix({
    datasourceId,
    requestBody,
  }: {
    datasourceId: string,
    requestBody: ZabbixDataSourceConfig,
  }): CancelablePromise<APIResponseDataSource> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/apis/v1/datasource/zabbix/{datasource_id}',
      path: {
        'datasource_id': datasourceId,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Delete Zabbix Datasource
   * Delete a Zabbix data source by ID
   * @returns APIResponseBoolean Deleted Successfully
   * @throws ApiError
   */
  public deleteApisV1DatasourceZabbix({
    datasourceId,
  }: {
    datasourceId: string,
  }): CancelablePromise<APIResponseBoolean> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/apis/v1/datasource/zabbix/{datasource_id}',
      path: {
        'datasource_id': datasourceId,
      },
    });
  }
  /**
   * Get All Aliyun Datasource
   * Get all Aliyun data sources with optional pagination and name filtering
   * @returns APIResponseDataSourceList Successful Response
   * @throws ApiError
   */
  public getApisV1DatasourceAliyun({
    skip,
    limit = 100,
    name,
    isActive,
  }: {
    /**
     * Number of data sources to skip
     */
    skip?: number,
    /**
     * Maximum number of data sources to return
     */
    limit?: number,
    /**
     * Filter by name (fuzzy matching)
     */
    name?: string,
    /**
     * Filter by active status
     */
    isActive?: boolean,
  }): CancelablePromise<APIResponseDataSourceList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/aliyun/',
      query: {
        'skip': skip,
        'limit': limit,
        'name': name,
        'is_active': isActive,
      },
    });
  }
  /**
   * Create Aliyun Datasource
   * Create a new Aliyun data source
   * @returns APIResponseDataSource Created Successfully
   * @throws ApiError
   */
  public postApisV1DatasourceAliyun({
    requestBody,
  }: {
    requestBody: AliyunDataSourceConfig,
  }): CancelablePromise<APIResponseDataSource> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/datasource/aliyun/',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get Aliyun Datasource By Id
   * Get an Aliyun data source by ID
   * @returns APIResponseDataSource Successful Response
   * @throws ApiError
   */
  public getApisV1DatasourceAliyun1({
    datasourceId,
  }: {
    datasourceId: string,
  }): CancelablePromise<APIResponseDataSource> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/aliyun/{datasource_id}',
      path: {
        'datasource_id': datasourceId,
      },
    });
  }
  /**
   * Update Aliyun Datasource
   * Update an Aliyun data source
   * @returns APIResponseDataSource Updated Successfully
   * @throws ApiError
   */
  public putApisV1DatasourceAliyun({
    datasourceId,
    requestBody,
  }: {
    datasourceId: string,
    requestBody: AliyunDataSourceConfig,
  }): CancelablePromise<APIResponseDataSource> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/apis/v1/datasource/aliyun/{datasource_id}',
      path: {
        'datasource_id': datasourceId,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Delete Aliyun Datasource
   * Delete an Aliyun data source by ID
   * @returns APIResponseBoolean Deleted Successfully
   * @throws ApiError
   */
  public deleteApisV1DatasourceAliyun({
    datasourceId,
  }: {
    datasourceId: string,
  }): CancelablePromise<APIResponseBoolean> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/apis/v1/datasource/aliyun/{datasource_id}',
      path: {
        'datasource_id': datasourceId,
      },
    });
  }
  /**
   * Get All Volcengine Datasource
   * Get all Volcengine data sources with optional pagination and name filtering
   * @returns APIResponseDataSourceList Successful Response
   * @throws ApiError
   */
  public getApisV1DatasourceVolcengine({
    skip,
    limit = 100,
    name,
    isActive,
  }: {
    /**
     * Number of data sources to skip
     */
    skip?: number,
    /**
     * Maximum number of data sources to return
     */
    limit?: number,
    /**
     * Filter by name (fuzzy matching)
     */
    name?: string,
    /**
     * Filter by active status
     */
    isActive?: boolean,
  }): CancelablePromise<APIResponseDataSourceList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/volcengine/',
      query: {
        'skip': skip,
        'limit': limit,
        'name': name,
        'is_active': isActive,
      },
    });
  }
  /**
   * Create Volcengine Datasource
   * Create a new Volcengine data source
   * @returns APIResponseDataSource Created Successfully
   * @throws ApiError
   */
  public postApisV1DatasourceVolcengine({
    requestBody,
  }: {
    requestBody: VolcengineDataSourceConfig,
  }): CancelablePromise<APIResponseDataSource> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/datasource/volcengine/',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get Volcengine Datasource By Id
   * Get a Volcengine data source by ID
   * @returns APIResponseDataSource Successful Response
   * @throws ApiError
   */
  public getApisV1DatasourceVolcengineDatasourceId({
    datasourceId,
  }: {
    datasourceId: string,
  }): CancelablePromise<APIResponseDataSource> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/volcengine/datasource_id/{datasource_id}',
      path: {
        'datasource_id': datasourceId,
      },
    });
  }
  /**
   * Update Volcengine Datasource
   * Update a Volcengine data source
   * @returns APIResponseDataSource Updated Successfully
   * @throws ApiError
   */
  public putApisV1DatasourceVolcengineDatasourceId({
    datasourceId,
    requestBody,
  }: {
    datasourceId: string,
    requestBody: VolcengineDataSourceConfig,
  }): CancelablePromise<APIResponseDataSource> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/apis/v1/datasource/volcengine/datasource_id/{datasource_id}',
      path: {
        'datasource_id': datasourceId,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Delete Volcengine Datasource
   * Delete a Volcengine data source by ID
   * @returns APIResponseBoolean Deleted Successfully
   * @throws ApiError
   */
  public deleteApisV1DatasourceVolcengineDatasourceId({
    datasourceId,
  }: {
    datasourceId: string,
  }): CancelablePromise<APIResponseBoolean> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/apis/v1/datasource/volcengine/datasource_id/{datasource_id}',
      path: {
        'datasource_id': datasourceId,
      },
    });
  }
  /**
   * Toggle Data Source Active Status
   * Toggle the active status of a data source by ID
   * @returns APIResponseDataSource Data source active status updated successfully
   * @throws ApiError
   */
  public putApisV1DatasourceActive({
    datasourceId,
    requestBody,
  }: {
    /**
     * Data source ID
     */
    datasourceId: string,
    requestBody: {
      is_active: boolean;
    },
  }): CancelablePromise<APIResponseDataSource> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/apis/v1/datasource/{datasource_id}/active',
      path: {
        'datasource_id': datasourceId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        404: `Data source not found`,
      },
    });
  }
  /**
   * Get Zabbix Templates
   * Get Zabbix templates by connect name with optional name filtering
   * @returns APIResponseZabbixTemplateList Successful response
   * @throws ApiError
   */
  public getApisV1DatasourceZabbixTemplates({
    connectName,
    name,
  }: {
    /**
     * Connect name
     */
    connectName: string,
    /**
     * Optional name pattern to filter templates by name (supports fuzzy matching)
     */
    name?: string,
  }): CancelablePromise<APIResponseZabbixTemplateList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/zabbix/{connect_name}/templates',
      path: {
        'connect_name': connectName,
      },
      query: {
        'name': name,
      },
    });
  }
  /**
   * Get Zabbix Template Metrics
   * Get Zabbix template metrics by connect name and template ID
   * @returns APIResponseZabbixTemplateMetricList Successful response
   * @throws ApiError
   */
  public getApisV1DatasourceZabbixTemplatesMetrics({
    connectName,
    templateId,
  }: {
    /**
     * Connect name
     */
    connectName: string,
    /**
     * Template ID
     */
    templateId: string,
  }): CancelablePromise<APIResponseZabbixTemplateMetricList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/zabbix/{connect_name}/templates/{template_id}/metrics',
      path: {
        'connect_name': connectName,
        'template_id': templateId,
      },
    });
  }
  /**
   * Get Zabbix Template Hosts
   * Get Zabbix template hosts by connect name and template ID
   * @returns APIResponseZabbixHostList Successful response
   * @throws ApiError
   */
  public getApisV1DatasourceZabbixTemplatesHosts({
    connectName,
    templateId,
  }: {
    /**
     * Connect name
     */
    connectName: string,
    /**
     * Template ID
     */
    templateId: string,
  }): CancelablePromise<APIResponseZabbixHostList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/zabbix/{connect_name}/templates/{template_id}/hosts',
      path: {
        'connect_name': connectName,
        'template_id': templateId,
      },
    });
  }
  /**
   * Create Aliyun Data Source
   * Create a new Aliyun data source
   * @returns APIResponseDataSource Created Successfully
   * @throws ApiError
   */
  public postApisV1DatasourceAliyun1({
    requestBody,
  }: {
    requestBody: AliyunDataSourceConfig,
  }): CancelablePromise<APIResponseDataSource> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/datasource/aliyun',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Create Volcengine Data Source
   * Create a new Volcengine data source
   * @returns APIResponseDataSource Created Successfully
   * @throws ApiError
   */
  public postApisV1DatasourceVolcengine1({
    requestBody,
  }: {
    requestBody: VolcengineDataSourceConfig,
  }): CancelablePromise<APIResponseDataSource> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/datasource/volcengine',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get Volcengine Products
   * Get list of Volcengine monitoring products
   * @returns APIResponseVolcengineProductList Successful Response
   * @throws ApiError
   */
  public getApisV1DatasourceVolcengineProducts(): CancelablePromise<APIResponseVolcengineProductList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/volcengine/products',
    });
  }
  /**
   * Get Volcengine Metrics
   * Get list of Volcengine monitoring metrics
   * @returns APIResponseVolcengineMetricList Successful Response
   * @throws ApiError
   */
  public getApisV1DatasourceVolcengineMetrics({
    namespace,
    subNamespace,
    metricName,
  }: {
    /**
     * Product namespace
     */
    namespace?: string,
    /**
     * Sub namespace
     */
    subNamespace?: string,
    /**
     * Metric name
     */
    metricName?: string,
  }): CancelablePromise<APIResponseVolcengineMetricList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/volcengine/metrics',
      query: {
        'namespace': namespace,
        'sub_namespace': subNamespace,
        'metric_name': metricName,
      },
    });
  }
  /**
   * Get Namespaces
   * Get all product namespaces
   * @returns APIResponseStringList Successful Response
   * @throws ApiError
   */
  public getApisV1DatasourceVolcengineMetricsNamespaces(): CancelablePromise<APIResponseStringList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/volcengine/metrics/namespaces',
    });
  }
  /**
   * Get Sub Namespaces
   * Get all sub namespaces
   * @returns APIResponseStringList Successful Response
   * @throws ApiError
   */
  public getApisV1DatasourceVolcengineMetricsSubNamespaces({
    namespace,
  }: {
    /**
     * Product namespace
     */
    namespace?: string,
  }): CancelablePromise<APIResponseStringList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/volcengine/metrics/sub-namespaces',
      query: {
        'namespace': namespace,
      },
    });
  }
  /**
   * Search Metrics
   * Search metrics by keyword
   * @returns APIResponseVolcengineMetricList Successful Response
   * @throws ApiError
   */
  public getApisV1DatasourceVolcengineMetricsSearch({
    keyword,
    namespace,
    subNamespace,
  }: {
    /**
     * Search keyword
     */
    keyword?: string,
    /**
     * Limit to namespace
     */
    namespace?: string,
    /**
     * Limit to sub_namespace
     */
    subNamespace?: string,
  }): CancelablePromise<APIResponseVolcengineMetricList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/volcengine/metrics/search',
      query: {
        'keyword': keyword,
        'namespace': namespace,
        'sub_namespace': subNamespace,
      },
    });
  }
  /**
   * Get Metrics Timeseries
   * Get Aliyun metrics timeseries data
   * @returns APIResponse Successful Response
   * @throws ApiError
   */
  public postApisV1DatasourceAliyunMetricsTimeseries({
    requestBody,
  }: {
    requestBody: BaseTimeseriesRequestPayload,
  }): CancelablePromise<APIResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/datasource/aliyun/metrics/timeseries',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get Metrics Timeseries
   * Get Zabbix metrics timeseries data
   * @returns APIResponse Successful Response
   * @throws ApiError
   */
  public postApisV1DatasourceZabbixMetricsTimeseries({
    requestBody,
  }: {
    requestBody: BaseTimeseriesRequestPayload,
  }): CancelablePromise<APIResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/datasource/zabbix/metrics/timeseries',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get Zabbix Mediatypes
   * Get list of alert notification methods for Zabbix data source
   * @returns APIResponseZabbixMediatypeList Successfully retrieved alert notification methods list
   * @throws ApiError
   */
  public getApisV1DatasourceZabbixDatasourceMediatypes({
    datasourceId,
  }: {
    /**
     * Data source ID
     */
    datasourceId: string,
  }): CancelablePromise<APIResponseZabbixMediatypeList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/zabbix/datasource/{datasource_id}/mediatypes',
      path: {
        'datasource_id': datasourceId,
      },
    });
  }
  /**
   * Get Zabbix Usergroups
   * Get list of alert groups for Zabbix data source
   * @returns APIResponseZabbixUserGroupList Successfully retrieved alert groups list
   * @throws ApiError
   */
  public getApisV1DatasourceZabbixDatasourceUsergroups({
    datasourceId,
  }: {
    /**
     * Data source ID
     */
    datasourceId: string,
  }): CancelablePromise<APIResponseZabbixUserGroupList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/zabbix/datasource/{datasource_id}/usergroups',
      path: {
        'datasource_id': datasourceId,
      },
    });
  }
  /**
   * List Contact Groups
   * Get list of Volcengine contact groups
   * @returns APIResponse Successful Response
   * @throws ApiError
   */
  public getApisV1DatasourceVolcengineContactGroups({
    datasourceId,
    name,
    skip,
    limit = 10,
  }: {
    /**
     * Data source ID to get contact groups
     */
    datasourceId: string,
    /**
     * Filter contact groups by name
     */
    name?: string,
    /**
     * Number of items to skip
     */
    skip?: number,
    /**
     * Maximum number of items to return (1-100)
     */
    limit?: number,
  }): CancelablePromise<APIResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/datasource/volcengine/contact_groups',
      query: {
        'datasource_id': datasourceId,
        'name': name,
        'skip': skip,
        'limit': limit,
      },
    });
  }
  /**
   * Search Instances
   * Search instances for Volcengine metrics
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public postApisV1DatasourceVolcengineMetricsInstances({
    requestBody,
  }: {
    requestBody: VolcengineMetricConfig,
  }): CancelablePromise<{
    code?: number;
    message?: string;
    data?: Array<Record<string, string>>;
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/datasource/volcengine/metrics/instances',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get Metrics Timeseries
   * Get Volcengine metrics timeseries data
   * @returns APIResponse Successful Response
   * @throws ApiError
   */
  public postApisV1DatasourceVolcengineMetricsTimeseries({
    requestBody,
  }: {
    requestBody: BaseTimeseriesRequestPayload,
  }): CancelablePromise<APIResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/datasource/volcengine/metrics/timeseries',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Fetch Data Api
   * Fetch data from data source
   * @returns APIResponse Data fetched successfully
   * @throws ApiError
   */
  public postApisV1DatasourceFetch({
    requestBody,
  }: {
    requestBody: {
      /**
       * Data source ID
       */
      datasource_id: string;
      /**
       * Query parameters
       */
      query: Record<string, any>;
    },
  }): CancelablePromise<APIResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/datasource/fetch',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
