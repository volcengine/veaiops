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

import { Button, Drawer, Form, Message } from '@arco-design/web-react';
import type {
  IntelligentThresholdTaskVersion,
  RerunIntelligentThresholdTaskRequest,
} from 'api-generate';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { rerunTask } from '../../../lib/data-source';
import { renderRerunForm } from '../../task';

/**
 * 重新执行抽屉 hook - 封装重新执行抽屉的状态和渲染逻辑
 */
export const useRerunDrawer = (
  tableRef: React.RefObject<any>,
): {
  visible: boolean;
  rerunData: IntelligentThresholdTaskVersion | null;
  form: any;
  loading: boolean;
  open: (data: IntelligentThresholdTaskVersion) => void;
  close: () => void;
  handleSubmit: () => Promise<boolean>;
  render: () => React.ReactElement;
} => {
  const [visible, setVisible] = useState(false);
  const [rerunData, setRerunData] =
    useState<IntelligentThresholdTaskVersion | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const open = useCallback((data: IntelligentThresholdTaskVersion) => {
    setRerunData(data);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setRerunData(null);
  }, []);

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    const values = await form.validate();
    const task_id = values.task_id || rerunData?.task_id;

    if (!task_id) {
      Message.error('任务ID不能为空');
      return false;
    }

    try {
      setLoading(true);

      // Build metric_template_value, setting normal_range_start and normal_range_end to null
      // if user didn't fill them, so backend won't use default values (10/90)
      // Note: Backend model default is now None, so sending null or omitting field will result in None
      const metricTemplateValue = values.metric_template_value || {};
      const cleanedMetricTemplateValue: Record<string, unknown> = {
        ...metricTemplateValue,
      };

      // Set to null if user didn't fill normal_range_start or normal_range_end
      // Backend will use None (not 10/90) when these fields are null or omitted
      if (
        cleanedMetricTemplateValue.normal_range_start === undefined ||
        cleanedMetricTemplateValue.normal_range_start === null ||
        cleanedMetricTemplateValue.normal_range_start === ''
      ) {
        cleanedMetricTemplateValue.normal_range_start = null;
      }

      if (
        cleanedMetricTemplateValue.normal_range_end === undefined ||
        cleanedMetricTemplateValue.normal_range_end === null ||
        cleanedMetricTemplateValue.normal_range_end === ''
      ) {
        cleanedMetricTemplateValue.normal_range_end = null;
      }

      const requestBody: RerunIntelligentThresholdTaskRequest = {
        task_id,
        direction: values.direction,
        n_count: values.n_count,
        metric_template_value:
          cleanedMetricTemplateValue as RerunIntelligentThresholdTaskRequest['metric_template_value'],
        sensitivity:
          (values.sensitivity as number) ??
          (values.metric_template_value?.sensitivity as number) ??
          0.5,
      };

      // ✅ Reuse rerunTask from api.ts to avoid duplicate API calls
      const success = await rerunTask(requestBody);

      if (success) {
        close();

        // Refresh table data to show new version results
        if (tableRef.current?.refresh) {
          const refreshResult = await tableRef.current.refresh();
          return refreshResult ?? true;
        }
        return true;
      }
      return false;
    } catch (error: unknown) {
      // Error handling is already done in rerunTask (Message.error and logger.error)
      // Just return false to indicate failure
      return false;
    } finally {
      setLoading(false);
    }
  }, [rerunData, form, close, tableRef]);

  // 同步表单数据
  useEffect(() => {
    if (rerunData) {
      // 将版本记录转换为表单字段格式
      const formData = {
        direction: rerunData.direction || 'both',
        n_count: rerunData.n_count || 3,
        sensitivity: rerunData.sensitivity ?? 0.5,
        metric_template_value: {
          normal_range_start:
            rerunData.metric_template_value?.normal_range_start ?? undefined,
          normal_range_end:
            rerunData.metric_template_value?.normal_range_end ?? undefined,
        },
        task_id: rerunData.task_id,
      };
      form.setFieldsValue(formData);
    }
  }, [rerunData, form]);

  const render = () => (
    <Drawer
      width={800}
      title={'重新执行'}
      visible={visible}
      onCancel={close}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={close}>取消</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            确定
          </Button>
        </div>
      }
    >
      {renderRerunForm({ form })}
    </Drawer>
  );

  return {
    visible,
    rerunData,
    form,
    loading,
    open,
    close,
    handleSubmit,
    render,
  };
};
