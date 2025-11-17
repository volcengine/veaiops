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

import { DocsDrawer } from '@/components/common/docs-drawer';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Slider,
} from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react/es/Form';
import { Select, Input as VeInput } from '@veaiops/components';
import type React from 'react';
import { useState } from 'react';
// 定义指标类型选项
const metricTypeOptions = [
  { label: 'CPU', value: 'cpu' },
  { label: '内存', value: 'memory' },
  { label: '磁盘', value: 'disk' },
  { label: '网络', value: 'network' },
];

interface MetricDetailConfigProps {
  form: FormInstance;
  readOnly?: boolean;
}

/**
 * 指标详情配置组件
 */
export const MetricDetailConfig: React.FC<MetricDetailConfigProps> = ({
  form,
  readOnly = false,
}) => {
  const [docsDrawerVisible, setDocsDrawerVisible] = useState(false);

  const handleOpenDocs = () => {
    setDocsDrawerVisible(true);
  };

  return (
    <>
      <Form form={form} layout="vertical" disabled={readOnly}>
        <div className={'flex justify-between w-[100%]'}>
          {/* 阈值方向 */}
          <Select.Block
            isControl
            inline
            required
            formItemProps={{
              label: '阈值方向',
              field: 'direction',
              rules: [{ required: true, message: '阈值方向必填' }],
            }}
            controlProps={{
              placeholder: '请选择阈值方向',
              options: [
                { label: '上界', value: 'up' },
                { label: '下界', value: 'down' },
                { label: '上下界', value: 'both' },
              ],
            }}
          />
          {/* 滑动窗口 */}
          <VeInput.Number
            isControl
            required
            inline
            formItemProps={{
              label: '滑动窗口',
              field: 'n_count',
              rules: [{ required: true, message: '请输入滑动窗口' }],
            }}
            controlProps={{
              min: 1,
              max: 100,
              precision: 0,
            }}
          />
        </div>

        {/* 指标详情区域 */}
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium">指标详情</h3>
            <Button
              type="text"
              size="small"
              onClick={handleOpenDocs}
              className="text-blue-600 hover:text-blue-700"
            >
              📖 查看文档
            </Button>
          </div>
          <div
            className={`flex flex-wrap justify-between p-4 border border-[#e5e5e5] rounded-md bg-[#f9f9f9] ${readOnly ? 'gap-4' : 'gap-0'}`}
          >
            <div
              className={`w-full flex ${readOnly ? 'flex-row gap-4' : 'flex-col gap-0'}`}
            >
              {/* 指标模版名称 */}
              <VeInput.Block
                isControl
                required
                inline
                formItemProps={{
                  label: '指标模版名称',
                  field: 'metric_template_value.name',
                  hidden: !readOnly,
                }}
                controlProps={{
                  placeholder: '请输入模版名称',
                }}
              />
              {/* 指标模版 */}
              <Select.Block
                isControl
                inline
                required
                formItemProps={{
                  label: '指标模版类型',
                  field: 'metric_template_value.metric_type',
                  hidden: !readOnly,
                }}
                controlProps={{
                  options: metricTypeOptions,
                }}
              />
            </div>

            {/* 第一行 */}
            <div
              className={`w-full flex ${readOnly ? 'flex-row gap-4' : 'flex-col gap-0'}`}
            >
              <Form.Item
                label="最小步长"
                field="metric_template_value.min_step"
                rules={[{ required: true, message: '请输入最小步长' }]}
                hidden={!readOnly}
                required
                style={{ flex: 1 }}
              >
                <InputNumber placeholder="请输入" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                label="最小异常值"
                field="metric_template_value.min_violation"
                rules={[{ required: true, message: '请输入最小异常值' }]}
                hidden={!readOnly}
                required
                style={{ flex: 1 }}
              >
                <InputNumber placeholder="请输入" style={{ width: '100%' }} />
              </Form.Item>
            </div>

            {/* 第二行 */}
            <div
              className={`w-full flex ${readOnly ? 'flex-row gap-4' : 'flex-col gap-0'}`}
            >
              <Form.Item
                label="指标最小值"
                field="metric_template_value.min_value"
                style={{ flex: 1 }}
              >
                <InputNumber placeholder="请输入" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                label="指标最大值"
                field="metric_template_value.max_value"
                style={{ flex: 1 }}
              >
                <InputNumber placeholder="请输入" style={{ width: '100%' }} />
              </Form.Item>
            </div>

            {/* 第三行 */}
            <div
              className={`w-full flex ${readOnly ? 'flex-row gap-4' : 'flex-col gap-0'}`}
            >
              <Form.Item
                label="默认阈值下界"
                field="metric_template_value.normal_range_start"
                style={{ flex: 1 }}
              >
                <InputNumber placeholder="请输入" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                label="默认阈值上界"
                field="metric_template_value.normal_range_end"
                style={{ flex: 1 }}
              >
                <InputNumber placeholder="请输入" style={{ width: '100%' }} />
              </Form.Item>
            </div>

            {/* 灵敏度字段 */}
            <div className="w-full">
              <Form.Item
                label="灵敏度"
                field="sensitivity"
                extra="算法敏感度参数，范围为0~1，影响异常检测的敏感程度，默认0.5"
                initialValue={0.5}
                style={{ flex: 1 }}
              >
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  showTicks
                  marks={{
                    0: '0',
                    0.2: '0.2',
                    0.4: '0.4',
                    0.6: '0.6',
                    0.8: '0.8',
                    1: '1',
                  }}
                  disabled={readOnly}
                />
              </Form.Item>
            </div>

            {/* 第四行 */}
            <div
              className={`w-full flex ${readOnly ? 'flex-row gap-4' : 'flex-col gap-0'}`}
            >
              <Form.Item
                label="最小异常比例"
                field="metric_template_value.min_violation_ratio"
                hidden={!readOnly}
                rules={[{ required: true, message: '请输入最小异常比例' }]}
                required
                style={{ flex: 1 }}
              >
                <InputNumber
                  placeholder="请输入"
                  precision={2}
                  suffix="%"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="填充值"
                field="metric_template_value.missing_value"
                hidden={!readOnly}
                rules={[{ required: true, message: '请输入填充值' }]}
                required
                style={{ flex: 1 }}
              >
                <Input placeholder="请输入" style={{ width: '100%' }} />
              </Form.Item>
            </div>

            {/* 第五行 */}
            <div
              className={`w-full flex ${readOnly ? 'flex-row gap-4' : 'flex-col gap-0'}`}
            >
              <Form.Item
                label="展示系数"
                field="metric_template_value.linear_scale"
                hidden={!readOnly}
                rules={[{ required: true, message: '请输入展示系数' }]}
                required
                style={{ flex: 1 }}
              >
                <InputNumber placeholder="请输入" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                label="最长无数据时间"
                field="metric_template_value.max_time_gap"
                rules={[{ required: true, message: '请输入最长无数据时间' }]}
                required
                style={{ flex: 1 }}
              >
                <InputNumber
                  placeholder="请输入"
                  suffix="分钟"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>

            {/* 第六行 */}
            <div
              className={`w-full flex ${readOnly ? 'flex-row gap-4' : 'flex-col gap-0'}`}
            >
              <Form.Item
                label="最小数据时间"
                field="metric_template_value.min_ts_length"
                rules={[{ required: true, message: '请输入最小数据时间' }]}
                required
                style={{ flex: 1 }}
              >
                <InputNumber
                  placeholder="请输入"
                  suffix="分钟"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="单异常剔除周期"
                field="metric_template_value.failure_interval_expectation"
                hidden={!readOnly}
                rules={[{ required: true, message: '请输入单异常剔除周期' }]}
                required
                style={{ flex: 1 }}
              >
                <InputNumber
                  placeholder="请输入"
                  suffix="秒"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>

            {/* 第七行 */}
            <div
              className={`w-full flex ${readOnly ? 'flex-row gap-4' : 'flex-col gap-0'}`}
            >
              <Form.Item
                label="展示单位"
                field="metric_template_value.display_unit"
                hidden={!readOnly}
                rules={[{ required: true, message: '请输入展示单位' }]}
                required
                style={{ flex: 1 }}
              >
                <Input placeholder="请输入" style={{ width: '100%' }} />
              </Form.Item>
              <div style={{ flex: 1 }} />
            </div>
          </div>
        </div>
      </Form>

      {/* 文档抽屉 */}
      <DocsDrawer
        visible={docsDrawerVisible}
        onClose={() => setDocsDrawerVisible(false)}
        anchor="指标模板管理"
      />
    </>
  );
};

export default MetricDetailConfig;
