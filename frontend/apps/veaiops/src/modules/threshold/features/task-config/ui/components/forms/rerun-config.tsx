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

import { Form, InputNumber } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react/es/Form';
import { Select, Input as VeInput } from '@veaiops/components';
import type React from 'react';

interface RerunFormConfigProps {
  form: FormInstance;
  readOnly?: boolean;
}

/**
 * Rerun form configuration component
 * Only contains core parameters that users need to configure
 */
export const RerunFormConfig: React.FC<RerunFormConfigProps> = ({
  form,
  readOnly = false,
}) => {
  return (
    <Form form={form} layout="vertical" disabled={readOnly}>
      <div className={'flex justify-between w-[100%]'}>
        {/* Threshold direction */}
        <Select.Block
          isControl
          inline
          required
          formItemProps={{
            label: '阈值方向',
            field: 'direction',
            rules: [{ required: true, message: '阈值方向必填' }],
            extra: '计算正常阈值的上限、下限还是包含上下限',
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
        {/* Sliding window */}
        <VeInput.Number
          isControl
          required
          inline
          formItemProps={{
            label: '滑动窗口',
            field: 'n_count',
            rules: [{ required: true, message: '请输入滑动窗口' }],
            extra: '连续几个数据点作为计算阈值的最小窗口，默认3',
          }}
          controlProps={{
            min: 1,
            max: 100,
            precision: 0,
          }}
        />
      </div>

      {/* Metric details area */}
      <div className="mt-6">
        <h3 className="mb-4 text-sm font-medium">指标详情</h3>
        <div className="flex flex-wrap justify-between p-4 border border-[#e5e5e5] rounded-md bg-[#f9f9f9]">
          {/* Normal start and end values */}
          <div className="w-full flex flex-col gap-0">
            <Form.Item
              label="默认阈值下界"
              field="metric_template_value.normal_range_start"
              rules={[{ required: true, message: '请输入默认阈值下界' }]}
              required
              extra="阈值正常范围的下限值"
              style={{ flex: 1 }}
            >
              <InputNumber placeholder="请输入" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="默认阈值上界"
              field="metric_template_value.normal_range_end"
              rules={[{ required: true, message: '请输入默认阈值上界' }]}
              required
              extra="阈值正常范围的上限值"
              style={{ flex: 1 }}
            >
              <InputNumber placeholder="请输入" style={{ width: '100%' }} />
            </Form.Item>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default RerunFormConfig;
