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

import type { ModernTableColumnProps } from "@veaiops/components";
import { CellRender } from "@veaiops/components";
import type { IntelligentThresholdTask } from "api-generate";
import { EMPTY_CONTENT } from "@veaiops/constants";
import type { TaskTableActions } from "./types";
import { renderDatasourceType, renderAutoUpdate } from "./renderers";
import { renderActions } from "./actions";

const { InfoWithCode, StampTime, TagEllipsis } = CellRender;

/**
 * Basic information column configuration
 */
export const getBasicColumns = (): ModernTableColumnProps<IntelligentThresholdTask>[] => [
  {
    title: "任务名称/ID",
    dataIndex: "task_name",
    key: "task_name",
    width: 200,
    render: (text: string, record: IntelligentThresholdTask) => (
      <InfoWithCode name={text} code={record._id} />
    ),
  },
  {
    title: "数据源类型",
    dataIndex: "datasource_type",
    key: "datasource_type",
    width: 80,
    align: "center",
    render: (value) => renderDatasourceType(value),
  },
];

/**
 * Resource information column configuration
 */
export const getResourceColumns = (): ModernTableColumnProps<IntelligentThresholdTask>[] => [
    {
      title: "项目",
      dataIndex: "projects",
      key: "projects",
      width: 150,
      render: (projects: string[] | undefined) => {
        if (!Array.isArray(projects) || !projects.length) {
          return EMPTY_CONTENT;
        }

        const dataList = projects.map((project: string, index: number) => ({
          name: project,
          key: `project-${index}`,
        }));

        return (
          <TagEllipsis
            dataList={dataList}
            maxCount={1}
            tagProps={{ size: "small" }}
          />
        );
      },
    },
  ];

/**
 * Configuration information column configuration
 */
export const getConfigColumns = (): ModernTableColumnProps<IntelligentThresholdTask>[] => [
  {
    title: "自动更新",
    dataIndex: "auto_update",
    key: "auto_update",
    width: 100,
    render: (value) => renderAutoUpdate(value),
  },
];

/**
 * Metadata column configuration
 */
export const getMetadataColumns = (): ModernTableColumnProps<IntelligentThresholdTask>[] => [
    // {
    //   title: 'Creator',
    //   dataIndex: 'createdUser',
    //   key: 'createdUser',
    //   width: 180,
    //   render: (text: string) => <Ellipsis text={text} />,
    // },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (created_at: string) => (
        <StampTime
          time={created_at}
        />
      ),
    },
    {
      title: "更新时间",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 160,
      render: (updated_at: string) => (
        <StampTime
          time={updated_at}
        />
      ),
    },
  ];

/**
 * Operation column configuration
 */
export const getActionColumn = (
  actions: TaskTableActions
): ModernTableColumnProps<IntelligentThresholdTask> => ({
  title: "操作",
  key: "actions",
  width: 300,
  fixed: "right",
  render: (_, record) => renderActions(record, actions),
});
