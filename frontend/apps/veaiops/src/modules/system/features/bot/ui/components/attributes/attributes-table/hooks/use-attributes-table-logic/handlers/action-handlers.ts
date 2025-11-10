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

import { logger } from '@veaiops/utils';
import type { BotAttribute } from 'api-generate';
import { useCallback } from 'react';

/**
 * Bot attributes table action handling Hook
 */
export const useAttributesTableActionHandlers = ({
  deleteAttribute,
  setEditingAttribute,
  setModalType,
  setIsModalVisible,
  refreshTable,
}: {
  deleteAttribute: (attribute: BotAttribute) => Promise<boolean>;
  setEditingAttribute: (attribute: BotAttribute | null) => void;
  setModalType: (type: 'create' | 'edit') => void;
  setIsModalVisible: (visible: boolean) => void;
  refreshTable: () => Promise<void>;
}) => {
  /**
   * Handle delete operation
   */
  const handleDelete = useCallback(
    async (attribute: BotAttribute): Promise<void> => {
      try {
        logger.info({
          message: '[handleDelete] 🎯 Starting to delete interest',
          data: {
            attributeId: attribute._id,
            attributeName: attribute.name,
          },
          source: 'BotAttributesTable',
          component: 'handleDelete',
        });

        const success = await deleteAttribute(attribute);

        logger.info({
          message: '[handleDelete] ✅ deleteAttribute call completed',
          data: {
            success,
          },
          source: 'BotAttributesTable',
          component: 'handleDelete',
        });

        // ✅ Refresh table after successful deletion
        if (success) {
          logger.info({
            message: '[handleDelete] 🔄 Preparing to call refreshTable',
            data: {},
            source: 'BotAttributesTable',
            component: 'handleDelete',
          });
          await refreshTable();
          logger.info({
            message: '[handleDelete] ✅ refreshTable call completed',
            data: {},
            source: 'BotAttributesTable',
            component: 'handleDelete',
          });
        } else {
          logger.warn({
            message:
              '[handleDelete] ⚠️ deleteAttribute returned false, not refreshing table',
            data: {},
            source: 'BotAttributesTable',
            component: 'handleDelete',
          });
        }
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
      }
    },
    [deleteAttribute, refreshTable],
  );

  /**
   * Handle edit operation
   */
  const handleEdit = useCallback(
    async (attribute: BotAttribute): Promise<boolean> => {
      try {
        setEditingAttribute(attribute);
        setModalType('edit');
        setIsModalVisible(true);
        return true;
      } catch (error) {
        // ✅ Correct: Use logger to record error and expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: 'Edit operation failed',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'BotAttributesTable',
          component: 'handleEdit',
        });
        return false;
      }
    },
    [setEditingAttribute, setModalType, setIsModalVisible],
  );

  return {
    handleDelete,
    handleEdit,
  };
};
