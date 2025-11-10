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
import type { DataSource, DataSourceType } from 'api-generate';
import type React from 'react';
import { MonitorTable, type MonitorTableRef } from '../tables';

const { TabPane } = Tabs;

interface DataSourceTabProps {
  tabKey: string;
  dataSourceType: DataSourceType;
  onEdit: (dataSource: DataSource) => void;
  onDelete: (
    monitorId: string,
    dataSourceType?: DataSourceType,
  ) => Promise<boolean>;
  tableRef: React.RefObject<MonitorTableRef>;
  count?: number;
}

/**
 * Data source Tab component
 */
export const DataSourceTab: React.FC<DataSourceTabProps> = ({
  tabKey,
  dataSourceType,
  onEdit,
  onDelete,
  tableRef,
  count = 0,
}) => {
  const dataSourceConfig =
    DATA_SOURCE_TYPES[dataSourceType as keyof typeof DATA_SOURCE_TYPES];

  return (
    <TabPane
      key={tabKey}
      title={
        <Space>
          {dataSourceConfig.label}
          <Badge count={count} />
        </Space>
      }
    >
      <MonitorTable
        ref={tableRef}
        onEdit={onEdit}
        onDelete={(monitorId) => onDelete(monitorId, dataSourceType)}
        dataSourceType={dataSourceType}
      />
    </TabPane>
  );
};
