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

import type { FormInstance } from '@arco-design/web-react';
import type { UpdateBotParams } from '@bot/hooks';
import type { Bot, BotUpdateRequest } from '@bot/lib';
import { useManagementRefresh } from '@veaiops/hooks';
import { useCallback } from 'react';
import { handleUpdateError } from './error-handler';
import { useUpdateLogic } from './update-logic';
import { validateUpdateRequest } from './validation';

/**
 * Update handler parameters
 */
interface UpdateHandlerParams {
  editingBot: Bot | null;
  updateBot: (params: UpdateBotParams) => Promise<boolean>;
  form: FormInstance;
  setModalVisible: (visible: boolean) => void;
  setEditingBot: (bot: Bot | null) => void;
  refreshTable: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
}

/**
 * Update Bot handler
 *
 * Split description:
 * - validation.ts: Pre-update validation (validateUpdateRequest)
 * - update-logic.ts: Update logic (executeUpdate, includes API call and refresh)
 * - error-handler.ts: Error handling (handleUpdateError)
 * - index.ts: Unified export, combine all logic
 */
export const useUpdateHandler = ({
  editingBot,
  updateBot,
  form,
  setModalVisible,
  setEditingBot,
  refreshTable,
  setLoading,
}: UpdateHandlerParams) => {
  // Use management refresh hook
  const { afterUpdate } = useManagementRefresh(refreshTable);

  // Update logic
  const { executeUpdate } = useUpdateLogic({
    editingBot,
    updateBot,
    form,
    setModalVisible,
    setEditingBot,
    afterUpdate,
    setLoading,
  });

  const handleUpdate = useCallback(
    async (values: BotUpdateRequest) => {
      // Validate
      if (!validateUpdateRequest({ editingBot })) {
        return false;
      }

      // Execute update
      try {
        return await executeUpdate(values);
      } catch (error) {
        handleUpdateError({ error, botId: editingBot?._id });
        return false;
      }
    },
    [editingBot, executeUpdate],
  );

  return { handleUpdate };
};
