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

import { Alert, Link } from '@arco-design/web-react';
import type { InformStrategy } from 'api-generate';
import type React from 'react';

/**
 * Card template configuration prompt text component
 * Used to uniformly display card template configuration prompts
 */
export const CardTemplateConfigMessage: React.FC = () => {
  return (
    <>
      如果您未正确配置卡片模版，会导致无法接收到告警卡片。现在去
      <Link
        href="/system/card-template"
        target="_blank"
        rel="noopener noreferrer"
        style={{ marginLeft: 4 }}
      >
        配置卡片模版
      </Link>
    </>
  );
};

/**
 * Top alert component props interface
 */
export interface TopAlertProps {
  editingStrategy: InformStrategy | null;
}

/**
 * Top alert component
 * Displays prompts for creating or editing strategy
 */
export const TopAlert: React.FC<TopAlertProps> = ({ editingStrategy }) => {
  const isCreate = !editingStrategy;

  return (
    <Alert
      type={isCreate ? 'info' : 'warning'}
      showIcon
      title={isCreate ? '新建策略' : '编辑策略'}
      content={
        isCreate
          ? '将创建一条新的消息卡片通知策略，请确认名称、协同工具、机器人与通知群等信息填写完整。'
          : '将修改现有消息卡片通知策略，保存前请仔细核对变更内容，错误配置可能导致通知失败。'
      }
      style={{ marginBottom: 12 }}
    />
  );
};

/**
 * Warning alert component props interface
 */
export interface WarningAlertProps {
  selectedBotName: string | null;
}

/**
 * Warning alert component
 * Displays notes and configuration prompts
 */
export const WarningAlert: React.FC<WarningAlertProps> = ({
  selectedBotName,
}) => {
  return (
    <Alert
      type="warning"
      showIcon
      title="注意事项"
      style={{ marginTop: 0 }}
      content={
        <div>
          <div style={{ marginBottom: 8 }}>
            该消息卡片通知策略仅支持群聊中有此机器人
            {selectedBotName ? `(${selectedBotName})` : ''}
            的相关Agents告警消息；如果群聊中不包含此机器人，告警消息发送会失败。
          </div>
          <div>
            <CardTemplateConfigMessage />
          </div>
        </div>
      }
    />
  );
};
