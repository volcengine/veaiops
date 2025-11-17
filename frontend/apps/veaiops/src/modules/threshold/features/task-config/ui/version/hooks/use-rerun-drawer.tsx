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
import { Button, Drawer, Form, Message } from '@arco-design/web-react';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';
import type {
  IntelligentThresholdTaskVersion,
  RerunIntelligentThresholdTaskRequest,
} from 'api-generate';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
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
      const requestBody: RerunIntelligentThresholdTaskRequest = {
        task_id,
        direction: values.direction,
        n_count: values.n_count,
        metric_template_value: values.metric_template_value,
        sensitivity:
          (values.sensitivity as number) ??
          (values.metric_template_value?.sensitivity as number) ??
          0.5,
      };

      const response =
        await apiClient.intelligentThresholdTask.postApisV1IntelligentThresholdTaskRerun(
          {
            requestBody,
          },
        );

      if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
        Message.success('任务重新执行成功');
        close();

        // 刷新表格数据以显示新的版本结果
        if (tableRef.current?.refresh) {
          const refreshResult = await tableRef.current.refresh();
          return refreshResult ?? true;
        }
        return true;
      } else {
        throw new Error(response.message || '任务重新执行失败');
      }
    } catch (error: unknown) {
      // ✅ 正确：使用 logger 记录错误，并透出实际错误信息
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: '任务重新执行失败',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
          request: values,
          timestamp: Date.now(),
        },
        source: 'useRerunDrawer',
        component: 'handleSubmit',
      });
      const errorMessage = errorObj.message || '任务重新执行失败';
      Message.error(errorMessage);
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
