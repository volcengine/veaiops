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

import { Button, Popconfirm } from '@arco-design/web-react';
import type { TableProps } from '@arco-design/web-react';
import { IconDelete, IconPlus, IconUpload } from '@arco-design/web-react/icon';
import { PROJECT_MANAGEMENT_CONFIG, getProjectList } from '@project';
import {
  CellRender,
  type CustomTableActionType,
  type ModernTableColumnProps,
} from '@veaiops/components';
import type { TableDataSource } from '@veaiops/types';
import type { Project } from 'api-generate';
import React, { useRef } from 'react';

/**
 * Options type for Project Table Hook
 */
export interface UseProjectTableOptions {
  onDelete: (projectId: string) => Promise<boolean>;
  onImport: () => void;
  onCreate: () => void;
}

/**
 * Return type for Project Table Hook
 */
export interface UseProjectTableReturn {
  customTableProps: {
    /** CustomTable ref for calling refresh and other methods */
    ref: React.RefObject<CustomTableActionType<Project>>;
    /** Data source configuration */
    dataSource: TableDataSource<Project, Record<string, unknown>>;
    /** Table properties configuration */
    tableProps: TableProps<Project>;
  };
  handleColumns: (
    ctx: Record<string, unknown>,
  ) => ModernTableColumnProps<Project>[];
  renderActions: () => React.ReactNode[];
}

/**
 * Handle column configuration
 */
const getProjectColumns = (
  onDelete: (projectId: string) => Promise<boolean>,
): (() => ModernTableColumnProps<Project>[]) => {
  const { InfoWithCode, CustomOutlineTag, StampTime } = CellRender;

  return () => [
    {
      title: '项目信息',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (name: string, record: Project) => (
        <InfoWithCode
          name={name}
          code={record.project_id || record._id}
          isCodeShow={true}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: boolean) => (
        <CustomOutlineTag>{isActive ? '启用' : '禁用'}</CustomOutlineTag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (createdAt: string) => (
        <StampTime
          time={new Date(createdAt).getTime()}
          template="YYYY-MM-DD HH:mm:ss"
        />
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (updatedAt: string) => (
        <StampTime
          time={new Date(updatedAt).getTime()}
          template="YYYY-MM-DD HH:mm:ss"
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: Project) => (
        <Popconfirm
          title="确认删除"
          content={`确定要删除项目"${record.name}"吗？此操作不可恢复。`}
          onOk={async () => {
            await onDelete(record.project_id || '');
            // Delete operation will be auto refreshed by operationWrapper, no need to manually refresh
          }}
          okText="确认删除"
          cancelText="取消"
        >
          <Button
            type="text"
            size="small"
            status="danger"
            icon={<IconDelete />}
          >
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];
};

/**
 * Project table aggregation Hook
 *
 * Aggregates all table-related logic into this Hook, including:
 * - tableRef management and refresh functionality
 * - Table configuration
 * - Column and filter configuration
 * - Action button configuration
 *
 * @param options - Hook configuration options
 * @returns Table configuration and handlers
 */
export const useProjectTable = ({
  onDelete,
  onImport,
  onCreate,
}: UseProjectTableOptions): UseProjectTableReturn => {
  // Table ref
  const tableRef = useRef<CustomTableActionType<Project>>(null);

  // Data source configuration
  const dataSource = React.useMemo(
    () => ({
      request: async (params: Record<string, unknown>) => {
        const { page_req, ...filters } = params;
        const { skip = 0, limit = 10 } =
          (page_req as { skip: number; limit: number }) || {};

        const result = await getProjectList({
          skip,
          limit,
          name: filters.name as string,
          project_id: filters.project_id as string,
          is_active: filters.is_active as boolean,
        });

        return {
          data: result.data,
          total: result.total,
          success: true,
        };
      },
    }),
    [],
  );

  // Table properties configuration
  const tableProps = React.useMemo(
    () => ({
      rowKey: '_id',
      scroll: { x: 1400 },
      pagination: {
        pageSize: PROJECT_MANAGEMENT_CONFIG.pageSize,
        showTotal: (total: number) => `共 ${total} 条记录`,
        showJumper: true,
        showSizeChanger: true,
        sizeOptions: [10, 20, 50, 100],
      },
    }),
    [],
  );

  // Column configuration
  const handleColumns = React.useCallback(
    (_ctx: Record<string, unknown>) => getProjectColumns(onDelete)(),
    [onDelete],
  );

  // Action button configuration
  const renderActions = React.useCallback(
    () => [
      <Button
        key="create"
        type="primary"
        icon={<IconPlus />}
        onClick={onCreate}
      >
        新建项目
      </Button>,
      <Button key="import" icon={<IconUpload />} onClick={onImport}>
        导入项目
      </Button>,
    ],
    [onCreate, onImport],
  );

  return {
    customTableProps: {
      ref: tableRef,
      dataSource,
      tableProps,
    },
    handleColumns,
    renderActions,
  };
};
