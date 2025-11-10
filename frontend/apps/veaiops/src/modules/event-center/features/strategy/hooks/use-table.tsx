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
// ✅ Optimization: use shortest path, merge imports from same source
import {
  getStrategyColumns,
  getStrategyFilters,
  strategyService,
  useBotsList,
} from '@ec/strategy';
import {
  type BaseQuery,
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
 * Strategy filter parameters type
 */
export interface StrategyFilters {
  name?: string;
  channel?: string;
  botId?: string;
  showAll?: boolean;
}

/**
 * Strategy query parameters type (extends BaseQuery)
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
 * Strategy table configuration Hook options type
 */
export interface UseStrategyTableConfigOptions {
  onEdit?: (strategy: InformStrategy) => void;
  onDelete?: (strategyId: string) => Promise<boolean>;
  onCreate?: () => void;
  onRefresh?: () => void;
  ref?: React.Ref<{ refresh: () => Promise<void> }>; // ✅ Add ref parameter
}

/**
 * Strategy table configuration Hook return value type
 */
export interface UseStrategyTableConfigReturn {
  customTableProps: ReturnType<typeof useBusinessTable>['customTableProps'];
  customOperations: ReturnType<typeof useBusinessTable>['customOperations'];
  // ✅ Compatibility: operations as alias for customOperations
  operations: ReturnType<typeof useBusinessTable>['customOperations'];
  handleColumns: (
    props?: Record<string, QueryValue>,
  ) => ModernTableColumnProps<InformStrategy>[];
  handleFilters: (props: HandleFilterProps<BaseQuery>) => FieldItem[];
  renderActions: (props?: Record<string, QueryValue>) => JSX.Element[];
  botsOptions: Array<{ label: string; value: string }>;
}

/**
 * Strategy table configuration aggregation Hook
 *
 * 🎯 Hook aggregation pattern + auto-refresh mechanism
 * - Use useBusinessTable to uniformly manage table logic
 * - Implement auto-refresh via operationWrapper
 * - Centralized management of data source, table configuration, column configuration, etc.
 *
 * @param options - Hook configuration options
 * @returns Table configuration and handlers
 */
export const useStrategyTableConfig = ({
  onEdit,
  onDelete,
  onCreate,
  onRefresh,
  ref, // ✅ Receive ref parameter
}: UseStrategyTableConfigOptions): UseStrategyTableConfigReturn => {
  // 🎯 Get business data
  const { data: bots } = useBotsList();

  // 🎯 Construct bot options
  const botsOptions = useMemo(() => {
    if (!bots || !Array.isArray(bots)) {
      return [];
    }
    return bots.map((bot) => ({
      label: bot.extra?.name || bot.extra?.bot_id,
      value: bot.extra?.bot_id,
    }));
  }, [bots]);

  // 🎯 Data request logic
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
          // response.data type is already Array<InformStrategy> | undefined, no need for type assertion
          return {
            data: response.data,
            total: response.total ?? response.data.length,
            success: true,
          };
        } else {
          throw new Error(response.message || 'Failed to fetch strategy list');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load strategy list, please try again';
        Message.error(errorMessage);
        return {
          data: [],
          total: 0,
          success: false,
        };
      }
    };
  }, []);

  // 🎯 Data source configuration
  const dataSource = useMemo(
    () => ({
      request,
      ready: true,
      isServerPagination: true,
    }),
    [request],
  );

  // 🎯 Table configuration
  const tableProps = useMemo(
    () => ({
      rowKey: '_id',
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

  // 🎯 Business operation wrapper - auto-refresh
  const { customTableProps, customOperations } =
    useBusinessTable<StrategyQueryParams>({
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
            // operationWrapper doesn't need actual call for now, only used for auto-refresh
            return true;
          }),
      }),
      ref, // ✅ Pass ref to useBusinessTable
    });

  // 🎯 Column configuration
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

  // 🎯 Filter configuration
  // ✅ Fix: handleFilters return type must match CustomTable's expectations
  // CustomTable expects handleFilters: (props: HandleFilterProps<QueryType>) => FieldItem[]
  const handleFilters = useCallback(
    (props: HandleFilterProps<BaseQuery>): FieldItem[] => {
      // ✅ Type safe: StrategyQueryParams extends BaseQuery, can safely convert
      const query = props.query as StrategyQueryParams;
      return getStrategyFilters({
        query,
        handleChange: props.handleChange,
        handleFiltersProps: { ...props.handleFiltersProps, botsOptions },
      });
    },
    [botsOptions],
  );

  // 🎯 Action configuration
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
    // Table configuration
    customTableProps,
    customOperations,
    // ✅ Compatibility: operations as alias for customOperations
    operations: customOperations,
    handleColumns,
    handleFilters,
    renderActions,

    // Business data
    botsOptions,
  };
};
