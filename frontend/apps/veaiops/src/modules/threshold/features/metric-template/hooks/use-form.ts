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
import type { MetricTemplate } from 'api-generate';
import { useCallback, useState } from 'react';

/**
 * Metric template form handling Hook
 * Provides form state management and operation handling logic
 */
export const useMetricTemplateForm = () => {
  const [form] = Form.useForm();
  const [editingTemplate, setEditingTemplate] = useState<MetricTemplate | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  /**
   * Handle edit operation
   */
  const handleEdit = useCallback(
    async (template: MetricTemplate): Promise<boolean> => {
      setEditingTemplate(template);
      setModalVisible(true);
      // Populate form data
      form.setFieldsValue({ ...template });
      return true; // Edit operation successful
    },
    [form],
  );

  /**
   * Handle create operation
   */
  const handleAdd = useCallback(async (): Promise<boolean> => {
    setEditingTemplate(null);
    setModalVisible(true);
    form.resetFields();
    return true; // Create operation successful
  }, [form]);

  /**
   * Handle modal cancel
   */
  const handleCancel = useCallback(() => {
    setModalVisible(false);
    setEditingTemplate(null);
    form.resetFields();
  }, [form]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (onSubmit: (values: any) => Promise<any>) => {
      try {
        const values = await form.validate();

        // Add default values for fields not displayed in form
        const completeValues = {
          ...values,
          min_step: values.min_step ?? 0.01,
          min_violation: values.min_violation ?? 0,
          min_violation_ratio: values.min_violation_ratio ?? 0.0,
          missing_value: values.missing_value ?? 'string',
          failure_interval_expectation:
            values.failure_interval_expectation ?? 1,
          display_unit: values.display_unit ?? '',
          linear_scale: values.linear_scale ?? 1.0,
          max_time_gap: values.max_time_gap ?? 3600,
          min_ts_length: values.min_ts_length ?? 600,
        };

        const result = await onSubmit(completeValues);

        // Determine success based on result
        if (result) {
          setModalVisible(false);
          setEditingTemplate(null);
          form.resetFields();
          return result;
        } else {
          // Operation failed, keep modal open
          return false;
        }
      } catch (error) {
        // Form validation failed or API call failed (error already handled in Hook)
        return false;
      }
    },
    [form],
  );

  return {
    // State
    form,
    editingTemplate,
    modalVisible,

    // Operation methods
    handleEdit,
    handleAdd,
    handleCancel,
    handleSubmit,
  };
};
