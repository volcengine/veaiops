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

import type { TaskTableActions } from '@task-config/lib';
import { logger } from '@veaiops/utils';
import type { IntelligentThresholdTask } from 'api-generate';
import { useMemo } from 'react';

interface UseTableActionsParams {
  handleTaskDetail?: (task: IntelligentThresholdTask) => void;
}

/**
 * Table operation configuration Hook
 */
export const useTableActions = ({
  handleTaskDetail,
}: UseTableActionsParams): TaskTableActions => {
  // 🎯 Build table operation configuration - use passed callback functions
  const tableActions: TaskTableActions = useMemo(
    () => ({
      onAdd: async (): Promise<boolean> => {
        // Add task - implemented by caller
        return true;
      },
      onTaskDetail:
        handleTaskDetail ||
        (() => {
          // Task details - implemented by caller
        }),
      onRerun: () => {
        // Rerun - implemented by caller
      },
      onViewVersions: () => {
        // View versions - implemented by caller
      },
      onCreateAlarm: () => {
        // Create alarm - implemented by caller
      },
      onCopy: () => {
        // Copy task - implemented by caller
      },
      onBatchRerun: () => {
        // Batch rerun - implemented by caller
      },
      onDelete: async (taskId: string): Promise<boolean> => {
        // ✅ Correct: use logger to record information
        logger.info({
          message: '删除任务',
          data: { taskId },
          source: 'useManagementLogic',
          component: 'onDelete',
        });
        // Delete task - implemented by caller
        return true;
      },
    }),
    [handleTaskDetail],
  );

  return tableActions;
};
