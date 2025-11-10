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

import type { BotAttributeFiltersQuery } from '@bot/lib';
import type { CustomTableActionType } from '@veaiops/components';
import { logger } from '@veaiops/utils';
import type { BotAttribute } from 'api-generate';
import type React from 'react';
import { useCallback } from 'react';

/**
 * Refresh attributes table helper function Hook
 */
export const useRefreshAttributesTable = () => {
  // Helper function to refresh table
  // Note: Receive tableRef as parameter instead of creating internally, avoid conflict with tableRef in config Hook
  const refreshTable = useCallback(
    async (
      tableRef: React.RefObject<
        CustomTableActionType<BotAttribute, BotAttributeFiltersQuery>
      > | null,
    ) => {
      if (tableRef?.current?.refresh) {
        // ✅ Correct: Handle refresh method return value
        const result = await tableRef.current.refresh();
        if (!result.success && result.error) {
          // Refresh failed, but does not affect main operation, only log warning
          logger.warn({
            message: 'Failed to refresh attributes table',
            data: {
              error: result.error.message,
              stack: result.error.stack,
              errorObj: result.error,
            },
            source: 'BotAttributes',
            component: 'refreshTable',
          });
        }
      }
    },
    [],
  );

  return {
    refreshTable,
  };
};
