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

import type React from 'react';

/**
 * Connection management guide content component
 */
export const ConnectionManagementGuideContent: React.FC = () => (
  <div>
    <p className="mb-3">
      <strong>什么是连接管理？</strong>
    </p>
    <p className="mb-2">
      连接管理用于配置和管理监控数据源的认证信息。在创建监控配置之前，您需要先建立与监控平台的连接。
    </p>
    <p className="mb-2">
      <strong>支持的数据源类型：</strong>
    </p>
    <ul className="pl-5 mb-2 list-disc">
      <li>
        <strong>火山引擎：</strong>需要配置 Access Key ID 和 Access Key Secret
      </li>
      <li>
        <strong>阿里云：</strong>需要配置 Access Key ID 和 Access Key Secret
      </li>
      <li>
        <strong>Zabbix：</strong>需要配置 API URL、用户名和密码
      </li>
    </ul>
    <p className="text-xs text-[#86909c]">
      💡 提示：一个连接配置可以被多个监控配置复用
    </p>
  </div>
);

/**
 * Add data source guide content component
 */
export const AddMonitorConfigGuideContent: React.FC = () => (
  <div>
    <p className="mb-3">
      <strong>如何创建监控配置？</strong>
    </p>
    <p className="mb-2">
      建立连接后，点击"新增数据源"按钮创建具体的监控任务。系统会引导您完成以下步骤：
    </p>
    <ol className="pl-5 mb-2 list-decimal">
      <li>
        <strong>选择数据源类型：</strong>
        选择要监控的平台（火山引擎/阿里云/Zabbix）
      </li>
      <li>
        <strong>选择连接：</strong>从已创建的连接中选择一个
      </li>
      <li>
        <strong>配置监控指标：</strong>
        根据数据源类型配置具体的监控指标和参数
      </li>
      <li>
        <strong>设置告警规则：</strong>配置阈值和告警策略（可选）
      </li>
    </ol>
    <p className="text-xs text-[#86909c]">
      💡
      提示：不同数据源的配置项会有所不同，系统会根据您的选择展示相应的配置表单
    </p>
  </div>
);
