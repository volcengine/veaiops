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

import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { formatDateTime } from '@veaiops/utils';
import type { ThresholdRule } from '@threshold/shared/types/rules';
import {
  renderChannelTags,
  renderRuleStatus,
  renderThresholdConfig,
} from '@threshold/shared/utils/rules';
import {
  ActiveSwitchColumn,
  LastTriggeredColumn,
  NotificationChannelsColumn,
  RuleActionsColumn,
  RuleNameColumn,
  RuleStatusColumn,
  TemplateNameColumn,
  ThresholdConfigColumn,
  TriggerCountColumn,
} from './column-renderers';

/**
 * Table column configuration parameters
 *
 * Refactoring notes:
 * - Original branch (feat/web-v2): oncall/components/column-config.tsx uses getRulesTableColumns
 * - Current branch: Refactored to createTableColumns factory function
 * - Functional equivalence: ✅ Aligned with original branch's column renderer componentization pattern
 */
export interface TableColumnsProps {
  onEdit: (rule: ThresholdRule) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
  onCopy: (rule: ThresholdRule) => void;
  onViewDetail: (rule: ThresholdRule) => void;
}

/**
 * Create table column configuration
 *
 * Refactoring notes:
 * - Reference getRulesTableColumns function from origin/feat/web-v2
 * - Use independent column renderer components to improve maintainability
 * - Maintain complete consistency with original functionality
 */
export const createTableColumns = ({
  onEdit,
  onDelete,
  onToggle,
  onCopy,
  onViewDetail,
}: TableColumnsProps): ColumnProps<ThresholdRule>[] => [
  {
    title: '规则名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    render: (name: string, record: ThresholdRule) => (
      <RuleNameColumn name={name} record={record} />
    ),
  },
  {
    title: '监控模板',
    dataIndex: 'template_name',
    key: 'template_name',
    width: 150,
    render: (templateName: string) => (
      <TemplateNameColumn templateName={templateName} />
    ),
  },
  {
    title: '阈值配置',
    dataIndex: 'threshold_config',
    key: 'threshold_config',
    width: 250,
    render: (config: ThresholdRule['threshold_config']) => (
      <ThresholdConfigColumn
        config={config}
        renderThresholdConfig={renderThresholdConfig}
      />
    ),
  },
  {
    title: '通知Channel',
    dataIndex: 'notification_config',
    key: 'notification_config',
    width: 200,
    render: (config: ThresholdRule['notification_config']) => (
      <NotificationChannelsColumn
        channels={config.channels}
        renderChannelTags={renderChannelTags}
      />
    ),
  },
  {
    title: '状态',
    dataIndex: 'is_active',
    key: 'status',
    width: 120,
    render: (_: boolean, record: ThresholdRule) => (
      <RuleStatusColumn record={record} renderRuleStatus={renderRuleStatus} />
    ),
  },
  {
    title: '触发次数',
    dataIndex: 'trigger_count',
    key: 'trigger_count',
    width: 100,
    render: (count: number) => <TriggerCountColumn count={count} />,
  },
  {
    title: '最后触发',
    dataIndex: 'last_triggered_at',
    key: 'last_triggered_at',
    width: 150,
    render: (time: string) => (
      <LastTriggeredColumn time={time} formatDateTime={formatDateTime} />
    ),
  },
  {
    title: '启用状态',
    dataIndex: 'is_active',
    key: 'is_active',
    width: 100,
    render: (isActive: boolean, record: ThresholdRule) => (
      <ActiveSwitchColumn
        isActive={isActive}
        record={record}
        onToggle={onToggle}
      />
    ),
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right' as const,
    render: (_: unknown, record: ThresholdRule) => (
      <RuleActionsColumn
        record={record}
        onViewDetail={onViewDetail}
        onEdit={onEdit}
        onCopy={onCopy}
        onDelete={onDelete}
      />
    ),
  },
];
