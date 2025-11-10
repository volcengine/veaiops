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

import { useTaskConfigStore } from '@/stores/task-config-store';
import type { FormInstance } from '@arco-design/web-react/es/Form';
import { logger } from '@veaiops/utils';
import type {
  IntelligentThresholdTask,
  IntelligentThresholdTaskDetail,
} from 'api-generate';
import { useEffect } from 'react';

interface UseFormInitializerParams {
  form: FormInstance;
  operationType: string;
  datasourceType?: string;
  setDatasourceType: (type: string) => void;
}

/**
 * Form initialization Hook
 */
export const useFormInitializer = ({
  form,
  operationType,
  datasourceType,
  setDatasourceType,
}: UseFormInitializerParams) => {
  // Get currently editing task and filter datasource type from Zustand store
  const { taskDrawer, filterDatasourceType } = useTaskConfigStore();
  const editingTask:
    | IntelligentThresholdTask
    | IntelligentThresholdTaskDetail
    | undefined = taskDrawer.record;

  // Initialize form data when drawer is opened and there is an editing task
  useEffect(() => {
    if (taskDrawer.visible && operationType === 'copy' && editingTask) {
      // When copying task, populate form data
      // ✅ Now using detail data (IntelligentThresholdTaskDetail), includes latest_version
      const taskDetail = editingTask as IntelligentThresholdTaskDetail;
      const newDatasourceType = taskDetail.datasource_type || 'Volcengine';

      logger.info({
        message: '📋 表单初始化（复制任务）',
        data: {
          taskName: taskDetail.task_name,
          templateId: taskDetail.template_id,
          hasLatestVersion: Boolean(taskDetail.latest_version),
          hasMetricTemplateValue: Boolean(
            taskDetail.latest_version?.metric_template_value,
          ),
          direction: taskDetail.latest_version?.direction,
          nCount: taskDetail.latest_version?.n_count,
        },
        source: 'TaskBasicForm',
        component: 'useFormInitializer',
      });

      form.setFieldsValue({
        taskName: taskDetail.task_name
          ? `${taskDetail.task_name}_副本`
          : '新任务_副本',
        datasourceType: newDatasourceType,
        datasourceId: taskDetail.datasource_id,
        // ✅ Key: Set template_id (metric template)
        template: taskDetail.template_id,
        projects: taskDetail.projects || [],
        products: taskDetail.products || [],
        customers: taskDetail.customers || [],
        // ✅ Use latest_version data
        direction: taskDetail.latest_version?.direction || 'both',
        nCount: taskDetail.latest_version?.n_count || 3,
        // ✅ Key: Set metric_template_value (threshold upper and lower bounds)
        metric_template_value: taskDetail.latest_version?.metric_template_value,
      });
      setDatasourceType(newDatasourceType);
    } else if (
      taskDrawer.visible &&
      operationType === 'create' &&
      !editingTask
    ) {
      // When creating new task, link datasource type from filter, default to Volcengine if filter not selected
      const defaultDatasourceType = filterDatasourceType || 'Volcengine';
      form.setFieldsValue({ nCount: 3, datasourceType: defaultDatasourceType });
      setDatasourceType(defaultDatasourceType);
    }
  }, [
    taskDrawer.visible,
    operationType,
    editingTask,
    form,
    filterDatasourceType,
    setDatasourceType,
  ]);
};
