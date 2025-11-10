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
  Space,
  Switch,
  Typography,
} from '@arco-design/web-react';
import {
  IconCopy,
  IconDelete,
  IconEdit,
  IconEye,
} from '@arco-design/web-react/icon';
import type React from 'react';
import type { ThresholdRule } from '@threshold/shared/types/rules';

const { Text } = Typography;

/**
 * Rule name column renderer component
 * Refactoring notes: Reference RuleNameColumn component from origin/feat/web-v2
 */
export const RuleNameColumn: React.FC<{
  name: string;
  record: ThresholdRule;
}> = ({ name, record }) => (
  <div>
    <Text copyable>{name}</Text>
    <br />
    <Text style={{ fontSize: 12, color: '#86909c' }}>{record.description}</Text>
  </div>
);

/**
 * Monitoring template column renderer component
 */
export const TemplateNameColumn: React.FC<{ templateName: string }> = ({
  templateName,
}) => <Text>{templateName}</Text>;

/**
 * Threshold configuration column renderer component
 */
export const ThresholdConfigColumn: React.FC<{
  config: ThresholdRule['threshold_config'];
  renderThresholdConfig: (config: ThresholdRule['threshold_config']) => React.ReactNode;
}> = ({ config, renderThresholdConfig }) => <>{renderThresholdConfig(config)}</>;

/**
 * Notification Channel column renderer component
 */
export const NotificationChannelsColumn: React.FC<{
  channels: string[];
  renderChannelTags: (channels: string[]) => React.ReactNode;
}> = ({ channels, renderChannelTags }) => (
  <Space wrap>{renderChannelTags(channels)}</Space>
);

/**
 * Status column renderer component
 */
export const RuleStatusColumn: React.FC<{
  record: ThresholdRule;
  renderRuleStatus: (record: ThresholdRule) => React.ReactNode;
}> = ({ record, renderRuleStatus }) => <>{renderRuleStatus(record)}</>;

/**
 * Trigger count column renderer component
 */
export const TriggerCountColumn: React.FC<{ count: number }> = ({ count }) => (
  <Text>{count}</Text>
);

/**
 * Last triggered time column renderer component
 */
export const LastTriggeredColumn: React.FC<{
  time: string;
  formatDateTime: (time: string) => string;
}> = ({ time, formatDateTime }) => (
  <Text style={{ fontSize: 12 }}>
    {time ? formatDateTime(time) : '从未触发'}
  </Text>
);

/**
 * Active status column renderer component (Switch)
 */
export const ActiveSwitchColumn: React.FC<{
  isActive: boolean;
  record: ThresholdRule;
  onToggle: (id: string, checked: boolean) => void;
}> = ({ isActive, record, onToggle }) => (
  <Switch
    checked={isActive}
    onChange={(checked) => onToggle(record.id, checked)}
    size="small"
  />
);

/**
 * Actions column renderer component
 * Refactoring notes: Reference OncallActionsColumn component from origin/feat/web-v2
 */
export const RuleActionsColumn: React.FC<{
  record: ThresholdRule;
  onViewDetail: (rule: ThresholdRule) => void;
  onEdit: (rule: ThresholdRule) => void;
  onCopy: (rule: ThresholdRule) => void;
  onDelete: (id: string) => void;
}> = ({ record, onViewDetail, onEdit, onCopy, onDelete }) => (
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
    <Button
      type="text"
      size="small"
      icon={<IconCopy />}
      onClick={() => onCopy(record)}
    >
      复制
    </Button>
    <Popconfirm
      title="确定要删除这个规则吗？"
      onOk={() => onDelete(record.id)}
    >
      <Button type="text" size="small" icon={<IconDelete />} status="danger">
        删除
      </Button>
    </Popconfirm>
  </Space>
);
