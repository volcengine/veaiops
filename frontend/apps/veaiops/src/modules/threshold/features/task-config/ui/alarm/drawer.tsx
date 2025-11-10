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

import {
  Alert,
  Button,
  Drawer,
  Form,
  Message,
  Space,
} from '@arco-design/web-react';
import { TASK_CONFIG_MANAGEMENT_CONFIG } from '@task-config/lib';
import { DrawerFormContent, logger } from '@veaiops/utils';
import type { SyncAlarmRulesPayload } from 'api-generate';
import type React from 'react';
import { AlarmConfigForm, buildAlarmSubmitData } from '../components/alarm';
import { TaskInfoCard } from '../components/displays';
import type { AlarmDrawerProps } from '../components/shared';

/**
 * Alarm rule creation drawer component
 */
export const AlarmDrawer: React.FC<AlarmDrawerProps> = ({
  visible,
  task,
  onCancel,
  onSubmit,
  loading,
}) => {
  const [form] = Form.useForm();

  // Get datasource type
  const datasourceType = task?.datasource_type || '';
  const datasourceId = task?.datasource_id || '';

  // Submit alarm rule
  const handleSubmit = async (): Promise<boolean> => {
    try {
      // Step 1: Validate form fields
      const validateResult = await form
        .validate(['alarmLevel'])
        .then(() => ({ success: true }))
        .catch((error) => {
          return { success: false, error };
        });

      if (!validateResult.success) {
        return false;
      }

      // Step 2: Get form values
      const values = form.getFieldsValue();

      // Step 3: Build submission data
      // task type is IntelligentThresholdTask | null, need to convert to Record<string, unknown>
      const buildResult = buildAlarmSubmitData(
        values,
        (task ? { ...task } : {}) as Record<string, unknown>,
        datasourceType,
      );

      if (!buildResult.success) {
        Message.error(buildResult.error || '构建提交数据失败');
        return false;
      }

      if (!buildResult.data) {
        Message.error('构建的数据为空，无法提交');
        return false;
      }
      // buildAlarmSubmitData return type is explicitly defined as SyncAlarmRulesPayload, no type assertion needed
      const success = await onSubmit(buildResult.data);

      // Step 5: Reset form after success
      if (success) {
        form.resetFields();
      }

      return success;
    } catch (error: unknown) {
      // ✅ Correct: Expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = errorObj.message || '提交告警规则失败';
      Message.error(errorMessage);
      logger.error({
        message: '提交告警规则失败',
        data: {
          error: errorMessage,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'AlarmDrawer',
        component: 'handleSubmit',
      });
      return false;
    }
  };

  return (
    <Drawer
      width={TASK_CONFIG_MANAGEMENT_CONFIG.drawer.width}
      title="创建告警规则"
      visible={visible}
      onCancel={onCancel}
      maskClosable={!loading}
      focusLock={false}
      unmountOnExit
      footer={
        <Space>
          <Button onClick={onCancel} disabled={loading}>
            取消
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            创建告警规则
          </Button>
        </Space>
      }
    >
      <DrawerFormContent loading={Boolean(loading)}>
        <div>
          {/* Task information */}
          {task && (
            <TaskInfoCard task={task as unknown as Record<string, any>} />
          )}

          {/* Hint information */}
          <Alert
            type="info"
            content="告警事件默认会通过 Webhook 投递到事件中心"
            className="mb-4"
          />

          {/* Global alarm configuration */}
          <AlarmConfigForm
            form={form}
            loading={loading}
            datasourceType={datasourceType}
            datasourceId={datasourceId}
          />
        </div>
      </DrawerFormContent>
    </Drawer>
  );
};

export default AlarmDrawer;
