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

/**
 * Confirmation modal event handlers Hook
 * @description Handles confirm and cancel event logic
 */

import { Message } from '@arco-design/web-react';
import { logger } from '@veaiops/utils';
import { useCallback } from 'react';
import type {
  DataSourceType,
  StepConfig,
  WizardActions,
  WizardState,
} from '../../../types';
import { handleStepDataFetch } from '../../../utils/wizard-logic';

export interface UseModalHandlersProps {
  selectedType: DataSourceType;
  currentStepConfig: StepConfig;
  state: WizardState;
  actions: WizardActions;
  onClose: () => void;
  onConfirm: (dataSource?: unknown) => void;
  editingDataSource?: any;
}

/**
 * Confirmation modal event handlers Hook
 */
export const useModalHandlers = ({
  selectedType,
  currentStepConfig,
  state,
  actions,
  onClose,
  onConfirm,
  editingDataSource,
}: UseModalHandlersProps) => {
  const handleOk = useCallback(async () => {
    try {
      logger.info({
        message: '[CreationConfirmModal] handleOk 开始执行',
        data: {
          selectedType,
          stepKey: currentStepConfig.key,
          editingDataSourceId: state.editingDataSourceId,
        },
        source: 'CreationConfirmModal',
        component: 'handleOk',
      });

      // Execute data source creation logic, return creation result
      const result = await handleStepDataFetch(
        selectedType,
        state,
        actions,
        currentStepConfig.key,
      );

      logger.info({
        message: '[CreationConfirmModal] handleStepDataFetch 返回结果',
        data: {
          success: result?.success,
          hasResult: Boolean(result),
          resultMessage: result?.message,
        },
        source: 'CreationConfirmModal',
        component: 'handleOk',
      });

      // Check if creation was successful
      if (result?.success) {
        logger.info({
          message: '[CreationConfirmModal] 创建成功，准备关闭向导',
          data: {
            dataSourceId: result.dataSourceId,
            dataSourceName: state.dataSourceName,
          },
          source: 'CreationConfirmModal',
          component: 'handleOk',
        });

        // Close wizard after successful creation
        // Pass data source info to callback to trigger page refresh
        const dataSourceInfo = {
          name: state.dataSourceName,
          type: selectedType,
          connectName: state.selectedConnect?.name,
          dataSourceId: result.dataSourceId,
        };
        onConfirm(dataSourceInfo);
      } else {
        // ✅ Fix: Show error message when creation fails
        const errorMessage = result?.message || '创建数据源失败，请重试';

        logger.error({
          message:
            '[CreationConfirmModal] 创建失败（result.success === false）',
          data: {
            errorMessage,
            resultMessage: result?.message,
            result,
          },
          source: 'CreationConfirmModal',
          component: 'handleOk',
        });

        Message.error(errorMessage);
        // Creation failed, don't close wizard, allow user to retry
      }
    } catch (error: unknown) {
      // ✅ Fix: Show error message when creation fails
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = errorObj.message || '创建数据源失败，请重试';

      logger.error({
        message: '[CreationConfirmModal] 创建失败（catch 块）',
        data: {
          error: errorMessage,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'CreationConfirmModal',
        component: 'handleOk',
      });

      // ✅ Fix: Show error message to user
      Message.error(errorMessage);
      // Don't call onConfirm on creation failure, keep modal open
    }
  }, [selectedType, state, actions, currentStepConfig, onConfirm]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [selectedType, state.dataSourceName, onClose]);

  return {
    handleOk,
    handleCancel,
  };
};
