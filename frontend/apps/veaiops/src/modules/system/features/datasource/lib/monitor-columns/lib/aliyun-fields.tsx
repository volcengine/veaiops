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

import { CellRender, type ModernTableColumnProps } from '@veaiops/components';
import type { DataSource, DataSourceType } from 'api-generate';
import type React from 'react';
import { getConfigData } from '../../config-data-utils';

/**
 * Create Aliyun specific field columns
 *
 * @param dataSourceType - Data source type
 * @returns Aliyun specific field column array
 */
export const createAliyunSpecificFields = (
  dataSourceType: DataSourceType,
): ModernTableColumnProps<DataSource>[] => {
  const { Ellipsis } = CellRender;

  return [
    {
      title: '地域',
      key: 'region',
      width: 100,
      align: 'center' as const,
      render: (_: unknown, record: DataSource) => {
        const configData = getConfigData({ record, dsType: dataSourceType });
        const region = (configData as Record<string, unknown>)?.region;
        if (!region) {
          return <Ellipsis text="-" />;
        }
        return <Ellipsis text={String(region)} />;
      },
    },
    {
      title: '命名空间',
      key: 'namespace',
      width: 120,
      align: 'center' as const,
      render: (_: unknown, record: DataSource) => {
        const configData = getConfigData({ record, dsType: dataSourceType });
        const namespace = (configData as Record<string, unknown>)?.namespace;
        if (!namespace) {
          return <Ellipsis text="-" />;
        }
        return <Ellipsis text={String(namespace)} />;
      },
    },
    {
      title: '维度',
      key: 'group_by',
      width: 100,
      align: 'center' as const,
      render: (_: unknown, record: DataSource) => {
        const configData = getConfigData({ record, dsType: dataSourceType });
        const groupBy = (configData as Record<string, unknown>)?.group_by;
        if (!groupBy) {
          return <Ellipsis text="-" />;
        }
        return <Ellipsis text={String(groupBy)} />;
      },
    },
    {
      title: '实例列表',
      key: 'dimensions',
      width: 150,
      align: 'center' as const,
      render: (_: unknown, record: DataSource) => {
        const configData = getConfigData({ record, dsType: dataSourceType });
        const dimensions = (configData as Record<string, unknown>)?.dimensions;
        // Simplified rendering, show count if dimension list exists
        if (Array.isArray(dimensions) && dimensions.length > 0) {
          return <Ellipsis text={`${dimensions.length} 个实例`} />;
        }
        return <Ellipsis text="-" />;
      },
    },
  ];
};
