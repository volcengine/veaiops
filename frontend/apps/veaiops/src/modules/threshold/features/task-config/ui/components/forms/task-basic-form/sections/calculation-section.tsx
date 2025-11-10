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

import { Form, Slider } from '@arco-design/web-react';
import { Input, Select } from '@veaiops/components';
import type React from 'react';

/**
 * Calculation section component parameters
 */
interface CalculationSectionProps {
  loading: boolean;
}

/**
 * Calculation parameters configuration section
 */
export const CalculationSection: React.FC<CalculationSectionProps> = ({
  loading,
}) => {
  return (
    <>
      {/* Auto-update threshold */}
      <Select.Block
        isControl
        inline
        formItemProps={{
          label: '自动更新阈值',
          field: 'autoUpdate',
          extra: '开启后系统将定期自动重新计算和更新阈值',
          initialValue: 'true',
        }}
        controlProps={{
          placeholder: '请选择',
          disabled: loading,
          options: [
            { label: '开启', value: 'true' },
            { label: '关闭', value: 'false' },
          ],
        }}
      />

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
          initialValue: 'both',
        }}
        controlProps={{
          placeholder: '请选择阈值方向',
          options: [
            { label: '上界', value: 'up' },
            { label: '下界', value: 'down' },
            { label: '双向', value: 'both' },
          ],
          disabled: loading,
        }}
      />

      {/* Sliding window */}
      <Input.Number
        isControl
        required
        inline
        formItemProps={{
          label: '滑动窗口',
          field: 'nCount',
          rules: [{ required: true, message: '请输入滑动窗口' }],
          extra: '连续几个数据点作为计算阈值的最小窗口，默认3',
        }}
        controlProps={{
          min: 1,
          max: 100,
          precision: 0,
        }}
      />

      {/* Sensitivity */}
      <Form.Item
        label="敏感度"
        field="sensitivity"
        rules={[{ required: true, message: '请输入敏感度' }]}
        required
        extra="算法敏感度参数，范围为0~1，影响异常检测的敏感程度，默认0.5"
        initialValue={0.5}
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
          disabled={loading}
        />
      </Form.Item>
    </>
  );
};
