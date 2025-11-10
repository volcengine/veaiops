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

import type { BotTableRef } from '@bot/lib';
import { logger } from '@veaiops/utils';
import type { RefObject } from 'react';
import { useCallback } from 'react';

/**
 * Create bot table refresh function
 * @param tableRef - BotTable ref for refreshing the table
 * @returns Function to refresh the table
 */
export const useRefreshBotTable = (
  tableRef?: RefObject<BotTableRef>,
): (() => Promise<boolean>) => {
  const refreshTable = useCallback(async (): Promise<boolean> => {
    if (tableRef?.current?.refresh) {
      logger.debug({
        message: '开始刷新机器人表格',
        data: { source: 'useBot', action: 'refreshTable' },
        source: 'BotManagement',
        component: 'useBot',
      });

      // ✅ Correct: Handle refresh method return value
      const result = await tableRef.current.refresh();
      if (!result.success && result.error) {
        logger.error({
          message: '机器人表格刷新失败',
          data: {
            error: result.error.message,
            stack: result.error.stack,
            errorObj: result.error,
            source: 'useBot',
            action: 'refreshTable',
          },
          source: 'BotManagement',
          component: 'useBot',
        });
        return false;
      }

      logger.debug({
        message: '机器人表格刷新成功',
        data: { source: 'useBot', action: 'refreshTable' },
        source: 'BotManagement',
        component: 'useBot',
      });
      return true;
    }

    logger.warn({
      message: '机器人表格刷新方法不可用',
      data: {
        hasTableRef: Boolean(tableRef),
        hasCurrent: Boolean(tableRef?.current),
        hasRefresh: Boolean(tableRef?.current?.refresh),
        source: 'useBot',
        action: 'refreshTable',
      },
      source: 'BotManagement',
      component: 'useBot',
    });
    return false;
  }, [tableRef]);

  return refreshTable;
};
