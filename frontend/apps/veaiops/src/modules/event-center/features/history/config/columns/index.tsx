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

import type { Event } from 'api-generate';
import { type HistoryColumnsProps, renderActions } from './action-renderer';
import {
  renderAgentType,
  renderEventId,
  renderEventLevel,
  renderProjectList,
  renderRegionList,
  renderTimestamp,
} from './basic-renderers';
import { renderEventShowStatus } from './status-renderer';

/**
 * History event column configuration function
 * Follow CustomTable best practices to provide complete column configuration
 */
export const getHistoryColumns = (props: HistoryColumnsProps) => [
  {
    title: '事件ID',
    dataIndex: '_id',
    key: 'event_id',
    width: 180,
    fixed: 'left' as const,
    ellipsis: true,
    render: renderEventId,
  },
  {
    title: '功能模块',
    dataIndex: 'agent_type',
    key: 'agent_type',
    width: 100,
    render: renderAgentType,
  },
  {
    title: '状态',
    dataIndex: 'show_status',
    key: 'show_status',
    width: 120,
    render: renderEventShowStatus,
  },
  {
    title: '事件级别',
    dataIndex: 'event_level',
    key: 'event_level',
    width: 80,
    render: renderEventLevel,
  },
  {
    title: '区域',
    dataIndex: 'region',
    key: 'region',
    width: 120,
    ellipsis: true,
    render: renderRegionList,
  },
  {
    title: '项目',
    dataIndex: 'project',
    key: 'project',
    width: 140,
    ellipsis: true,
    render: renderProjectList,
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 160,
    sorter: true,
    // Set default descending sort (latest records first)
    defaultSortOrder: 'descend' as const,
    render: renderTimestamp,
  },
  {
    title: '更新时间',
    dataIndex: 'updated_at',
    key: 'updated_at',
    width: 160,
    render: renderTimestamp,
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right' as const,
    render: (_: unknown, record: Event) => renderActions({ record, props }),
  },
];

// Export types and render functions for use by other modules
export { renderActions } from './action-renderer';
export type { HistoryColumnsProps } from './action-renderer';
export {
  renderAgentType,
  renderEventId,
  renderEventLevel,
  renderProjectList,
  renderRegionList,
  renderTimestamp,
} from './basic-renderers';
export { renderEventShowStatus, renderEventStatus } from './status-renderer';
