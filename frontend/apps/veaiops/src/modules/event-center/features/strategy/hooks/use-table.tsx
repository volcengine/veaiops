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

import { Button, Message } from '@arco-design/web-react';
// ✅ 优化：使用最短路径，合并同源导入
import {
  getStrategyColumns,
  getStrategyFilters,
  strategyService,
  useBotsList,
} from '@ec/strategy';
import {
  type BaseQuery,
  type CustomTableActionType,
  type FieldItem,
  type HandleFilterProps,
  type ModernTableColumnProps,
  type OperationWrappers,
  type QueryValue,
  useBusinessTable,
} from '@veaiops/components';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import type { Bot, InformStrategy } from 'api-generate';
import { useCallback, useMemo } from 'react';

/**
 * 策略筛选参数类型
 */
export interface StrategyFilters {
  name?: string;
  channel?: string;
  botId?: string;
  showAll?: boolean;
}

/**
 * 策略查询参数类型 (扩展自 BaseQuery)
 */
export interface StrategyQueryParams extends BaseQuery {
  skip?: number;
  limit?: number;
  name?: string;
  channel?: string;
  botId?: string;
  showAll?: boolean;
}

/**
 * 策略表格配置 Hook 的选项类型
 */
export interface UseStrategyTableConfigOptions {
  onEdit?: (strategy: InformStrategy) => void;
  onDelete?: (strategyId: string) => Promise<boolean>;
  onCreate?: () => void;
  onRefresh?: () => void;
  ref?: React.Ref<CustomTableActionType<InformStrategy, StrategyQueryParams>>;
}

/**
 * 策略表格配置 Hook 的返回值类型
 */
export interface UseStrategyTableConfigReturn {
  customTableProps: ReturnType<typeof useBusinessTable>['customTableProps'];
  customOperations: ReturnType<typeof useBusinessTable>['customOperations'];
  // ✅ 兼容性：operations 作为 customOperations 的别名
  operations: ReturnType<typeof useBusinessTable>['customOperations'];
  handleColumns: (
    props?: Record<string, QueryValue>,
  ) => ModernTableColumnProps<InformStrategy>[];
  handleFilters: (props: HandleFilterProps<BaseQuery>) => FieldItem[];
  renderActions: (props?: Record<string, QueryValue>) => JSX.Element[];
  botsOptions: Array<{ label: string; value: string }>;
}

/**
 * 策略表格配置聚合 Hook
 *
 * 🎯 Hook 聚合模式 + 自动刷新机制
 * - 使用 useBusinessTable 统一管理表格逻辑
 * - 通过 operationWrapper 实现自动刷新
 * - 集中管理数据源、表格配置、列配置等
 *
 * @param options - Hook 配置选项
 * @returns 表格配置和处理器
 */
export const useStrategyTableConfig = ({
  onEdit,
  onDelete,
  onCreate,
  onRefresh,
  ref, // ✅ 接收 ref 参数
}: UseStrategyTableConfigOptions): UseStrategyTableConfigReturn => {
  // 🎯 获取业务数据
  const { data: bots } = useBotsList();

  // 🎯 构造机器人选项
  const botsOptions = useMemo(() => {
    if (!bots || !Array.isArray(bots)) {
      return [];
    }
    return bots
      .map((bot) => ({
        label: bot.extra?.name || bot.extra?.bot_id,
        value: bot.extra?.bot_id,
      }))
      .filter(
        (option): option is { label: string; value: string } =>
          Boolean(option.label) && Boolean(option.value),
      );
  }, [bots]);

  // 🎯 数据请求逻辑
  const request = useMemo(() => {
    return async (params: StrategyQueryParams) => {
      try {
        const response = await strategyService.getStrategies({
          skip: params.skip as number,
          limit: params.limit as number,
          name: params.name,
          channel: params.channel,
          botId: params.botId,
          showAll: params.showAll,
        });

        if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
          // response.data 类型已经是 Array<InformStrategy> | undefined，无需类型断言
          return {
            data: response.data,
            total: response.total ?? response.data.length,
            success: true,
          };
        } else {
          throw new Error(response.message || '获取策略列表失败');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '加载策略列表失败，请重试';
        Message.error(errorMessage);
        return {
          data: [],
          total: 0,
          success: false,
        };
      }
    };
  }, []);

  // 🎯 数据源配置
  const dataSource = useMemo(
    () => ({
      request,
      ready: true,
      isServerPagination: true,
    }),
    [request],
  );

  // 🎯 表格配置
  const tableProps = useMemo(
    () => ({
      rowKey: 'id',
      scroll: { x: 1200 },
      pagination: {
        pageSize: 10,
        showTotal: (total: number) => `共 ${total} 条记录`,
        showJumper: true,
        sizeCanChange: true,
        sizeOptions: [10, 20, 50, 100],
      },
    }),
    [],
  );

  // 🎯 业务操作包装 - 自动刷新
  const { customTableProps, customOperations } = useBusinessTable<
    StrategyQueryParams,
    InformStrategy,
    StrategyQueryParams
  >({
    dataSource,
    tableProps,
    refreshConfig: {
      enableRefreshFeedback: true,
      successMessage: '操作成功',
      errorMessage: '操作失败，请重试',
    },
    operationWrapper: ({ wrapDelete }: OperationWrappers) => ({
      handleDelete: (..._args: unknown[]) =>
        wrapDelete(async (_id: string): Promise<boolean> => {
          // operationWrapper暂不需要实际调用，仅用于自动刷新
          return true;
        }),
    }),
    ref,
  });

  // 🎯 列配置
  const handleColumns = useCallback(
    (
      _props?: Record<string, QueryValue>,
    ): ModernTableColumnProps<InformStrategy>[] =>
      getStrategyColumns({
        onEdit: (record: InformStrategy) => {
          onEdit?.(record);
        },
        onDelete: async (id: string) => {
          await onDelete?.(id);
        },
      }),
    [onEdit, onDelete],
  );

  // 🎯 筛选配置
  // ✅ 修复：handleFilters 的返回类型必须匹配 CustomTable 的期望
  // CustomTable 期望 handleFilters: (props: HandleFilterProps<QueryType>) => FieldItem[]
  const handleFilters = useCallback(
    (props: HandleFilterProps<BaseQuery>): FieldItem[] => {
      // ✅ 类型安全：StrategyQueryParams extends BaseQuery，可以安全转换
      const query = props.query as StrategyQueryParams;
      return getStrategyFilters({
        query,
        handleChange: props.handleChange,
        handleFiltersProps: { ...props.handleFiltersProps, botsOptions },
      });
    },
    [botsOptions],
  );

  // 🎯 操作配置
  const renderActions = useCallback(
    (_props?: Record<string, QueryValue>): JSX.Element[] =>
      [
        onCreate && (
          <Button key="create" type="primary" onClick={onCreate}>
            新建策略
          </Button>
        ),
        onRefresh && (
          <Button key="refresh" onClick={onRefresh}>
            刷新
          </Button>
        ),
      ].filter((item): item is JSX.Element => Boolean(item)),
    [onCreate, onRefresh],
  );

  return {
    // 表格配置
    customTableProps,
    customOperations,
    // ✅ 兼容性：operations 作为 customOperations 的别名
    operations: customOperations,
    handleColumns,
    handleFilters,
    renderActions,

    // 业务数据
    botsOptions,
  };
};
