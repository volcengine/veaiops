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

import type { FormInstance } from '@arco-design/web-react/es/Form';
import { useEffect } from 'react';

/**
 * useFormInitialization Hook 参数接口
 */
export interface UseFormInitializationParams {
  form: FormInstance;
  taskDrawerVisible: boolean;
  operationType: string;
  editingTask: any;
  setDatasourceType: (type: string) => void;
}

/**
 * 表单初始化Hook
 */
export const useFormInitialization = ({
  form,
  taskDrawerVisible,
  operationType,
  editingTask,
  setDatasourceType,
}: UseFormInitializationParams) => {
  useEffect(() => {
    if (taskDrawerVisible && operationType === 'copy' && editingTask) {
      // 复制任务时，填充表单数据
      const newDatasourceType = editingTask.datasource_type || 'Volcengine';
      form.setFieldsValue({
        taskName: editingTask.task_name || `${editingTask.task_name}_副本`,
        datasourceType: newDatasourceType,
        datasourceId: editingTask.datasource_id,
        products: editingTask.products || [],
        projects: editingTask.projects || [],
        customers: editingTask.customers || [],
        direction: editingTask.latest_version?.direction || 'both',
        nCount: editingTask.latest_version?.n_count || 7,
        sensitivity: editingTask.latest_version?.sensitivity ?? 0.5,
        metric_template_value:
          editingTask.latest_version?.metric_template_value,
      });
      setDatasourceType(newDatasourceType);
    } else if (
      taskDrawerVisible &&
      operationType === 'create' &&
      !editingTask
    ) {
      // 新建任务时，重置表单
      form.setFieldsValue({
        nCount: 3,
        sensitivity: 0.5,
        datasourceType: 'Volcengine',
      });
      setDatasourceType('Volcengine');
    }
  }, [taskDrawerVisible, operationType, editingTask, form, setDatasourceType]);
};
