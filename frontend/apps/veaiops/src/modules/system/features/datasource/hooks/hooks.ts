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
 * Monitor data source management related custom Hooks
 */

import { Message } from '@arco-design/web-react';
import { DataSourceType } from 'api-generate';
import { useCallback, useState } from 'react';
import { DataSourceApiService } from '../lib/api-service';
import type { MonitorItem } from '../lib/types';
import { transformDataSourceToMonitorItem } from '../lib/utils';

/**
 * Monitor data source management Hook
 */
export const useDataSourceManagement = (type: DataSourceType) => {
  const [data, setData] = useState<MonitorItem[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Get data source list
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await DataSourceApiService.getDataSourcesByType(type);

      const transformedData = response.map((ds) =>
        transformDataSourceToMonitorItem(ds, type),
      );

      setData(transformedData);
    } catch (error: unknown) {
      // ✅ Correct: Extract actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = errorObj.message || `获取${type}数据源失败，请重试`;
      Message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [type]);

  /**
   * Delete data source
   */
  const deleteDataSource = useCallback(
    async (id: string) => {
      const result = await DataSourceApiService.deleteDataSourceByType(
        type,
        id,
      );
      if (result.success) {
        Message.success('删除成功');
        await fetchData(); // Re-fetch data
      } else if (result.error) {
        const errorMessage =
          result.error instanceof Error
            ? result.error.message
            : '删除失败，请重试';
        Message.error(errorMessage);
      }
    },
    [type, fetchData],
  );

  return {
    data,
    loading,
    fetchData,
    deleteDataSource,
  };
};

/**
 * Zabbix data source Hook
 */
export const useZabbixDataSource = () => {
  // ✅ Type safe: Use enum value instead of string literal
  return useDataSourceManagement(DataSourceType.ZABBIX);
};

/**
 * Aliyun data source Hook
 */
export const useAliyunDataSource = () => {
  // ✅ Type safe: Use enum value instead of string literal
  return useDataSourceManagement(DataSourceType.ALIYUN);
};

/**
 * Volcengine data source Hook
 */
export const useVolcengineDataSource = () => {
  // ✅ Type safe: Use enum value instead of string literal
  return useDataSourceManagement(DataSourceType.VOLCENGINE);
};

/**
 * Detail view Hook
 */
export const useDetailView = () => {
  const [visible, setVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<MonitorItem | null>(null);

  const showDetail = useCallback((item: MonitorItem) => {
    setCurrentItem(item);
    setVisible(true);
  }, []);

  const hideDetail = useCallback(() => {
    setVisible(false);
    setCurrentItem(null);
  }, []);

  return {
    visible,
    currentItem,
    showDetail,
    hideDetail,
  };
};
