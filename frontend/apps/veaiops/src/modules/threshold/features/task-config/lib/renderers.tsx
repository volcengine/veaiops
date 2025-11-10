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
import { Space } from "@arco-design/web-react";
import { CellRender } from "@veaiops/components";

import type { IntelligentThresholdTaskVersion } from 'api-generate';

// Destructure CellRender component to avoid repeated calls
const { CustomOutlineTag } = CellRender;

/**
 * Status tag render
 */
export const renderStatus = (status: string) => {
  const statusConfig = {
    Unknown: { color: "gray", text: "未知" },
    Launching: { color: "blue", text: "启动中" },
    Running: { color: "green", text: "运行中" },
    Stopped: { color: "red", text: "已停止" },
    Success: { color: "green", text: "成功" },
    Failed: { color: "red", text: "失败" },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.Unknown;
  return <CustomOutlineTag>{config.text}</CustomOutlineTag>;
};

/**
 * Datasource type tag render
 */
export const renderDatasourceType = (type: string) => {
  const typeConfig = {
    Volcengine: { color: "blue", text: "火山引擎" },
    Aliyun: { color: "orange", text: "阿里云" },
    Zabbix: { color: "purple", text: "Zabbix" },
  };

  const config = typeConfig[type as keyof typeof typeConfig];
  return config ? (
    <CustomOutlineTag>{config.text}</CustomOutlineTag>
  ) : (
    <CustomOutlineTag>{type}</CustomOutlineTag>
  );
};

/**
 * Auto-update status render
 */
export const renderAutoUpdate = (autoUpdate: boolean) => {
  return autoUpdate ? (
    <CustomOutlineTag>已开启</CustomOutlineTag>
  ) : (
    <CustomOutlineTag>未开启</CustomOutlineTag>
  );
};

/**
 * Latest version render
 */
export const renderLatestVersion = (
  version: IntelligentThresholdTaskVersion | undefined,
) => {
  if (!version) {
    return "-";
  }
  return (
    <Space>
      <span>v{version.version}</span>
      {renderStatus(version.status)}
    </Space>
  );
};
