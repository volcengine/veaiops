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

import { Form } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react/es/Form';
import { logger } from '@veaiops/utils';
import type React from 'react';
import { useEffect, useState } from 'react';
import { MetricTemplateForm } from '../../../shared-forms';
import { useDataSources, useFormInitializer } from './hooks';
import { BasicInfoFields } from './sections';
import type { TaskBasicFormProps } from './types';

/**
 * Task basic information form component
 */
export const TaskBasicForm: React.FC<TaskBasicFormProps> = ({
  form,
  loading,
  onSubmit,
  operationType,
}) => {
  const [datasourceType, setDatasourceType] = useState<string | undefined>(
    form.getFieldValue('datasourceType') || 'Volcengine',
  );

  // Data source configuration
  const { datasourceDataSource, templateDataSource, projectsDataSource } =
    useDataSources(datasourceType);

  // 🔍 Add debug logging: monitor changes in datasourceType and datasourceDataSource
  useEffect(() => {
    logger.info({
      message: '🔍 [TaskBasicForm] datasourceType 或 datasourceDataSource 变化',
      data: {
        datasourceType,
        datasourceDataSource: datasourceDataSource
          ? {
              api: (datasourceDataSource as any).api,
              hasServiceInstance: Boolean(
                (datasourceDataSource as any).serviceInstance,
              ),
              responseEntityKey: (datasourceDataSource as any)
                .responseEntityKey,
            }
          : null,
        timestamp: Date.now(),
      },
      source: 'TaskBasicForm',
      component: 'useEffect',
    });
  }, [datasourceType, datasourceDataSource]);

  // Form initialization
  useFormInitializer({
    form,
    operationType,
    datasourceType,
    setDatasourceType,
  });

  return (
    <Form form={form} layout="inline" onSubmit={onSubmit} disabled={loading}>
      <BasicInfoFields
        form={form}
        loading={loading}
        datasourceType={datasourceType}
        setDatasourceType={setDatasourceType}
        datasourceDataSource={datasourceDataSource}
        templateDataSource={templateDataSource}
        projectsDataSource={projectsDataSource}
      />
      {/* MetricTemplateForm - Import external component */}
      <MetricTemplateForm
        disabled={loading}
        operateType={operationType}
        prefixField="metric_template_value"
      />
    </Form>
  );
};

export default TaskBasicForm;
