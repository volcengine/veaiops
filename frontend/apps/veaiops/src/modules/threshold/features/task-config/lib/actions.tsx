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

import { IntelligentThresholdTask } from "api-generate";
import { ButtonConfiguration, ButtonGroupRender } from "@veaiops/components";
import { IconCopy, IconDelete, IconEye } from "@arco-design/web-react/icon";
import type { TaskTableActions } from "./types";

/**
 * Actions column render
 */
export const renderActions = (
  record: IntelligentThresholdTask,
  actions: TaskTableActions
) => {
  const buttonConfigurations: ButtonConfiguration[] = [
    {
      text: "查看任务详情",
      dataTestId: "view-task-details-btn",
      buttonProps: {
        icon: <IconEye />,
      },
      onClick: () => {
        actions.onTaskDetail(record);
      },
    },
    {
      text: "复制任务",
      dataTestId: "copy-task-btn",
      buttonProps: {
        icon: <IconCopy />,
      },
      onClick: () => {
        actions.onCopy(record);
      },
    },
    {
      text: "删除任务",
      dataTestId: "delete-task-btn",
      supportPopConfirm: true,
      popConfirmTitle: "确定要删除这个任务吗？",
      popConfirmContent: "删除后将无法恢复，该任务的所有版本记录也将被删除。",
      popconfirmProps: {
        okText: "确定",
        cancelText: "取消",
      },
      buttonProps: {
        status: "danger",
        icon: <IconDelete />,
      },
      onClick: async () => {
        if (record._id && actions.onDelete) {
          await actions.onDelete(record._id);
        }
      },
    },
  ];

  return (
    <ButtonGroupRender
      buttonConfigurations={buttonConfigurations}
      className="flex-nowrap"
      style={{ gap: "8px" }}
    />
  );
};
