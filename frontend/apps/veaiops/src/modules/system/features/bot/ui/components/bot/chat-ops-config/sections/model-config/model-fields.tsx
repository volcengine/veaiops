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

import { Form, Input } from '@arco-design/web-react';
import type React from 'react';

interface ModelFieldsProps {
  showAdvancedConfig: boolean;
  urlValidator?: (value: string, callback: (error?: string) => void) => void;
}

/**
 * Model configuration fields component (Model name, Embedding model name, API Base URL)
 */
export const ModelFields: React.FC<ModelFieldsProps> = ({
  showAdvancedConfig,
  urlValidator,
}) => {
  return (
    <>
      <Form.Item
        label="模型名称"
        field="agent_cfg.name"
        rules={[
          {
            required: showAdvancedConfig,
            message: '请输入模型名称',
          },
          {
            validator: (value, callback) => {
              if (value && !/^ep-/.test(value)) {
                callback('请输入以 ep- 开头的模型名称');
              } else {
                callback();
              }
            },
          },
        ]}
      >
        <Input
          placeholder="使用火山引擎方舟平台，请输入ep-开头的模型名称"
          allowClear
        />
      </Form.Item>

      <Form.Item
        label="Embedding模型名称"
        field="agent_cfg.embedding_name"
        rules={[
          {
            required: showAdvancedConfig,
            message: '请输入Embedding模型名称',
          },
          {
            validator: (value, callback) => {
              if (value && !/^ep-/.test(value)) {
                callback('请输入以 ep- 开头的模型名称');
              } else {
                callback();
              }
            },
          },
        ]}
      >
        <Input
          placeholder="使用火山引擎方舟平台，请输入ep-开头的模型名称"
          allowClear
        />
      </Form.Item>

      <Form.Item
        label="API Base URL"
        field="agent_cfg.api_base"
        rules={[
          {
            required: showAdvancedConfig,
            message: '请输入API Base URL',
          },
          ...(urlValidator
            ? [
                {
                  validator: (
                    value: string | undefined,
                    callback: (error?: string) => void,
                  ) => {
                    urlValidator(value || '', callback);
                  },
                },
              ]
            : []),
        ]}
      >
        <Input placeholder="请输入API Base URL" allowClear />
      </Form.Item>
    </>
  );
};
