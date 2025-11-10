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
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
} from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react/es/Form';
import { DrawerFormContent, useDrawerFormSubmit } from '@veaiops/utils';
import type { MetricTemplate } from 'api-generate';
import type React from 'react';
import { METRIC_TEMPLATE_MANAGEMENT_CONFIG } from '../lib/config';
import { getMetricTypeOptions } from '../lib/metric-type-translations';

/**
 * Metric template drawer component props interface
 */
interface MetricTemplateDrawerProps {
  visible: boolean;
  editingTemplate: MetricTemplate | null;
  form: FormInstance;
  onOk: () => Promise<boolean>;
  onCancel: () => void;
}

/** Use shared enum translation options to ensure form and list display Chinese consistently */

/**
 * Metric template drawer component
 */
export const MetricTemplateDrawer: React.FC<MetricTemplateDrawerProps> = ({
  visible,
  editingTemplate,
  form,
  onOk,
  onCancel,
}) => {
  const isEditing = Boolean(editingTemplate);
  const title = isEditing ? '编辑指标模板' : '新建指标模板';

  // Use common drawer form submit Hook
  // Note: onOk has already handled form validation in parent component, here just wrap as onSubmit
  const { submitting, handleSubmit } = useDrawerFormSubmit({
    form,
    onSubmit: async (values) => {
      // onOk has already handled form validation and submission logic in parent component
      // Here directly call onOk, it will internally handle form validation
      return await onOk();
    },
    resetOnSuccess: true,
    closeOnSuccess: false, // Don't auto-close, controlled by parent component
  });

  return (
    <Drawer
      title={title}
      visible={visible}
      onCancel={onCancel}
      width={METRIC_TEMPLATE_MANAGEMENT_CONFIG.drawer.width}
      placement="right"
      focusLock={false}
      footer={
        <div className="text-right">
          <Space>
            <Button onClick={onCancel} disabled={submitting}>
              取消
            </Button>
            <Button type="primary" onClick={handleSubmit} loading={submitting}>
              {isEditing ? '更新' : '创建'}
            </Button>
          </Space>
        </div>
      }
    >
      <DrawerFormContent loading={submitting}>
        <div>
          <Form form={form} layout="vertical">
            {/* Metric template name */}
            <Form.Item
              label="指标模版名称"
              field="name"
              rules={[{ required: true, message: '请输入模版名称' }]}
              required
              extra="为指标模板起一个易于识别的名称，如'CPU使用率'、'响应时间'等"
            >
              <Input
                placeholder="请输入模版名称，如：CPU使用率"
                style={{ width: '100%' }}
              />
            </Form.Item>

            {/* Metric template type */}
            <Form.Item
              label="指标模版类型"
              field="metric_type"
              rules={[{ required: true, message: '请选择指标模版类型' }]}
              required
              extra="选择指标的业务类型，影响阈值算法的计算方式和异常检测策略"
            >
              <Select
                placeholder="请选择指标类型"
                options={getMetricTypeOptions()}
                showSearch
                style={{ width: '100%' }}
              />
            </Form.Item>

            {/* Metric details area - only show core parameters */}
            <div>
              <h3 className="mb-4 text-sm font-medium">指标详情</h3>
              <div className="flex flex-wrap justify-between p-4 border border-[#e5e5e5] rounded-md bg-[#f9f9f9] gap-4">
                {/* First row */}
                <div className="flex gap-4 w-full">
                  <Form.Item
                    label="指标最小值"
                    field="min_value"
                    rules={[{ required: true, message: '请输入指标最小值' }]}
                    required
                    style={{ flex: 1 }}
                    extra="指标数据的理论最小值，用于算法边界约束和异常值过滤"
                  >
                    <InputNumber
                      placeholder="如：0"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="指标最大值"
                    field="max_value"
                    rules={[{ required: true, message: '请输入指标最大值' }]}
                    required
                    style={{ flex: 1 }}
                    extra="指标数据的理论最大值，用于算法边界约束和异常值过滤"
                  >
                    <InputNumber
                      placeholder="如：100"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </div>

                {/* Second row */}
                <div className="flex gap-4 w-full">
                  <Form.Item
                    label="默认阈值下界"
                    field="normal_range_start"
                    rules={[{ required: true, message: '请输入默认阈值下界' }]}
                    required
                    style={{ flex: 1 }}
                    extra="正常范围的下限值，低于此值可能触发异常告警"
                  >
                    <InputNumber
                      placeholder="如：20"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="默认阈值上界"
                    field="normal_range_end"
                    rules={[{ required: true, message: '请输入默认阈值上界' }]}
                    required
                    style={{ flex: 1 }}
                    extra="正常范围的上限值，高于此值可能触发异常告警"
                  >
                    <InputNumber
                      placeholder="如：80"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </div>

                {/* Third row - hidden fields (required by backend, frontend uses default values) */}
                <div className="flex gap-4 w-full">
                  <Form.Item
                    label="展示系数"
                    field="linear_scale"
                    initialValue={1.0}
                    rules={[{ required: true, message: '请输入展示系数' }]}
                    hidden
                    style={{ flex: 1 }}
                  >
                    <InputNumber
                      placeholder="请输入"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="最长无数据时间"
                    field="max_time_gap"
                    initialValue={3600}
                    rules={[
                      { required: true, message: '请输入最长无数据时间' },
                    ]}
                    hidden
                    style={{ flex: 1 }}
                  >
                    <InputNumber
                      placeholder="请输入"
                      suffix="秒"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </Form>
        </div>
      </DrawerFormContent>
    </Drawer>
  );
};

export default MetricTemplateDrawer;
