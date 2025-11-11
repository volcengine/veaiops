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

import type { TableProps } from '@arco-design/web-react/es/Table';
import {
  BOT_ATTRIBUTES_TABLE_INIT_QUERY,
  BOT_ATTRIBUTES_TABLE_SCROLL,
  type BotAttributeFiltersQuery,
  getBotAttributeFilters,
  getBotAttributesColumns,
} from '@bot/lib';
import { ChannelType } from '@veaiops/api-client';
import type { CustomTableActionType } from '@veaiops/components';
import type { BotAttribute } from 'api-generate';
import type React from 'react';
import { useCallback, useMemo, useRef } from 'react';
import { useBotAttributes } from '../main';

/**
 * Bot 属性表格配置 Hook 参数
 */
export interface UseBotAttributesTableConfigParams {
  botId?: string;
  channel?: string;
  onDelete: (attribute: BotAttribute) => Promise<boolean>;
  tableRef: React.RefObject<
    CustomTableActionType<BotAttribute, BotAttributeFiltersQuery>
  >;
}

/**
 * Bot 属性表格配置 Hook 返回值
 */
export interface UseBotAttributesTableConfigReturn {
  // 表格配置
  tableRef: React.RefObject<
    CustomTableActionType<BotAttribute, BotAttributeFiltersQuery>
  >;
  handleColumns: () => ReturnType<typeof getBotAttributesColumns>;
  handleFilters: typeof getBotAttributeFilters;
  initQuery: BotAttributeFiltersQuery;
  dataSource: {
    request: (params?: Record<string, unknown>) => Promise<unknown>;
    ready: boolean;
    responseItemsKey: string;
  };
  tableProps: (ctx: { loading: boolean }) => TableProps<BotAttribute>;
}

/**
 * Bot 属性表格配置 Hook
 * 提供表格的数据源配置、列配置、筛选配置等
 */
export const useBotAttributesTableConfig = ({
  botId,
  channel,
  onDelete,
  tableRef,
}: UseBotAttributesTableConfigParams): UseBotAttributesTableConfigReturn => {
  // 业务逻辑 Hook
  // 注意：botId 和 channel 可能为 undefined，但 useBotAttributes 需要非 undefined 值
  // 如果未提供，使用默认值 ChannelType.LARK（实际使用时会通过 API 进行验证）
  const { fetchAttributes } = useBotAttributes({
    botId: botId || '',
    channel: (channel || ChannelType.LARK) as ChannelType, // ✅ 使用枚举值而不是硬编码字符串
  });

  // 使用 ref 来稳定 fetchAttributes 函数的引用，避免死循环
  const fetchAttributesRef = useRef(fetchAttributes);
  fetchAttributesRef.current = fetchAttributes;

  // 创建一个稳定的请求函数
  // 为什么使用 unknown：params 参数来自 CustomTable，可能包含多种类型的参数（page_req、query、filters 等）
  // 使用 unknown 比 any 更安全，强制进行类型检查后再使用
  const stableFetchAttributes = useCallback(
    (params?: Record<string, unknown>) => {
      return fetchAttributesRef.current(params);
    },
    [], // 空依赖数组，确保函数引用稳定
  );

  // 表格列配置
  const handleColumns = useCallback(
    () => getBotAttributesColumns({ onDelete }),
    [onDelete],
  );

  // 筛选配置
  const handleFilters = getBotAttributeFilters;

  // ✅ 修复死循环：使用 useMemo 稳定化 dataSource 对象，避免每次渲染创建新引用
  // 根据规范：直接返回对象会导致每次渲染创建新引用，触发子组件重新渲染
  const dataSource = useMemo(
    () => ({
      request: stableFetchAttributes,
      ready: true,
      responseItemsKey: 'data',
    }),
    [stableFetchAttributes],
  );

  return {
    tableRef,
    handleColumns,
    handleFilters,
    initQuery: BOT_ATTRIBUTES_TABLE_INIT_QUERY,
    dataSource,
    tableProps: (ctx): TableProps<BotAttribute> => ({
      loading: ctx.loading,
      rowKey: (record: BotAttribute) => record._id || '',
      pagination: false,
      scroll: BOT_ATTRIBUTES_TABLE_SCROLL,
    }),
  };
};
