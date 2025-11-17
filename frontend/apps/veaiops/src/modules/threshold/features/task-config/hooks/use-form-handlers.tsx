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
  // ✅ Table refresh function, manually refresh table after create and edit success
  refreshTable?: () => Promise<{ success: boolean; error?: Error }>;
}

/**
 * Hook for task form handling
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
        // 🔍 Detailed logging for form submission entry
        logger.info({
          message:
            '[handleSubmit] ========== Starting form submission ==========',
          data: {
            operationType,
            timestamp: new Date().toISOString(),
            windowLocationHref: window.location.href,
            windowLocationSearch: window.location.search,
            windowLocationPathname: window.location.pathname,
            formValues: {
              taskName: values.taskName as string | undefined,
              datasourceType: values.datasourceType as string | undefined,
              datasourceTypeType: typeof values.datasourceType,
              datasourceId: values.datasourceId as string | undefined,
              allKeys: Object.keys(values),
            },
            // 🔍 Record form instance current values (for comparison)
            formCurrentValues: form.getFieldsValue(),
            formFieldDatasourceType: form.getFieldValue('datasourceType'),
          },
          source: 'TaskFormHandlers',
          component: 'handleSubmit',
        });

        setLoading(true);

        logger.info({
          message: '[handleSubmit] Loading 状态已设置为 true',
          data: {
            operationType,
          },
          source: 'TaskFormHandlers',
          component: 'handleSubmit',
        });

        if (operationType === 'create' || operationType === 'copy') {
          // 🔍 Detailed logging for datasourceType value during form submission
          logger.info({
            message:
              '[handleSubmit] Form submission - Checking datasourceType value',
            data: {
              operationType,
              valuesDatasourceType: values.datasourceType,
              valuesDatasourceTypeType: typeof values.datasourceType,
              allValuesKeys: Object.keys(values),
              formValues: {
                taskName: values.taskName,
                datasourceType: values.datasourceType,
                datasourceId: values.datasourceId,
              },
            },
            source: 'TaskFormHandlers',
            component: 'handleSubmit',
          });

          // Create task or copy task - construct request data conforming to backend API
          // 🔍 Key: Ensure datasource_type is correctly converted
          const rawDatasourceType = values.datasourceType;
          let finalDatasourceType: IntelligentThresholdTaskCreateRequest.datasource_type;

          // If rawDatasourceType is a string, try to convert to enum value
          if (typeof rawDatasourceType === 'string') {
            // Try to match enum values
            if (rawDatasourceType === 'Aliyun') {
              finalDatasourceType =
                IntelligentThresholdTaskCreateRequest.datasource_type.ALIYUN;
            } else if (rawDatasourceType === 'Volcengine') {
              finalDatasourceType =
                IntelligentThresholdTaskCreateRequest.datasource_type
                  .VOLCENGINE;
            } else if (rawDatasourceType === 'Zabbix') {
              finalDatasourceType =
                IntelligentThresholdTaskCreateRequest.datasource_type.ZABBIX;
            } else {
              // If string value doesn't match, try type assertion
              finalDatasourceType =
                (rawDatasourceType as IntelligentThresholdTaskCreateRequest.datasource_type) ||
                IntelligentThresholdTaskCreateRequest.datasource_type
                  .VOLCENGINE;
            }
          } else {
            // If not a string, try type assertion
            finalDatasourceType =
              (rawDatasourceType as IntelligentThresholdTaskCreateRequest.datasource_type) ||
              IntelligentThresholdTaskCreateRequest.datasource_type.VOLCENGINE;
          }

          logger.info({
            message: '[handleSubmit] datasource_type conversion result',
            data: {
              rawDatasourceType,
              finalDatasourceType,
              finalDatasourceTypeValue: finalDatasourceType,
              enumValues: {
                ALIYUN:
                  IntelligentThresholdTaskCreateRequest.datasource_type.ALIYUN,
                VOLCENGINE:
                  IntelligentThresholdTaskCreateRequest.datasource_type
                    .VOLCENGINE,
                ZABBIX:
                  IntelligentThresholdTaskCreateRequest.datasource_type.ZABBIX,
              },
            },
            source: 'TaskFormHandlers',
            component: 'handleSubmit',
          });

          const taskData: IntelligentThresholdTaskCreateRequest = {
            task_name: (values.taskName as string) || '新建任务',
            datasource_id:
              (values.datasourceId as string) || 'default-datasource',
            datasource_type: finalDatasourceType,
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
            sensitivity:
              (values.sensitivity as number) ??
              (values.metric_template_value?.sensitivity as number) ??
              0.5,
          };

          logger.info({
            message: '[handleSubmit] Preparing to call create task API',
            data: {
              operationType,
              taskName: taskData.task_name,
              datasourceType: taskData.datasource_type,
              datasourceTypeValue: taskData.datasource_type, // Enum value (string)
              datasourceId: taskData.datasource_id,
            },
            source: 'TaskFormHandlers',
            component: 'handleSubmit',
          });

          await createTask(taskData);

          logger.info({
            message: '[handleSubmit] Create task API call successful',
            data: {
              operationType,
              taskName: taskData.task_name,
            },
            source: 'TaskFormHandlers',
            component: 'handleSubmit',
          });
          Message.success(
            operationType === 'copy' ? '任务复制成功' : '任务创建成功',
          );

          // ✅ After successful creation, update URL parameters and refresh page based on datasource_type selected in form
          // Use taskData.datasource_type, as it's already the correct string value ('Aliyun', 'Volcengine', 'Zabbix')
          const createdDatasourceType = taskData.datasource_type as string;
          if (createdDatasourceType) {
            logger.info({
              message:
                '[handleSubmit] Preparing to update URL parameters and refresh page',
              data: {
                createdDatasourceType,
                taskDataDatasourceType: taskData.datasource_type,
                valuesDatasourceType: values.datasourceType,
                currentUrl: window.location.href,
              },
              source: 'TaskFormHandlers',
              component: 'handleSubmit',
            });

            try {
              // 🔍 Detailed logging for URL construction process
              const currentSearch = window.location.search;
              const currentPathname = window.location.pathname;
              const currentHref = window.location.href;

              logger.info({
                message: '[handleSubmit] URL construction - Starting',
                data: {
                  currentSearch,
                  currentPathname,
                  currentHref,
                  createdDatasourceType,
                  createdDatasourceTypeType: typeof createdDatasourceType,
                },
                source: 'TaskFormHandlers',
                component: 'handleSubmit',
              });

              // Build new URL, update datasource_type parameter
              const newParams = new URLSearchParams(currentSearch);

              // 🔍 Record state before parameter setting
              logger.info({
                message:
                  '[handleSubmit] URL construction - Before parameter setting',
                data: {
                  newParamsBefore: newParams.toString(),
                  newParamsHasDatasourceType: newParams.has('datasource_type'),
                  newParamsDatasourceTypeValue:
                    newParams.get('datasource_type'),
                },
                source: 'TaskFormHandlers',
                component: 'handleSubmit',
              });

              // Set new datasource_type parameter
              newParams.set('datasource_type', createdDatasourceType);

              // 🔍 Record state after parameter setting
              logger.info({
                message:
                  '[handleSubmit] URL construction - After parameter setting',
                data: {
                  newParamsAfter: newParams.toString(),
                  newParamsHasDatasourceType: newParams.has('datasource_type'),
                  newParamsDatasourceTypeValue:
                    newParams.get('datasource_type'),
                },
                source: 'TaskFormHandlers',
                component: 'handleSubmit',
              });

              const newUrl = `${currentPathname}?${newParams.toString()}`;

              logger.info({
                message: '[handleSubmit] URL construction - Completed',
                data: {
                  newUrl,
                  newUrlPathname: currentPathname,
                  newUrlSearch: `?${newParams.toString()}`,
                  datasourceType: createdDatasourceType,
                  urlComparison: {
                    old: currentHref,
                    new: newUrl,
                    changed: currentHref !== newUrl,
                  },
                },
                source: 'TaskFormHandlers',
                component: 'handleSubmit',
              });

              // 🔍 Record state before page refresh
              logger.info({
                message: '[handleSubmit] Preparing to execute page refresh',
                data: {
                  newUrl,
                  windowLocationHref: window.location.href,
                  windowLocationSearch: window.location.search,
                  windowLocationPathname: window.location.pathname,
                  willNavigate: true,
                },
                source: 'TaskFormHandlers',
                component: 'handleSubmit',
              });

              // Use window.location.href for full page refresh, ensure task list for corresponding datasource type is displayed
              window.location.href = newUrl;

              // 🔍 Record state after page refresh (this line may not execute, but used for debugging)
              logger.info({
                message: '[handleSubmit] Page refresh triggered',
                data: {
                  newUrl,
                  note: 'Page is refreshing, subsequent code may not execute',
                },
                source: 'TaskFormHandlers',
                component: 'handleSubmit',
              });

              return true; // After redirect, don't execute subsequent logic
            } catch (error: unknown) {
              const errorObj =
                error instanceof Error ? error : new Error(String(error));
              logger.error({
                message: '[handleSubmit] URL update failed',
                data: {
                  error: errorObj.message,
                  stack: errorObj.stack,
                  errorObj,
                  createdDatasourceType,
                },
                source: 'TaskFormHandlers',
                component: 'handleSubmit',
              });
              // When URL update fails, continue with original logic (refresh table)
            }
          } else {
            // ✅ If taskData.datasource_type is empty, log warning
            logger.warn({
              message:
                '[handleSubmit] taskData.datasource_type is empty, cannot update URL',
              data: {
                taskData,
                valuesDatasourceType: values.datasourceType,
                operationType,
              },
              source: 'TaskFormHandlers',
              component: 'handleSubmit',
            });
          }

          // ✅ After successful creation, manually call table refresh (if URL update failed or datasource_type not selected)
          if (refreshTable) {
            const refreshResult = await refreshTable();
            if (!refreshResult.success && refreshResult.error) {
              logger.warn({
                message: 'Failed to refresh table after creation',
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
          logger.info({
            message:
              '[handleSubmit] Task creation successful, preparing to close drawer',
            data: {
              operationType,
            },
            source: 'TaskFormHandlers',
            component: 'handleSubmit',
          });

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

        logger.error({
          message: '[handleSubmit] Task submission failed',
          data: {
            error: errorMessage,
            stack: errorObj.stack,
            errorObj,
            operationType,
          },
          source: 'TaskFormHandlers',
          component: 'handleSubmit',
        });

        Message.error(`操作失败：${errorMessage}`);
        return false;
      } finally {
        logger.info({
          message:
            '[handleSubmit] Submission process ended, setting Loading state to false',
          data: {
            operationType,
          },
          source: 'TaskFormHandlers',
          component: 'handleSubmit',
        });

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
          throw new Error(response.message || '创建告警规则失败');
        }
      } catch (error: unknown) {
        // ✅ Correct: Expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || '创建告警规则失败';
        Message.error(`告警规则创建失败：${errorMessage}`);
        logger.error({
          message: 'Alarm rule creation failed',
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
