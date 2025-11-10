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
 * Bot attribute table delete handler Hook
 */
export const useBotAttributesTableDeleteHandler = ({
  deleteAttribute,
  refreshTable,
}: {
  deleteAttribute: (attribute: BotAttribute) => Promise<boolean>;
  refreshTable: (
    tableRef: React.RefObject<
      CustomTableActionType<BotAttribute, BotAttributeFiltersQuery>
    > | null,
  ) => Promise<boolean>;
}) => {
  /**
   * Handle delete operation
   * Note: Receive tableRef parameter for refreshing table
   */
  const handleDelete = useCallback(
    async (
      attribute: BotAttribute,
      tableRef: React.RefObject<
        CustomTableActionType<BotAttribute, BotAttributeFiltersQuery>
      > | null,
    ): Promise<boolean> => {
      try {
        const success = await deleteAttribute(attribute);
        if (success) {
          // Refresh table after successful delete
          const refreshSuccess = await refreshTable(tableRef);
          return refreshSuccess;
        }
        return false;
      } catch (error: unknown) {
        // ✅ Correct: Use logger to record error and expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: 'Failed to delete attribute',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
            attributeId: attribute._id,
          },
          source: 'BotAttributesTable',
          component: 'handleDelete',
        });
        return false;
      }
    },
    [deleteAttribute, refreshTable],
  );

  return {
    handleDelete,
  };
};
