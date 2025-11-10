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
import { IconDelete } from '@arco-design/web-react/icon';
import { canDeleteProject, getDeleteRestrictionReason } from '@project';
import { CellRender, type ModernTableColumnProps } from '@veaiops/components';
import type { Project } from 'api-generate';
import type React from 'react';
import type { GetProjectTableColumnsParams } from '../types';

// Destructure CellRender components to avoid repeated calls
const { CustomOutlineTag } = CellRender;
const { InfoWithCode, StampTime } = CellRender;

/**
 * Get project table column configuration
 */
export const getProjectTableColumns = ({
  onEdit: _onEdit,
  onDelete,
  onToggleStatus: _onToggleStatus,
}: GetProjectTableColumnsParams = {}): ModernTableColumnProps<Project>[] => [
  {
    title: '项目信息',
    dataIndex: 'name',
    key: 'name',
    width: 250,
    fixed: 'left' as const,
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
    render: (_: unknown, record: Project) => {
      if (!onDelete) {
        return null;
      }

      const canDelete = canDeleteProject(record);
      const deleteReason = getDeleteRestrictionReason(record);

      return canDelete ? (
        <Popconfirm
          title="确认删除"
          content={`确定要删除项目"${record.name}"吗？此操作不可恢复。`}
          onOk={async () => {
            // Delete operation will be auto refreshed by operationWrapper, no need to manually refresh
            await onDelete(record.project_id || '');
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
      ) : (
        <Button
          type="text"
          size="small"
          status="danger"
          icon={<IconDelete />}
          disabled
          title={deleteReason || '无法删除'}
        >
          删除
        </Button>
      );
    },
  },
];
