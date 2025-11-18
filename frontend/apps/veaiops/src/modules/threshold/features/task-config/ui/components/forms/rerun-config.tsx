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

import { Form, InputNumber, Slider } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react/es/Form';
import { Select, Input as VeInput } from '@veaiops/components';
import type React from 'react';
import { MetricDetailSection } from '@threshold/shared/components';

interface RerunFormConfigProps {
  form: FormInstance;
  readOnly?: boolean;
}

/**
 * 重新执行表单配置组件
 * 只包含用户需要配置的核心参数
 */
export const RerunFormConfig: React.FC<RerunFormConfigProps> = ({
  form,
  readOnly = false,
}) => {
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
          {/* 滑动窗口 */}
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

        {/* 灵敏度字段 - 放在指标详情上方 */}
        <Form.Item
          label="灵敏度"
          field="sensitivity"
          extra="算法敏感度参数，范围为0~1，影响异常检测的敏感程度，默认0.5"
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

        {/* 指标详情区域 */}
        <MetricDetailSection style={{ marginTop: '24px' }} useWrapper={false}>
          <div className="flex flex-wrap justify-between p-4 border border-[#e5e5e5] rounded-md bg-[#f9f9f9]">
            {/* 正常起始值和正常止值 */}
            <div className="w-full flex flex-col gap-0">
              <Form.Item
                label="默认阈值下界"
                field="metric_template_value.normal_range_start"
                extra="阈值正常范围的下限值"
                style={{ flex: 1 }}
              >
                <InputNumber placeholder="请输入" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                label="默认阈值上界"
                field="metric_template_value.normal_range_end"
                extra="阈值正常范围的上限值"
                style={{ flex: 1 }}
              >
                <InputNumber placeholder="请输入" style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </div>
        </MetricDetailSection>
      </Form>
    </>
  );
};

export default RerunFormConfig;
