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
 * Monitor data source management API service
 */

import type { APIResponseDataSourceList, DataSource } from "api-generate";
import type { DataSourceType } from "./types";
import apiClient from "@/utils/api-client";

/**
 * Data source API service
 */
export const DataSourceApiService = {
  /**
   * Get Zabbix data source list
   */
  async getZabbixDataSources(): Promise<APIResponseDataSourceList> {
    const response = await apiClient.dataSources.getApisV1DatasourceZabbix({
      skip: 0,
      limit: 1000,
    });
    return response;
  },

  /**
   * Get Aliyun data source list
   */
  async getAliyunDataSources(): Promise<APIResponseDataSourceList> {
    const response = await apiClient.dataSources.getApisV1DatasourceAliyun({
      skip: 0,
      limit: 1000,
    });
    return response;
  },

  /**
   * Get Volcengine data source list
   */
  async getVolcengineDataSources(): Promise<APIResponseDataSourceList> {
    const response = await apiClient.dataSources.getApisV1DatasourceVolcengine({
      skip: 0,
      limit: 1000,
    });
    return response;
  },

  /**
   * Delete Zabbix data source
   *
   * @returns Returns result object in format { success: boolean; error?: Error }
   */
  async deleteZabbixDataSource(
    id: string,
  ): Promise<{ success: boolean; error?: Error }> {
    try {
      await apiClient.dataSources.deleteApisV1DatasourceZabbix({
        datasourceId: id,
      });
      return { success: true };
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      return { success: false, error: errorObj };
    }
  },

  /**
   * Delete Aliyun data source
   *
   * @returns Returns result object in format { success: boolean; error?: Error }
   */
  async deleteAliyunDataSource(
    id: string,
  ): Promise<{ success: boolean; error?: Error }> {
    try {
      await apiClient.dataSources.deleteApisV1DatasourceAliyun({
        datasourceId: id,
      });
      return { success: true };
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      return { success: false, error: errorObj };
    }
  },

  /**
   * Delete Volcengine data source
   *
   * @returns Returns result object in format { success: boolean; error?: Error }
   */
  async deleteVolcengineDataSource(
    id: string,
  ): Promise<{ success: boolean; error?: Error }> {
    try {
      await apiClient.dataSources.deleteApisV1DatasourceVolcengineDatasourceId({
        datasourceId: id,
      });
      return { success: true };
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      return { success: false, error: errorObj };
    }
  },

  /**
   * Delete data source by type
   *
   * @returns Returns result object in format { success: boolean; error?: Error }
   */
  async deleteDataSourceByType(
    type: DataSourceType,
    id: string,
  ): Promise<{ success: boolean; error?: Error }> {
    switch (type) {
      case 'Zabbix':
        return this.deleteZabbixDataSource(id);
      case 'Aliyun':
        return this.deleteAliyunDataSource(id);
      case 'Volcengine':
        return this.deleteVolcengineDataSource(id);
      default: {
        const errorObj = new Error(`不支持的数据源类型: ${type}`);
        return { success: false, error: errorObj };
      }
    }
  },

  /**
   * Get data source list by type
   */
  async getDataSourcesByType(type: DataSourceType): Promise<DataSource[]> {
    switch (type) {
      case "Zabbix": {
        const response = await this.getZabbixDataSources();
        return response.data || [];
      }
      case "Aliyun": {
        const response = await this.getAliyunDataSources();
        return response.data || [];
      }
      case "Volcengine": {
        const response = await this.getVolcengineDataSources();
        return response.data || [];
      }
      default:
        throw new Error(`不支持的数据源类型: ${type}`);
    }
  },
};
