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

import type { ModuleType } from '@/types/module';
import { CustomTable } from '@veaiops/components';
import type { SubscribeRelationWithAttributes } from 'api-generate';
import type React from 'react';
import { getSubscribeRelationFilters } from './filters';
import { useTableColumns } from './table-columns';
import {
  useSubscribeRelationActionConfig,
  useSubscribeRelationTableConfig,
} from './use-relation-table';

/**
 * Subscription relation table component props interface
 */
export interface SubscribeRelationTableProps {
  moduleType: ModuleType;
  title?: string;
  showModuleTypeColumn?: boolean;
  customActions?: (record: SubscribeRelationWithAttributes) => React.ReactNode;
  onCreate: () => void;
  onEdit: (record: SubscribeRelationWithAttributes) => void;
  onDelete: (recordId: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

/**
 * Subscription relation table component
 * Encapsulates table rendering logic, provides clear interface
 */
export const SubscribeRelationTable: React.FC<SubscribeRelationTableProps> = ({
  moduleType,
  title = '订阅关系',
  showModuleTypeColumn = true,
  customActions,
  onCreate,
  onEdit,
  onDelete,
  onRefresh,
  loading = false,
}) => {
  // Table configuration
  const { dataSource, tableProps } = useSubscribeRelationTableConfig({
    moduleType,
  });

  // Action button configuration
  const { actions: actionButtons } = useSubscribeRelationActionConfig({
    onCreate,
    onRefresh,
    loading,
  });

  // Get table column configuration
  const columns = useTableColumns({
    showModuleTypeColumn,
    customActions,
    onEdit,
    onDelete,
  });

  return (
    <CustomTable
      // Table title
      title={title}
      // Data source configuration
      dataSource={dataSource}
      // Base column configuration
      baseColumns={columns}
      // Filter handler function
      handleFilters={getSubscribeRelationFilters}
      // Use table props configuration returned by Hook
      tableProps={tableProps}
      // Action buttons
      actions={actionButtons}
      // Table style
      tableClassName="subscribe-relation-table"
    />
  );
};
