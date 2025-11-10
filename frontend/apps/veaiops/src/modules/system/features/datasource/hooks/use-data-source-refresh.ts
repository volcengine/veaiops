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

import { logger, useManagementRefresh } from '@veaiops/utils';
import type { RefObject } from 'react';
import type { MonitorTableRef } from '../ui/components/tables/monitor-table';

interface UseDataSourceRefreshParams {
  volcengineTableRef: RefObject<MonitorTableRef>;
  aliyunTableRef: RefObject<MonitorTableRef>;
  zabbixTableRef: RefObject<MonitorTableRef>;
}

export const useDataSourceRefresh = ({
  volcengineTableRef,
  aliyunTableRef,
  zabbixTableRef,
}: UseDataSourceRefreshParams) => {
  const volcengineRefresh = useManagementRefresh(async () => {
    if (volcengineTableRef.current?.refresh) {
      const result = await volcengineTableRef.current.refresh();
      if (!result.success && result.error) {
        logger.warn({
          message: 'Volcengine 表格刷新失败',
          data: {
            error: result.error.message,
            stack: result.error.stack,
            errorObj: result.error,
          },
          source: 'DataSource',
          component: 'volcengineRefresh',
        });
      }
    }
  });

  const aliyunRefresh = useManagementRefresh(async () => {
    if (aliyunTableRef.current?.refresh) {
      const result = await aliyunTableRef.current.refresh();
      if (!result.success && result.error) {
        logger.warn({
          message: 'Aliyun 表格刷新失败',
          data: {
            error: result.error.message,
            stack: result.error.stack,
            errorObj: result.error,
          },
          source: 'DataSource',
          component: 'aliyunRefresh',
        });
      }
    }
  });

  const zabbixRefresh = useManagementRefresh(async () => {
    if (zabbixTableRef.current?.refresh) {
      const result = await zabbixTableRef.current.refresh();
      if (!result.success && result.error) {
        logger.warn({
          message: 'Zabbix 表格刷新失败',
          data: {
            error: result.error.message,
            stack: result.error.stack,
            errorObj: result.error,
          },
          source: 'DataSource',
          component: 'zabbixRefresh',
        });
      }
    }
  });

  return {
    volcengineRefresh,
    aliyunRefresh,
    zabbixRefresh,
  };
};

