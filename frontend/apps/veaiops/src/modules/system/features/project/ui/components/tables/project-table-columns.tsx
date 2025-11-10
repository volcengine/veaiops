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
 * Project table column configuration
 *
 * Abstract column configuration logic separately to improve code maintainability
 * Business side can customize column configuration by modifying this file
 */

import { Button, Popconfirm } from '@arco-design/web-react';
import { IconDelete } from '@arco-design/web-react/icon';
import { CellRender } from '@veaiops/components';
import type { Project } from 'api-generate';
import { useCallback } from 'react';

const { InfoWithCode, CustomOutlineTag, StampTime } = CellRender;

/**
 * Project table column configuration parameters
 */
export interface ProjectTableColumnsConfig {
  /** Delete handler (returns void, used for action column) */
  onDelete?: (id: string) => Promise<boolean>;
}

/**
 * Project table column configuration Hook
 *
 * @param config Column configuration parameters
 * @returns Column configuration function
 */
export const useProjectTableColumns = ({
  onDelete,
}: ProjectTableColumnsConfig) => {
  return useCallback(
    (_props: Record<string, unknown>) => [
      {
        title: 'Project Information',
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
        title: 'Status',
        dataIndex: 'is_active',
        key: 'is_active',
        width: 100,
        render: (isActive: boolean) => (
          <CustomOutlineTag>{isActive ? 'Active' : 'Inactive'}</CustomOutlineTag>
        ),
      },
      {
        title: 'Created At',
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
        title: 'Updated At',
        dataIndex: 'updated_at',
        key: 'updated_at',
        width: 180,
        render: (createdAt: string) => (
          <StampTime
            time={new Date(createdAt).getTime()}
            template="YYYY-MM-DD HH:mm:ss"
          />
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 120,
        fixed: 'right',
        render: (_: unknown, record: Project) => {
          const canDelete = true; // Can determine if deletion is allowed based on business logic
          const deleteReason = ''; // Deletion reason

          return canDelete ? (
            <Popconfirm
              title="Confirm Delete"
              content={`Are you sure you want to delete project "${record.name}"? This action cannot be undone.`}
              onOk={async () => {
                await onDelete?.(record.project_id || '');
                // Delete operation will be auto refreshed by operationWrapper, no need to manually refresh
              }}
              okText="Confirm Delete"
              cancelText="Cancel"
            >
              <Button
                type="text"
                size="small"
                status="danger"
                icon={<IconDelete />}
              >
                Delete
              </Button>
            </Popconfirm>
          ) : (
            <Button
              type="text"
              size="small"
              status="danger"
              icon={<IconDelete />}
              disabled
              title={deleteReason || 'Cannot delete'}
            >
              Delete
            </Button>
          );
        },
      },
    ],
    [onDelete],
  );
};
