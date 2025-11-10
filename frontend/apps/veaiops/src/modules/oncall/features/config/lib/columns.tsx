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
  DescriptionColumn,
  InspectHistoryColumn,
  OncallActionsColumn,
  RegexColumn,
  RuleNameColumn,
  StatusColumn,
} from '@oncall-config/ui';
import { CellRender, type ModernTableColumnProps } from "@veaiops/components";
import type { Interest } from "api-generate";
import {
  formatActionCategory,
  formatInspectCategory,
  formatSilenceDelta,
} from './renderers';

/**
 * Get table column configuration
 * Fully aligned with original branch implementation
 *
 * Note: onToggleStatus uses positional parameters because StatusColumn component expects positional parameters
 */
interface GetRulesTableColumnsParams {
  onToggleStatus: (ruleUuid: string, checked: boolean) => Promise<boolean>;
  onViewDetails: (rule: Interest) => void;
  onEdit: (rule: Interest) => void;
}

export const getRulesTableColumns = ({
  onToggleStatus,
  onViewDetails,
  onEdit,
}: GetRulesTableColumnsParams): ModernTableColumnProps<Interest>[] => [
  {
    title: '规则名称',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left' as const,
    width: 300,
    render: (name: string, record: Interest) => (
      <RuleNameColumn name={name} record={record} />
    ),
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 200,
    render: (description: string) => (
      <DescriptionColumn description={description} />
    ),
  },
  {
    title: '告警等级',
    dataIndex: 'level',
    key: 'level',
    width: 90,
    render: (level?: string) =>
      level ? (
        <CellRender.CustomOutlineTag>{level}</CellRender.CustomOutlineTag>
      ) : (
        '-'
      ),
  },
  {
    title: '告警类别',
    dataIndex: 'action_category',
    key: 'action_category',
    width: 100,
    render: formatActionCategory,
  },
  {
    title: '检查类别',
    dataIndex: 'inspect_category',
    key: 'inspect_category',
    width: 120,
    render: formatInspectCategory,
  },
  {
    title: '正则表达式',
    dataIndex: 'regular_expression',
    key: 'regular_expression',
    width: 150,
    render: (regex: string) => <RegexColumn regex={regex} />,
  },
  {
    title: '消息检测窗口',
    dataIndex: 'inspect_history',
    key: 'inspect_history',
    width: 120,
    render: (count: number) => <InspectHistoryColumn count={count} />,
  },
  {
    title: '告警抑制间隔',
    dataIndex: 'silence_delta',
    key: 'silence_delta',
    width: 120,
    render: formatSilenceDelta,
  },
  {
    title: '状态',
    dataIndex: 'is_active',
    key: 'is_active',
    width: 100,
    render: (isActive: boolean, record: Interest) => (
      <StatusColumn
        isActive={isActive}
        record={record}
        onToggle={onToggleStatus}
      />
    ),
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180,
    render: (date: string) => <CellRender.StampTime time={date} />,
  },
  {
    title: '更新时间',
    dataIndex: 'updated_at',
    key: 'updated_at',
    width: 180,
    render: (date: string) => <CellRender.StampTime time={date} />,
  },
  {
    title: '操作',
    key: 'actions',
    fixed: 'right' as const,
    width: 180,
    render: (_: unknown, record: Interest) => (
      <OncallActionsColumn
        record={record}
        onViewDetails={onViewDetails}
        onEdit={onEdit}
      />
    ),
  },
];
