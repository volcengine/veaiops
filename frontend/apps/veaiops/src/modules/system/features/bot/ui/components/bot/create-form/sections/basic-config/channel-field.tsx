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
import { CHANNEL_OPTIONS } from '@veaiops/constants';
import type { ChannelType } from 'api-generate';
import type React from 'react';

interface ChannelFieldProps {
  selectedChannel: ChannelType;
  setSelectedChannel: (value: ChannelType) => void;
}

/**
 * Enterprise collaboration tool selection field component
 */
export const ChannelField: React.FC<ChannelFieldProps> = ({
  selectedChannel,
  setSelectedChannel,
}) => {
  return (
    <Form.Item
      label="企业协同工具"
      field="channel"
      rules={[{ required: true, message: '请选择企业协同工具' }]}
    >
      <Select
        placeholder="请选择Channel类型"
        onChange={(value) => setSelectedChannel(value)}
      >
        {CHANNEL_OPTIONS.map((option) => (
          <Select.Option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};
