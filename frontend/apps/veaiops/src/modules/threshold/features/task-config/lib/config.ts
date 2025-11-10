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
 * Intelligent threshold task configuration management configuration
 */
// Import datasource types from constants package
import { DATASOURCE_TYPES } from "@veaiops/constants";

export const TASK_CONFIG_MANAGEMENT_CONFIG = {
  title: "智能阈值任务配置",
  description: "管理智能阈值任务的创建、执行、监控和告警规则配置",

  // Table configuration
  table: {
    rowKey: "_id",
    size: "default" as const,
    bordered: false,
    stripe: true,
    showHeader: true,

    // Pagination configuration
    pagination: {
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 50, 100],
      showTotal: true,
      showJumper: true,
      showSizeChanger: true,
    },

    // Scroll configuration
    scroll: {
      x: "max-content",
    },
  },

  // Action button configuration
  actions: {
    create: {
      text: "创建任务",
      type: "primary" as const,
      icon: "IconPlus",
    },
    batchRerun: {
      text: "批量重新执行",
      type: "default" as const,
      icon: "IconRefresh",
    },
    export: {
      text: "导出",
      type: "default" as const,
      icon: "IconDownload",
    },
  },

  // Filter configuration
  filters: {
    showReset: true,
    showSearch: true,
    collapsed: false,
  },

  // Status configuration
  status: {
    Unknown: { color: "gray", text: "未知" },
    Launching: { color: "blue", text: "启动中" },
    Running: { color: "green", text: "运行中" },
    Stopped: { color: "red", text: "已停止" },
    Success: { color: "green", text: "成功" },
    Failed: { color: "red", text: "失败" },
  },

  // Datasource type configuration
  datasourceTypes: {
    Volcengine: { color: "blue", text: "火山引擎" },
    Aliyun: { color: "orange", text: "阿里云" },
    Zabbix: { color: "purple", text: "Zabbix" },
  },

  // API configuration
  api: {
    baseUrl: "/apis/v1/intelligent_threshold",
    endpoints: {
      list: "/task/list",
      create: "/task/",
      update: "/task/{id}",
      delete: "/task/{id}",
      rerun: "/task/rerun",
      versions: "/task/versions/",
      syncAlarm: "/alarm/sync",
    },
  },

  // Form configuration
  form: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    layout: "horizontal" as const,
  },

  // Drawer configuration
  drawer: {
    width: 800,
    placement: "right" as const,
    maskClosable: false,
  },

  // Modal configuration
  modal: {
    width: 600,
    maskClosable: false,
  },
} as const;

/**
 * Default query parameters
 */
export const DEFAULT_QUERY = {
  page: 1,
  pageSize: 20,
  datasourceType: "Volcengine",
} as const;

/**
 * Table column width configuration
 */
export const COLUMN_WIDTHS = {
  taskName: 200,
  datasourceType: 120,
  status: 100,
  productId: 100,
  accountId: 150,
  autoUpdate: 100,
  latestVersion: 120,
  createUser: 180,
  createdAt: 160,
  updatedAt: 160,
  actions: 200,
} as const;

/**
 * Operation type enumeration
 */
export const OPERATION_TYPES = {
  CREATE: "create",
  RERUN: "rerun",
  VERSIONS: "versions",
  RESULTS: "results",
  COPY: "copy",
} as const;

/**
 * Task status enumeration
 */
export const TASK_STATUS = {
  UNKNOWN: "Unknown",
  LAUNCHING: "Launching",
  RUNNING: "Running",
  STOPPED: "Stopped",
  SUCCESS: "Success",
  FAILED: "Failed",
} as const;

// Re-export datasource types
export { DATASOURCE_TYPES };
