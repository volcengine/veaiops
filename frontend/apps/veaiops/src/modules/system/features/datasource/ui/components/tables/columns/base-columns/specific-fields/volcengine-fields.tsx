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
import { renderInstances } from '../../../../renderers/core/instance-renderer';
import { getConfigData } from '../utils';

/**
 * Create Volcengine-specific field columns
 */
export const createVolcengineFields = (
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
      return <CellRender.Ellipsis text={String(region)} center />;
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
      return <CellRender.Ellipsis text={String(namespace)} center />;
    },
  },
  {
    title: '子命名空间',
    key: 'sub_namespace',
    dataIndex: 'sub_namespace',
    width: 120,
    align: 'center',
    render: (_: unknown, record: DataSource) => {
      const configData = getConfigData({ record, dataSourceType });
      const subNamespace = configData?.sub_namespace;
      return <CellRender.Ellipsis text={String(subNamespace)} center />;
    },
  },
  {
    title: '实例列表',
    key: 'instances',
    dataIndex: 'instances',
    width: 150,
    align: 'center',
    render: (_: unknown, record: DataSource) => {
      const configData = getConfigData({ record, dataSourceType });
      const instances = configData?.instances;
      return renderInstances(instances);
    },
  },
];
