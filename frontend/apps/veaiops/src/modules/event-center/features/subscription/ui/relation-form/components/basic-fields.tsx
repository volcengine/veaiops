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

import type { ModuleType } from '@/types/module';
import { Form, Input } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react';
import { Select } from '@veaiops/components';
import type React from 'react';

/**
 * Basic fields component props
 */
interface BasicFieldsProps {
  form: FormInstance;
  agentTypeOptions: Array<{ label: string; value: string }>;
}

/**
 * Basic fields component
 * Includes subscription name and agent selection
 */
export const BasicFields: React.FC<BasicFieldsProps> = ({
  form,
  agentTypeOptions,
}) => {
  return (
    <>
      <Form.Item
        label="订阅名称"
        field="subscribeName"
        rules={[
          { required: true, message: '请输入订阅名称' },
          {
            validator: (value, callback) => {
              if (value && !/^[a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                callback('仅支持汉字和英文');
              } else {
                callback();
              }
            },
          },
        ]}
      >
        <Input
          placeholder="请输入订阅名称"
          autoComplete="new-password"
          autoCapitalize="off"
          autoCorrect="off"
          inputMode="text"
        />
      </Form.Item>

      <Select.Block
        isControl
        required
        formItemProps={{
          label: '智能体',
          field: 'agent_type',
          rules: [{ required: true, message: '请选择智能体' }],
        }}
        controlProps={{
          placeholder: '请选择智能体',
          options: agentTypeOptions,
        }}
      />
    </>
  );
};
