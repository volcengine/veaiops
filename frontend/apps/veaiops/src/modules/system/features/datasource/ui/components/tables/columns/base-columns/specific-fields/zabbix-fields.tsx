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
import { renderTargets } from '../../../../renderers/core/target-renderer';
import { getConfigData } from '../utils';

/**
 * Create Zabbix-specific field columns
 */
export const createZabbixFields = (
  dataSourceType: DataSourceType,
): ModernTableColumnProps<DataSource>[] => [
  {
    title: '主机列表',
    key: 'targets',
    dataIndex: 'targets',
    width: 150,
    align: 'center',
    render: (_: unknown, record: DataSource) => {
      const configData = getConfigData({ record, dataSourceType });
      const targets = configData?.targets;
      return renderTargets(targets);
    },
  },
];
