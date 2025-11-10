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

import {
  CellRender,
  type ModernTableColumnProps,
} from '@veaiops/components';
import type { DataSource, DataSourceType } from 'api-generate';
import type React from 'react';
import { getConfigData } from '../../config-data-utils';

/**
 * Create base config field columns (all data sources have)
 */
export const createBaseConfigFields = (
  dataSourceType: DataSourceType,
): ModernTableColumnProps<DataSource>[] => {
  const { Ellipsis } = CellRender;

  return [
    {
      title: '连接名称',
      key: 'connect_name',
      width: 120,
      align: 'center' as const,
      render: (_: unknown, record: DataSource) => {
        const configData = getConfigData({ record, dsType: dataSourceType });
        const connectName =
          (configData as Record<string, unknown>)?.connect_name || record.name;
        if (!connectName) {
          return <Ellipsis text="-" />;
        }
        return <Ellipsis text={String(connectName)} />;
      },
    },
    {
      title: '监控项',
      key: 'metric_name',
      width: 120,
      align: 'center' as const,
      render: (_: unknown, record: DataSource) => {
        const configData = getConfigData({ record, dsType: dataSourceType });
        const metricName = (configData as Record<string, unknown>)?.metric_name;
        if (!metricName) {
          return <Ellipsis text="-" />;
        }
        return <Ellipsis text={String(metricName)} />;
      },
    },
  ];
};
