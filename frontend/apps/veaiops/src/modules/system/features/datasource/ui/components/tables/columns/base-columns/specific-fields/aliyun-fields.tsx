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

import type { DataSourceType } from '@/modules/system/features/datasource/lib';
import type { ModernTableColumnProps } from '@veaiops/components';
import { CellRender } from '@veaiops/components';
import type { DataSource } from 'api-generate';
import { renderAliyunInstancesList } from '../../../../renderers/providers/aliyun/instances-modal';
import { getConfigData } from '../utils';

/**
 * Create Aliyun-specific field columns
 */
export const createAliyunFields = (
  dataSourceType: DataSourceType,
): ModernTableColumnProps<DataSource>[] => [
  {
    title: '地域',
    key: 'region',
    dataIndex: 'region',
    width: 100,
    align: 'center',
    render: (_: unknown, record: DataSource) => {
      const configData = getConfigData({ record, dataSourceType });
      const region = configData?.region;
      if (!region) {
        return <CellRender.Ellipsis text="-" />;
      }
      return <CellRender.Ellipsis text={String(region)} />;
    },
  },
  {
    title: '命名空间',
    key: 'namespace',
    dataIndex: 'namespace',
    width: 120,
    align: 'center',
    render: (_: unknown, record: DataSource) => {
      const configData = getConfigData({ record, dataSourceType });
      const namespace = configData?.namespace;
      if (!namespace) {
        return <CellRender.Ellipsis text="-" />;
      }
      return <CellRender.Ellipsis text={String(namespace)} />;
    },
  },
  {
    title: '维度',
    key: 'group_by',
    dataIndex: 'group_by',
    width: 100,
    align: 'center',
    render: (_: unknown, record: DataSource) => {
      const configData = getConfigData({ record, dataSourceType });
      const groupBy = configData?.group_by;
      if (!groupBy) {
        return <CellRender.Ellipsis text="-" />;
      }
      return <CellRender.Ellipsis text={String(groupBy)} />;
    },
  },
  {
    title: '实例列表',
    key: 'dimensions',
    dataIndex: 'dimensions',
    width: 150,
    align: 'center',
    render: (_: unknown, record: DataSource) => {
      const configData = getConfigData({ record, dataSourceType });
      const dimensions = configData?.dimensions;
      return renderAliyunInstancesList(dimensions);
    },
  },
];
