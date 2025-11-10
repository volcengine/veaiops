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

import { Badge, Space, Tabs } from '@arco-design/web-react';
import { DATA_SOURCE_TYPES } from '@datasource/lib';
import type { DataSource } from 'api-generate';
import { MonitorTable } from '../../components';
import { getTableRef } from '../config';
import type { DataSourceConfig, TableRefMap } from '../types';

const { TabPane } = Tabs;

/**
 * Helper function to render data source TabPane
 *
 * Note: Cannot use component wrapper, because Arco Tabs uses React.Children.forEach
 * Only recognizes direct child elements, must call this function directly inside Tabs
 */
export const renderDataSourceTabs = (
  dataSourceConfigs: DataSourceConfig[],
  tableRefMap: TableRefMap,
  onEdit: (dataSource: DataSource) => void,
) => {
  return dataSourceConfigs.map((config) => {
    const dataSourceConfig =
      DATA_SOURCE_TYPES[config.type as keyof typeof DATA_SOURCE_TYPES];
    return (
      <TabPane
        key={config.key}
        title={
          <Space>
            {dataSourceConfig.label}
            <Badge count={0} />
          </Space>
        }
      >
        <MonitorTable
          ref={getTableRef(config.tableRefKey, tableRefMap)}
          onEdit={onEdit}
          onDelete={config.deleteHandler}
          dataSourceType={config.type}
        />
      </TabPane>
    );
  });
};
