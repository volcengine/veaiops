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
 * Data source connection table component
 */

import { Empty } from '@arco-design/web-react';
import { CustomTable } from '@veaiops/components';
import { createLocalDataSource } from '@veaiops/utils';
import type { Connect } from 'api-generate';
import type React from 'react';
import { useMemo } from 'react';
import {
  type DataSourceConnectionTableProps,
  TABLE_CONFIG,
} from '../../../connection/lib';
import { getTableColumns } from './table-columns';
import { getTableFilters } from './table-filters';

/**
 * Data source connection table component
 */
export const ConnectionTable: React.FC<DataSourceConnectionTableProps> = ({
  type,
  connects,
  loading: _loading,
  selectedRowKeys = [],
  onSelectionChange,
  onRefresh: _onRefresh,
  onEdit,
  onDelete,
  onTest,
  onCreateMonitor,
}) => {
  // Create handleColumns function, pass operation callbacks to column configuration
  const handleColumns = (_props: Record<string, unknown>) => {
    return getTableColumns({
      type,
      onEdit,
      onDelete,
      onTest,
      onCreateMonitor,
    });
  };

  // Create handleFilters function
  const handleFilters = () => {
    return getTableFilters({
      type,
      onFilter: () => {}, // Provide default onFilter function
    });
  };

  // Create empty state component
  const emptyElement = (
    <div className="text-center py-10">
      <Empty />
    </div>
  );

  // Use createLocalDataSource to create local data source
  const dataSource = useMemo(
    () => createLocalDataSource({ dataList: connects }),
    [connects],
  );

  return (
    <CustomTable<Connect>
      handleColumns={handleColumns}
      handleFilters={handleFilters}
      dataSource={dataSource}
      tableProps={{
        rowKey: '_id',
        pagination: {
          pageSize: TABLE_CONFIG.PAGE_SIZE,
          showTotal: true,
          showJumper: true,
          sizeCanChange: true,
        },
        scroll: { x: TABLE_CONFIG.SCROLL_X },
        size: 'default',
        noDataElement: emptyElement,
        border: {
          wrapper: true,
          cell: true,
        },
      }}
    />
  );
};

export default ConnectionTable;
