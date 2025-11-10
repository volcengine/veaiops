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

import { Form, Select } from '@arco-design/web-react';
import { NETWORK_TYPE_OPTIONS, TOS_REGION_OPTIONS } from '@bot/lib';
import type React from 'react';

interface VolcSettingsProps {
  showAdvancedConfig: boolean;
}

/**
 * Volcengine settings configuration block component
 */
export const VolcSettings: React.FC<VolcSettingsProps> = ({
  showAdvancedConfig,
}) => {
  return (
    <>
      <Form.Item
        label="TOS区域"
        field="volc_cfg.tos_region"
        rules={[
          {
            required: showAdvancedConfig,
            message: '请选择TOS区域',
          },
        ]}
      >
        <Select placeholder="请选择TOS区域">
          {TOS_REGION_OPTIONS.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="网络类型"
        field="volc_cfg.network_type"
        rules={[
          {
            required: showAdvancedConfig,
            message: '请选择网络类型',
          },
        ]}
      >
        <Select placeholder="请选择网络类型">
          {NETWORK_TYPE_OPTIONS.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};
