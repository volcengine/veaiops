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

import React from "react";
import {
  Button,
  Space,
  Popconfirm,
  Switch,
  Badge,
} from "@arco-design/web-react";
import { CellRender } from "@veaiops/components";
import { IconEdit, IconDelete, IconEye } from "@arco-design/web-react/icon";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import type {
  MonitorIntervention,
  MonitorInterventionTableData,
} from "./types";

// Destructure CellRender component to avoid repeated calls
const { CustomOutlineTag } = CellRender;

/**
 * Monitor intervention table column configuration
 * Implemented according to CustomTable's handleColumns pattern
 */
export const getMonitorColumns = (props: {
  onEdit: (monitor: MonitorIntervention) => void;
  onDelete: (monitorId: string) => Promise<boolean>;
  onViewDetail: (monitor: MonitorIntervention) => void;
  onToggleEnabled?: (monitorId: string, enabled: boolean) => Promise<boolean>;
}): ColumnProps<MonitorInterventionTableData>[] => {
  const { onEdit, onDelete, onViewDetail, onToggleEnabled } = props;

  return [
    {
      title: "监控名称",
      dataIndex: "name",
      key: "name",
      width: 200,
      ellipsis: true,
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      width: 250,
      ellipsis: true,
      render: (value: string) => value || "-",
    },
    {
      title: "监控类型",
      dataIndex: "monitor_type",
      key: "monitor_type",
      width: 120,
      render: (value: string) => {
        const typeMap = {
          metric: { text: "指标", color: "blue" },
          log: { text: "日志", color: "green" },
          trace: { text: "链路", color: "purple" },
          event: { text: "事件", color: "orange" },
        };
        const config = typeMap[value as keyof typeof typeMap] || {
          text: value,
          color: "gray",
        };
        return <CustomOutlineTag>{config.text}</CustomOutlineTag>;
      },
    },
    {
      title: "数据源",
      dataIndex: "data_source",
      key: "data_source",
      width: 150,
      ellipsis: true,
    },
    {
      title: "告警规则数",
      dataIndex: "alert_rules",
      key: "alert_rules_count",
      width: 100,
      render: (rules: any[]) => (
        <Badge
          count={rules?.length || 0}
          style={{ backgroundColor: "#165DFF" }}
        />
      ),
    },
    {
      title: "状态",
      dataIndex: "enabled",
      key: "enabled",
      width: 80,
      render: (enabled: boolean, record: MonitorInterventionTableData) => (
        <Switch
          checked={enabled}
          size="small"
          onChange={async (checked) => {
            if (onToggleEnabled) {
              await onToggleEnabled(record.id, checked);
            }
          }}
        />
      ),
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      sorter: true,
      render: (value: string) => {
        if (!value) {
          return "-";
        }
        return new Date(value).toLocaleString("zh-CN");
      },
    },
    {
      title: "更新时间",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 180,
      sorter: true,
      render: (value: string) => {
        if (!value) {
          return "-";
        }
        return new Date(value).toLocaleString("zh-CN");
      },
    },
    {
      title: "操作",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (_, record: MonitorInterventionTableData) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<IconEye />}
            onClick={() => onViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="text"
            size="small"
            icon={<IconEdit />}
            onClick={() => onEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个监控介入吗？"
            onOk={async () => {
              await onDelete(record.id);
            }}
            okText="确定"
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
        </Space>
      ),
    },
  ];
};
