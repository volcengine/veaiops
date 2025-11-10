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

import {
  Button,
  Popconfirm,
  Tooltip,
  Typography,
} from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { IconDelete } from "@arco-design/web-react/icon";
import type { Project } from 'api-generate';
import { CellRender } from "@veaiops/components";
import type { ProjectTableActions } from '@project/types';

// Destructure CellRender components to avoid repeated calls
const { CustomOutlineTag } = CellRender;

const { Ellipsis: EllipsisRender, StampTime: StampTimeRender } = CellRender;

const { Text } = Typography;

/**
 * Get project table column configuration
 */
export const getProjectTableColumns = (
  actions: ProjectTableActions
): ColumnProps<Project>[] => [
  {
    title: "Project ID",
    dataIndex: "project_id",
    key: "project_id",
    width: 200,
    render: (projectId: string) => <EllipsisRender text={projectId} />,
  },
  {
    title: "Project Name",
    dataIndex: "name",
    key: "name",
    width: 300,
    render: (name: string) => <Text className="font-bold">{name}</Text>,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 100,
    render: (status: string, record: Project) => (
      <CustomOutlineTag className="rounded-xl">
        {record.is_active ? "Active" : "Inactive"}
      </CustomOutlineTag>
    ),
  },
  {
    title: "Created At",
    dataIndex: "created_at",
    key: "created_at",
    width: 180,
    render: (createdAt: string) => (
      <StampTimeRender
        time={createdAt ? new Date(createdAt).getTime() : undefined}
      />
    ),
  },
  {
    title: "Updated At",
    dataIndex: "updated_at",
    key: "updated_at",
    width: 180,
    render: (updatedAt: number) => <StampTimeRender time={updatedAt} />,
  },
  {
    title: "Actions",
    key: "actions",
    width: 150,
    fixed: "right" as const,

    render: (_: unknown, record: Project) => (
      <Popconfirm
        title="Confirm Delete"
        content={`Are you sure you want to delete project "${record.name}"? This action cannot be undone.`}
        onOk={() => actions.onDelete(record.project_id || "")}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ status: "danger" }}
      >
        <Tooltip content="Delete Project">
          <Button
            type="text"
            size="small"
            status="danger"
            icon={<IconDelete />}
            data-testid="delete-project-btn"
          />
        </Tooltip>
      </Popconfirm>
    ),
  },
];
