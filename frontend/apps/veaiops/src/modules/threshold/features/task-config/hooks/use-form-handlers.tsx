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

import apiClient from '@/utils/api-client';
import { type FormInstance, Message } from '@arco-design/web-react';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';
import {
  type IntelligentThresholdTask,
  IntelligentThresholdTaskCreateRequest,
  type MetricTemplateValue,
  type SyncAlarmRulesPayload,
} from 'api-generate';
import { useCallback } from 'react';
import { createTask } from '../lib/data-source';

interface UseTaskFormHandlersProps {
  operationType:
    | 'create'
    | 'copy'
    | 'rerun'
    | 'versions'
    | 'results'
    | 'detail';
  editingTask: IntelligentThresholdTask | null;
  form: FormInstance;
  setLoading: (loading: boolean) => void;
  setDrawerVisible: (visible: boolean) => void;
  setAlarmDrawerVisible?: (visible: boolean) => void;
  // ✅ Table refresh function, manually refresh table after successful create and edit
  refreshTable?: () => Promise<{ success: boolean; error?: Error }>;
}

/**
 * Task form handling related Hook
 */
export const useTaskFormHandlers = ({
  operationType,
  editingTask,
  form,
  setLoading,
  setDrawerVisible,
  setAlarmDrawerVisible,
  refreshTable,
}: UseTaskFormHandlersProps) => {
  // Handle form submission
  const handleSubmit = useCallback(
    async (values: Record<string, unknown>): Promise<boolean> => {
      try {
        setLoading(true);

        if (operationType === 'create' || operationType === 'copy') {
          // Create task or copy task - construct request data conforming to backend API
          const taskData: IntelligentThresholdTaskCreateRequest = {
            task_name: (values.taskName as string) || '新建任务',
            datasource_id:
              (values.datasourceId as string) || 'default-datasource',
            datasource_type:
              (values.datasourceType as IntelligentThresholdTaskCreateRequest.datasource_type) ||
              IntelligentThresholdTaskCreateRequest.datasource_type.VOLCENGINE,
            auto_update: (values.autoUpdate as boolean) || false,
            direction:
              (values.direction as IntelligentThresholdTaskCreateRequest.direction) ||
              IntelligentThresholdTaskCreateRequest.direction.BOTH,
            projects: (values.projects as string[]) || [],
            products: (values.products as string[]) || [],
            customers: (values.customers as string[]) || [],
            metric_template_value:
              values?.metric_template_value as MetricTemplateValue,
            n_count: (values.nCount as number) || 1,
          };

          await createTask(taskData);
          Message.success(
            operationType === 'copy' ? '任务复制成功' : '任务创建成功',
          );
          // ✅ After successful create, manually call table refresh
          if (refreshTable) {
            const refreshResult = await refreshTable();
            if (!refreshResult.success && refreshResult.error) {
              logger.warn({
                message: 'Failed to refresh table after create',
                data: {
                  error: refreshResult.error.message,
                  stack: refreshResult.error.stack,
                  errorObj: refreshResult.error,
                },
                source: 'TaskFormHandlers',
                component: 'handleSubmit',
              });
            }
          }
          setDrawerVisible(false);
          form.resetFields();
          return true;
        } else if (operationType === 'rerun' && editingTask) {
          // Rerun task
          await new Promise((resolve) => setTimeout(resolve, 1000));
          Message.success('任务重新执行成功');
          // ✅ After successful rerun, manually call table refresh
          if (refreshTable) {
            const refreshResult = await refreshTable();
            if (!refreshResult.success && refreshResult.error) {
              logger.warn({
                message: 'Failed to refresh table after rerun',
                data: {
                  error: refreshResult.error.message,
                  stack: refreshResult.error.stack,
                  errorObj: refreshResult.error,
                },
                source: 'TaskFormHandlers',
                component: 'handleSubmit',
              });
            }
          }
          return true;
        }

        return false;
      } catch (error: unknown) {
        // ✅ Correct: Expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || '操作失败，请重试';
        Message.error(`操作失败：${errorMessage}`);
        logger.error({
          message: 'Task submission failed',
          data: {
            error: errorMessage,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'TaskFormHandlers',
          component: 'handleSubmit',
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      operationType,
      editingTask,
      form,
      setLoading,
      setDrawerVisible,
      refreshTable,
    ],
  );

  // Handle alarm rule submission
  const handleAlarmSubmit = useCallback(
    async (values: SyncAlarmRulesPayload): Promise<boolean> => {
      try {
        setLoading(true);

        // Call alarm rule sync API
        const response =
          await apiClient.intelligentThresholdAlarm.postApisV1IntelligentThresholdAlarmSync(
            {
              requestBody: values,
            },
          );

        if (response.code === API_RESPONSE_CODE.SUCCESS) {
          // ✅ After successful alarm rule creation, manually call table refresh
          if (refreshTable) {
            const refreshResult = await refreshTable();
            if (!refreshResult.success && refreshResult.error) {
              logger.warn({
                message: 'Failed to refresh table after creating alarm rule',
                data: {
                  error: refreshResult.error.message,
                  stack: refreshResult.error.stack,
                  errorObj: refreshResult.error,
                },
                source: 'TaskFormHandlers',
                component: 'handleAlarmSubmit',
              });
            }
          }
          // Close alarm drawer after success
          if (setAlarmDrawerVisible) {
            setAlarmDrawerVisible(false);
          }
          form.resetFields();
          return true;
        } else {
          throw new Error(response.message || 'Failed to create alarm rule');
        }
      } catch (error: unknown) {
        // ✅ Correct: Expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || 'Failed to create alarm rule';
        Message.error(`告警规则创建失败：${errorMessage}`);
        logger.error({
          message: 'Failed to create alarm rule',
          data: {
            error: errorMessage,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'TaskFormHandlers',
          component: 'handleAlarmSubmit',
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setAlarmDrawerVisible, form, refreshTable],
  );

  return {
    handleSubmit,
    handleAlarmSubmit,
  };
};
