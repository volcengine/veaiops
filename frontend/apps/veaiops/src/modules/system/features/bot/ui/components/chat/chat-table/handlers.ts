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

import { getChatColumns, getChatFilters } from '@bot/lib';
import type {
  BaseQuery,
  FieldItem,
  HandleFilterProps,
  ModernTableColumnProps,
} from '@veaiops/components';
import { logger } from '@veaiops/utils';
import type { Chat } from 'api-generate';
import { useCallback } from 'react';

/**
 * Chat management table handler functions Hook
 */
export const useChatTableHandlers = ({
  onUpdateConfig,
}: {
  onUpdateConfig: (params: {
    chatId: string;
    field: 'enable_func_interest' | 'enable_func_proactive_reply';
    value: boolean;
    currentRecord: Chat;
  }) => Promise<boolean>;
}) => {
  // ✅ Use useCallback to stabilize handleColumns function, avoid creating new reference on each render
  const handleColumns = useCallback(
    (props: Record<string, unknown>): ModernTableColumnProps<Chat>[] => {
      try {
        logger.debug({
          message: '[ChatTable] handleColumns 开始调用',
          data: {
            propsKeys: Object.keys(props || {}),
            hasOnUpdateConfig: Boolean(onUpdateConfig),
          },
          source: 'ChatTable',
          component: 'handleColumns',
        });

        const columns = getChatColumns({
          onUpdateConfig,
          // Keep compatible with CustomTable handleColumns standard interface
        }) as ModernTableColumnProps<Chat>[];

        logger.debug({
          message: '[ChatTable] handleColumns 调用成功',
          data: {
            columnsCount: Array.isArray(columns) ? columns.length : 0,
          },
          source: 'ChatTable',
          component: 'handleColumns',
        });

        return columns;
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: '[ChatTable] handleColumns 调用失败',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'ChatTable',
          component: 'handleColumns',
        });
        // Return empty array to avoid crash
        return [];
      }
    },
    [onUpdateConfig],
  );

  // ✅ Use useCallback to stabilize handleFilters function, avoid creating new reference on each render
  const handleFilters = useCallback(
    (props: HandleFilterProps<BaseQuery>): FieldItem[] => {
      try {
        logger.debug({
          message: '[ChatTable] handleFilters 开始调用',
          data: {
            query: props.query,
            queryKeys: Object.keys(props.query || {}),
          },
          source: 'ChatTable',
          component: 'handleFilters',
        });

        const filters = getChatFilters({
          query: props.query,
          handleChange: props.handleChange,
        });

        logger.debug({
          message: '[ChatTable] handleFilters 调用成功',
          data: {
            filtersCount: Array.isArray(filters) ? filters.length : 0,
          },
          source: 'ChatTable',
          component: 'handleFilters',
        });

        return filters;
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: '[ChatTable] handleFilters 调用失败',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'ChatTable',
          component: 'handleFilters',
        });
        // Return empty array to avoid crash
        return [];
      }
    },
    [],
  );

  return {
    handleColumns,
    handleFilters,
  };
};
