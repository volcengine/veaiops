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

import type { Event, EventLevel } from '@veaiops/api-client';
import { AgentType } from '@veaiops/api-client';
import type { TableDataResponse } from '@veaiops/utils';

/**
 * 历史事件模块类型
 */
export enum HistoryModuleType {
  /** 智能阈值模块 */
  INTELLIGENT_THRESHOLD = 'intelligent_threshold',
  /** ChatOps模块 */
  CHATOPS = 'chatops',
  /** 事件中心模块 */
  EVENT_CENTER = 'event_center',
}

/**
 * 历史事件筛选参数
 */
export interface EventHistoryFilters {
  /** 智能体类型（数组） */
  agent_type?: AgentType[];
  /** 事件级别 */
  event_level?: EventLevel | '';
  /** 显示状态（中文状态数组） */
  show_status?: string[];
  /** 项目列表 */
  projects?: string[];
  /** 区域列表 */
  region?: string[];
  /** 开始时间 */
  start_time?: string;
  /** 结束时间 */
  end_time?: string;
}

/**
 * 事件历史表格组件属性
 */
export interface EventHistoryTableProps {
  /** 模块类型，用于确定智能体筛选范围 */
  moduleType: HistoryModuleType;
  /** 表格标题 */
  title?: string;
  /** 是否显示导出按钮 */
  showExport?: boolean;
  /** 查看详情回调 */
  onViewDetail?: (record: Event) => void;
  /** 自定义操作列 */
  customActions?: (record: Event) => React.ReactNode;
  /**
   * API请求函数
   * 由业务层传入，避免组件库层直接依赖应用层的API客户端
   * 使用 @veaiops/utils 中的 createTableRequestWithResponseHandler 创建
   */
  request: (
    params: Record<string, unknown>,
  ) => Promise<TableDataResponse<Event>>;
  /** Initial query parameters - default filter values */
  initQuery?: Record<string, unknown>;
}

/**
 * 根据模块类型获取允许的智能体类型
 */
export function getAllowedAgentTypes(
  moduleType: HistoryModuleType,
): AgentType[] {
  switch (moduleType) {
    case HistoryModuleType.INTELLIGENT_THRESHOLD:
      return [AgentType.INTELLIGENT_THRESHOLD_AGENT];
    case HistoryModuleType.CHATOPS:
      return [
        AgentType.CHATOPS_INTEREST_AGENT,
        AgentType.CHATOPS_PROACTIVE_REPLY_AGENT,
        AgentType.CHATOPS_REACTIVE_REPLY_AGENT,
      ];
    case HistoryModuleType.EVENT_CENTER:
      // 事件中心支持所有智能体类型
      return Object.values(AgentType);
    default:
      return Object.values(AgentType);
  }
}
