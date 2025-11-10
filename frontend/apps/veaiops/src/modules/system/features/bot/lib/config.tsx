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

import { Button } from "@arco-design/web-react";
import { IconPlus } from "@arco-design/web-react/icon";
import React from "react";

/**
 * Bot management page configuration
 */
export const BOT_MANAGEMENT_CONFIG = {
  // Page title
  title: "群聊机器人管理",

  // Table configuration
  table: {
    scroll: { x: 1200 },
    pagination: {
      pageSize: 10,
      showTotal: (total: number) => `共 ${total} 条记录`,
      sizeCanChange: true,
      sizeOptions: [10, 20, 50] as number[],
    },
  },

  // Action button configuration
  actions: {
    add: {
      text: "新增Bot",
      type: "primary" as const,
      icon: IconPlus,
    },
  },

  // Form configuration
  form: {
    layout: "vertical" as const,
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  },

  // Message configuration
  messages: {
    create: {
      success: "机器人创建成功",
      error: "创建失败，请重试",
    },
    update: {
      success: "机器人更新成功",
      error: "更新失败，请重试",
    },
    delete: {
      success: "机器人删除成功",
      error: "删除失败，请重试",
    },
    load: {
      error: "加载机器人列表失败，请重试",
    },
    validation: {
      botIdRequired: "App ID 不能为空",
    },
  },
} as const;

/**
 * Message constants export (for easy import in other files)
 */
export const BOT_MESSAGES = BOT_MANAGEMENT_CONFIG.messages;

/**
 * Create action button configuration
 */
export const createActionButtons = (onAdd: () => void): React.ReactNode[] => [
  <Button
    key="add"
    type={BOT_MANAGEMENT_CONFIG.actions.add.type}
    icon={<BOT_MANAGEMENT_CONFIG.actions.add.icon />}
    onClick={onAdd}
  >
    {BOT_MANAGEMENT_CONFIG.actions.add.text}
  </Button>,
];

/**
 * Get table properties configuration
 */
export const getTableProps = () => ({
  ...BOT_MANAGEMENT_CONFIG.table,
});
