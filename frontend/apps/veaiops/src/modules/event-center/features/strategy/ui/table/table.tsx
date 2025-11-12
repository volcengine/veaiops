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

// ✅ 优化：使用最短路径，合并同源导入
import {
  STRATEGY_MANAGEMENT_CONFIG,
  getStrategyColumns,
  useBotsList,
  useChatsList,
  useStrategyActionConfig,
  useStrategyTableConfig,
} from '@ec/strategy';
import {
  type BaseQuery,
  CustomTable,
  type CustomTableActionType,
} from '@veaiops/components';
import { logger } from '@veaiops/utils';
import type { InformStrategy } from 'api-generate';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

/**
 * 策略表格 Ref 接口
 *
 * 根据 .cursorrules 规范：
 * - 异步方法必须返回 { success: boolean; error?: Error } 格式
 * - 便于调用方进行判断和处理
 */
export interface StrategyTableRef {
  refresh: () => Promise<{ success: boolean; error?: Error }>;
}

/**
 * 策略表格组件属性接口
 *
 * 类型分析（基于 Python 源码）：
 * - Python InformStrategyVO (API 响应): bot: BotVO, group_chats: List[GroupChatVO]
 * - Python InformStrategyPayload (API 请求): bot_id: str, chat_ids: List[str]
 * - 前端 InformStrategy (api-generate) = InformStrategyVO
 * - 编辑时需要使用适配器转换为扁平化格式（bot_id, chat_ids）
 *
 * 根据 .cursorrules 规范：优先使用 api-generate 中的类型
 * onEdit 接收 InformStrategy，通过 adaptStrategyForEdit 转换为表单需要的格式
 */
interface StrategyTableProps {
  // ✅ 修复：统一使用 InformStrategy（来自 api-generate），符合单一数据源原则
  // 编辑表单会通过 adaptStrategyForEdit 适配器提取 bot_id 和 chat_ids
  onEdit: (strategy: InformStrategy) => void;
  onDelete: (strategyId: string) => Promise<boolean>;
  onAdd: () => void;
}

const queryFormat = {};

/**
 * 策略表格组件
 *
 * 重构说明（对比 origin/feat/web-v2）：
 * - 原分支: 使用 useManagementRefresh 手动处理刷新
 * - 当前分支: 使用 useBusinessTable 自动处理刷新（符合 .cursorrules 规范）
 * - StrategyTableRef.refresh: 返回 Promise<{ success: boolean; error?: Error }>（符合规范）
 * - 功能等价性: ✅ 已使用 useBusinessTable 的 operations 自动刷新
 *
 * 架构特点：
 * - 使用 useStrategyTableConfig Hook（内部使用 useBusinessTable）
 * - 通过 useImperativeHandle 暴露刷新接口
 * - 使用类型适配器函数移除 as any（adaptStrategyForEdit）
 * - 遵循 Feature-Based 模块化架构
 */
export const StrategyTable = forwardRef<StrategyTableRef, StrategyTableProps>(
  ({ onEdit, onDelete, onAdd }, ref) => {
    const { data: botsOptions } = useBotsList();
    const { chatOptions: chatsOptions, fetchChats: chartRun } = useChatsList();

    // CustomTable 的内部 ref（使用泛型类型）
    // 直接使用 InformStrategy（符合 .cursorrules 规范：优先使用 api-generate 中的类型）
    const tableRef =
      useRef<CustomTableActionType<InformStrategy, BaseQuery>>(null);

    // 表格配置（已使用 useBusinessTable 自动处理刷新）
    // ✅ 传递 tableRef 给 useStrategyTableConfig，让 useBusinessTable 可以使用 ref 刷新
    const { customTableProps, handleFilters: configHandleFilters } =
      useStrategyTableConfig({
        onEdit,
        onDelete,
        onCreate: onAdd,
        ref: tableRef, // ✅ 传递 ref 给 Hook
      });

    // 操作按钮配置
    // 注意：创建操作（onAdd）只是打开弹窗，真正的创建提交在弹窗中处理
    // 弹窗提交后需要手动刷新表格，或在弹窗组件中使用 useBusinessTable 的 afterCreate
    const { actions } = useStrategyActionConfig(onAdd);

    // 创建 handleColumns 函数，传递操作回调给列配置
    const handleColumns = useCallback(
      (props: Record<string, unknown>) => {
        return getStrategyColumns({
          ...props,
          onEdit,
          // ✅ 使用 onDelete，删除操作在 useStrategyTableConfig 中已通过 operationWrapper 自动刷新
          onDelete,
        });
      },
      [onEdit, onDelete],
    );

    // 将 CustomTable 的 ref 适配为 StrategyTableRef
    // 只暴露 refresh 方法，符合 StrategyTableRef 接口定义
    // 直接调用 tableRef.current.refresh() 来刷新表格（因为 operations.refresh 返回 void，不是 Promise）
    useImperativeHandle(
      ref,
      () => ({
        refresh: async () => {
          // 直接调用 tableRef.current.refresh()，它返回 Promise<void>
          // 我们需要将其转换为 Promise<{ success: boolean; error?: Error }>
          try {
            await tableRef.current?.refresh();
            return { success: true };
          } catch (error: unknown) {
            const errorObj =
              error instanceof Error ? error : new Error(String(error));
            logger.error({
              message: '刷新策略表格失败',
              data: {
                error: errorObj.message,
                stack: errorObj.stack,
                errorObj,
              },
              source: 'StrategyTable',
              component: 'refresh',
            });
            return { success: false, error: errorObj };
          }
        },
      }),
      [],
    );

    return (
      <CustomTable<InformStrategy>
        {...customTableProps}
        title={STRATEGY_MANAGEMENT_CONFIG.title}
        actions={actions}
        handleColumns={handleColumns}
        handleFilters={configHandleFilters}
        handleFiltersProps={{
          botsOptions,
          chatsOptions,
          chartRun,
        }}
        initQuery={{}} // 添加 initQuery 参数，确保 URL 参数能正确同步
        queryFormat={queryFormat}
        syncQueryOnSearchParams
        useActiveKeyHook
        tableClassName="strategy-management-table"
        ref={tableRef}
      />
    );
  },
);

StrategyTable.displayName = 'StrategyTable';

export default StrategyTable;
