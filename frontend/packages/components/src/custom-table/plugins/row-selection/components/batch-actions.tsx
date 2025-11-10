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

import type {
  BaseRecord,
  BatchActionConfig,
  RowSelectionState,
} from '@/custom-table/types';
import { devLog } from '@/custom-table/utils';
import { Button, Modal, Space } from '@arco-design/web-react';
import { IconExclamationCircle } from '@arco-design/web-react/icon';
/**
 * Batch actions component
 * Displays batch action buttons based on row selection state
 */
import type React from 'react';
import { useState } from 'react';
import styles from './batch-actions.module.less';

interface BatchActionsProps<RecordType extends BaseRecord = BaseRecord> {
  /** Batch action configuration */
  actions: BatchActionConfig<RecordType>[];
  /** Selection state */
  selectionState: RowSelectionState<RecordType>;
  /** Execute batch action */
  onExecuteAction: (action: BatchActionConfig<RecordType>) => Promise<void>;
  /** Style class name */
  className?: string;
}

export const BatchActions = <RecordType extends BaseRecord = BaseRecord>({
  actions,
  selectionState,
  onExecuteAction,
  className,
}: BatchActionsProps<RecordType>): React.ReactElement | null => {
  const [loading, setLoading] = useState<string | null>(null);
  const { selectedRowKeys, selectedRows } = selectionState;

  // Don't display when no rows are selected
  if (selectedRowKeys.length === 0) {
    return null;
  }

  // Handle action execution
  const handleAction = async (action: BatchActionConfig<RecordType>) => {
    try {
      // Permission check
      if (action.permission && !action.permission(selectedRows)) {
        devLog.warn({
          component: 'BatchActions',
          message: 'Permission denied for action',
          data: {
            action: action.key,
          },
        });
        return;
      }

      // Disabled state check
      if (
        typeof action.disabled === 'function' &&
        action.disabled(selectedRows)
      ) {
        devLog.warn({
          component: 'BatchActions',
          message: 'Action is disabled',
          data: {
            action: action.key,
          },
        });
        return;
      }

      if (typeof action.disabled === 'boolean' && action.disabled) {
        devLog.warn({
          component: 'BatchActions',
          message: 'Action is disabled',
          data: {
            action: action.key,
          },
        });
        return;
      }

      // Confirmation prompt
      if (action.confirmText) {
        const confirmMessage =
          typeof action.confirmText === 'function'
            ? action.confirmText(selectedRows)
            : action.confirmText;

        Modal.confirm({
          title: 'Confirm Operation',
          icon: <IconExclamationCircle />,
          content: confirmMessage,
          okText: 'Confirm',
          cancelText: 'Cancel',
          onOk: async () => {
            await executeAction(action);
          },
        });
      } else {
        await executeAction(action);
      }
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      devLog.error({
        component: 'BatchActions',
        message: 'Failed to handle action',
        data: {
          action: action.key,
          error: errorObj.message,
          errorObj,
        },
      });
    }
  };

  // Execute action
  const executeAction = async (action: BatchActionConfig<RecordType>) => {
    setLoading(action.key);
    try {
      await onExecuteAction(action);
      devLog.log({
        component: 'BatchActions',
        message: 'Action executed successfully',
        data: {
          action: action.key,
          selectedCount: selectedRows.length,
        },
      });
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      devLog.error({
        component: 'BatchActions',
        message: 'Action execution failed',
        data: {
          action: action.key,
          error: errorObj.message,
          errorObj,
        },
      });
      throw errorObj;
    } finally {
      setLoading(null);
    }
  };

  // Render action buttons
  const renderActionButton = (action: BatchActionConfig<RecordType>) => {
    const isDisabled =
      typeof action.disabled === 'function'
        ? action.disabled(selectedRows)
        : action.disabled;

    const hasPermission = !action.permission || action.permission(selectedRows);

    return (
      <Button
        key={action.key}
        type={action.danger ? 'primary' : 'outline'}
        status={action.danger ? 'danger' : 'default'}
        icon={action.icon}
        loading={loading === action.key}
        disabled={isDisabled || !hasPermission}
        onClick={() => handleAction(action)}
        size="small"
      >
        {action.title}
      </Button>
    );
  };

  return (
    <div className={`${styles.batchActions} ${className || ''}`}>
      <Space size={8}>
        <span className={styles.selectedInfo}>
          {selectedRowKeys.length} item(s) selected
        </span>
        {actions.map(renderActionButton)}
      </Space>
    </div>
  );
};
