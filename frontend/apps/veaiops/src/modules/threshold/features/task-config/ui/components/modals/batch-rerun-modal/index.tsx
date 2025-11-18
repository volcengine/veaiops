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

import { Alert, Message, Modal, Radio } from '@arco-design/web-react';
import { updateAutoRefreshSwitch } from '@task-config/lib/data-source';
import { logger } from '@veaiops/utils';
import type React from 'react';
import { useMemo, useState } from 'react';

interface BatchRerunModalProps {
  visible: boolean;
  taskIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 批量自动更新确认弹窗
 */
export const BatchRerunModal: React.FC<BatchRerunModalProps> = ({
  visible,
  taskIds,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [radioValue, setRadioValue] = useState(true);

  const actionText = useMemo(
    () => (radioValue ? '批量更新' : '批量关闭'),
    [radioValue],
  );

  const handleConfirm = async (): Promise<{
    success: boolean;
    error?: Error;
  }> => {
    if (taskIds.length === 0) {
      Message.warning(`请选择要${actionText}的任务`);
      return { success: false, error: new Error('请选择要操作的任务') };
    }

    try {
      setLoading(true);

      // ✅ Reuse updateAutoRefreshSwitch from api.ts to avoid duplicate API calls
      await updateAutoRefreshSwitch(taskIds, radioValue);

      // Success message is already shown in updateAutoRefreshSwitch
      // Close modal and refresh
      onClose();
      onSuccess();
      return { success: true };
    } catch (error: unknown) {
      // Error handling is already done in updateAutoRefreshSwitch (Message.error and logger.error)
      // Just log additional context for batch operation
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: `批量${actionText}任务异常`,
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          tasksCount: taskIds.length,
          timestamp: Date.now(),
          errorObj,
        },
        source: 'BatchRerunModal',
        component: 'handleConfirm',
      });
      // Error message is already shown in updateAutoRefreshSwitch
      return { success: false, error: errorObj };
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      style={{ width: 500 }}
      visible={visible}
      title="批量自动更新"
      onOk={handleConfirm}
      onCancel={() => {
        onClose();
        setRadioValue(true);
      }}
      confirmLoading={loading}
      maskClosable={false}
      okText={actionText}
      cancelText="取消"
    >
      <div className="flex flex-col gap-4 -mt-3">
        <Alert
          type="info"
          content={`您已选择 ${taskIds.length} 条任务，请选择需要执行的操作`}
        />

        <Radio.Group
          value={radioValue}
          onChange={setRadioValue}
          style={{ marginLeft: 18 }}
        >
          <Radio value={true}>批量更新</Radio>
          <Radio value={false}>批量关闭</Radio>
        </Radio.Group>
      </div>
    </Modal>
  );
};
