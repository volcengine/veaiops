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
  BOT_MANAGEMENT_CONFIG,
  type BotTableProps,
  type BotTableRef,
  DEFAULT_BOT_FILTERS,
  getBotColumns,
  getBotFilters,
  useBotActionConfig,
  useBotTableConfig,
} from '@bot';
import { type Bot, ChannelType } from '@veaiops/api-client';
import {
  type BaseQuery,
  type BaseRecord,
  CustomTable,
  type CustomTableActionType,
  useBusinessTable,
} from '@veaiops/components';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';

/**
 * Bot表格组件
 * 使用CustomTable标准化实现 - 按照客户管理的标准模式
 * 支持刷新功能，各种操作都会自动刷新表格数据
 */
export const BotTable = forwardRef<BotTableRef, BotTableProps>(
  ({ onEdit, onDelete, onAdd, onViewAttributes, onGroupManagement }, ref) => {
    // 内部 ref，用于传递给 useBusinessTable
    const tableActionRef =
      useRef<CustomTableActionType<BaseRecord, BaseQuery>>(null);

    // 表格配置
    const { dataSource, tableProps } = useBotTableConfig({
      handleDelete: onDelete,
    });

    // 🎯 使用 useBusinessTable 自动处理刷新逻辑
    const { customTableProps, wrappedHandlers, operations } = useBusinessTable({
      dataSource,
      tableProps,
      handlers: onDelete
        ? {
            delete: async (botId: string) => {
              return await onDelete(botId);
            },
          }
        : undefined,
      refreshConfig: {
        enableRefreshFeedback: true,
        successMessage: '操作成功',
        errorMessage: '操作失败，请重试',
      },
      ref: tableActionRef,
    });

    // 桥接 ref：将 BotTableRef 转换为 CustomTableActionType
    useImperativeHandle(
      ref,
      () => ({
        refresh: async () => {
          if (operations?.refresh) {
            const result = await operations.refresh();
            if (!result.success && result.error) {
              throw result.error;
            }
            return result.success;
          }
          return false;
        },
      }),
      [operations],
    );

    // 操作按钮配置
    const { actions } = useBotActionConfig(onAdd);

    // 创建 handleColumns 函数，传递操作回调给列配置
    const handleColumns = useCallback(
      (props: Record<string, unknown>) => {
        return getBotColumns({
          onEdit,
          // ✅ 使用 useBusinessTable 自动包装的删除操作
          // 删除操作会自动刷新表格
          onDelete: wrappedHandlers?.delete
            ? (botId: string) => wrappedHandlers.delete!(botId)
            : onDelete,
          onViewAttributes,
          onGroupManagement,
        });
      },
      [onEdit, onDelete, onViewAttributes, onGroupManagement, wrappedHandlers],
    );

    // 🔧 修复：添加 querySearchParamsFormat 确保 channel 参数大小写正确
    // 当用户在地址栏输入 ?channel=Lark 时，确保不会被转换为 lark
    const querySearchParamsFormat = useMemo(
      () => ({
        channel: (value: unknown) => {
          // 规范化：将 URL 参数值映射到正确的 ChannelType 枚举值
          const strValue = String(value);
          const lowerValue = strValue.toLowerCase();
          if (lowerValue === 'lark') {
            return ChannelType.LARK; // 'Lark'
          }
          if (lowerValue === 'dingtalk') {
            return ChannelType.DING_TALK; // 'DingTalk'
          }
          if (lowerValue === 'wechat') {
            return ChannelType.WE_CHAT; // 'WeChat'
          }
          // 保持原值（如果已经是正确格式）
          return strValue;
        },
      }),
      [],
    );

    return (
      <div className="bot-table-container">
        <CustomTable<Bot>
          {...customTableProps}
          ref={tableActionRef}
          title={BOT_MANAGEMENT_CONFIG.title}
          actions={actions}
          handleColumns={handleColumns}
          handleFilters={getBotFilters}
          initQuery={DEFAULT_BOT_FILTERS}
          syncQueryOnSearchParams
          querySearchParamsFormat={querySearchParamsFormat}
        />
      </div>
    );
  },
);

BotTable.displayName = 'BotTable';

export default BotTable;
