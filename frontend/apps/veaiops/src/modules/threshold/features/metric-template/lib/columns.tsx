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
import { Tooltip } from "@arco-design/web-react";
import {
  CellRender,
  ButtonConfiguration,
  ButtonGroupRender,
  type ModernTableColumnProps,
} from "@veaiops/components";
import {
  IconDelete,
  IconEdit,
} from "@arco-design/web-react/icon";
import type { MetricTemplate, MetricType } from "api-generate";
import {
  getMetricTypeTranslation,
  METRIC_TYPE_TRANSLATIONS,
} from "./metric-type-translations";

// Destructure CellRender component to avoid repeated calls
const { CustomOutlineTag } = CellRender;

// Table column width constants
const COLUMN_WIDTH = {
  SMALL_WIDTH: 100,
  DEFAULT_WIDTH: 120,
  MEDIUM_WIDTH: 150,
  LARGE_WIDTH: 200,
};

/**
 * Ellipsis component
 */
const Ellipsis: React.FC<{
  text: string | number | null | undefined;
  right?: boolean;
  center?: boolean;
  precision?: number;
  unit?: string;
}> = ({ text, right, center, precision, unit }) => {
  let displayText = text;

  if (typeof text === "number" && precision !== undefined) {
    displayText = text.toFixed(precision);
  }

  if (unit) {
    displayText = `${displayText}${unit}`;
  }

  let textAlign: "left" | "center" | "right" = "left";
  if (right) {
    textAlign = "right";
  } else if (center) {
    textAlign = "center";
  }

  const style: React.CSSProperties = {
    textAlign,
  };

  return (
    <Tooltip content={displayText}>
      <div style={style}>{displayText}</div>
    </Tooltip>
  );
};

/**
 * Enum render component
 */
const FrontEnum: React.FC<{ metricType: MetricType | string }> = ({
  metricType,
}) => {
  // Type check: ensure metricType is valid MetricType
  const validMetricType: MetricType =
    typeof metricType === 'string' &&
    metricType in METRIC_TYPE_TRANSLATIONS
      ? (metricType as MetricType)
      : (metricType as MetricType);
  return (
    <CustomOutlineTag>
      {getMetricTypeTranslation(validMetricType)}
    </CustomOutlineTag>
  );
};

/**
 * Get metric template table column configuration
 */
export const getMetricTemplateColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (template: MetricTemplate) => void;
  onDelete: (templateId: string) => Promise<boolean>;
}): ModernTableColumnProps<MetricTemplate>[] => [
  {
    dataIndex: "name",
    title: "模板名称",
    fixed: "left",
    width: COLUMN_WIDTH.LARGE_WIDTH,
    render: (col: string) => <Ellipsis text={col} />,
  },
  {
    dataIndex: "metric_type",
    title: "模板类型",
    width: COLUMN_WIDTH.SMALL_WIDTH,
    render: (col: MetricType) => <FrontEnum metricType={col} />,
  },
  {
    dataIndex: "max_value",
    title: "指标最大值(精确6位小数)",
    align: "right",
    width: COLUMN_WIDTH.MEDIUM_WIDTH + 20,
    render: (col: number) => <Ellipsis text={col} right precision={6} />,
  },
  {
    dataIndex: "min_value",
    title: "指标最小值(精确6位小数)",
    align: "right",
    width: COLUMN_WIDTH.MEDIUM_WIDTH + 20,
    render: (col: number) => <Ellipsis text={col} right precision={6} />,
  },
  {
    dataIndex: "normal_range_end",
    title: "默认阈值上界(精确6位小数)",
    align: "right",
    width: COLUMN_WIDTH.MEDIUM_WIDTH + 20,
    render: (col: number) => <Ellipsis text={col} right precision={6} />,
  },
  {
    dataIndex: "normal_range_start",
    title: "默认阈值下界(精确6位小数)",
    align: "right",
    width: COLUMN_WIDTH.MEDIUM_WIDTH + 20,
    render: (col: number) => <Ellipsis text={col} right precision={6} />,
  },
  {
    dataIndex: "action",
    title: "操作",
    key: "actions",
    fixed: "right",
    width: COLUMN_WIDTH.MEDIUM_WIDTH,
    render: (_: unknown, record: MetricTemplate) => {
      const buttonConfigurations: ButtonConfiguration[] = [];

      // Edit button
      buttonConfigurations.push({
        text: "编辑",
        onClick: () => {
          onEdit(record);
        },
        dataTestId: "edit-metric-template-btn",
        buttonProps: {
          type: "text",
          size: "small",
          icon: <IconEdit />,
        },
      });

      // Delete button
      buttonConfigurations.push({
        text: "删除",
        visible: true,
        disabled: false,
        dataTestId: "delete-metric-template-btn",
        supportPopConfirm: true,
        popConfirmTitle: "确认删除",
        popConfirmContent: "确定要删除这个指标模板吗？删除后无法恢复。",
        onClick: () => onDelete(record._id || ""),
        buttonProps: {
          type: "text",
          size: "small",
          status: "danger",
          icon: <IconDelete />,
        },
        popconfirmProps: {
          okText: "确定",
          cancelText: "取消",
        },
      });

      return (
        <ButtonGroupRender
          buttonConfigurations={buttonConfigurations}
          className="flex-nowrap"
          style={{ gap: "8px" }}
        />
      );
    },
  },
];
