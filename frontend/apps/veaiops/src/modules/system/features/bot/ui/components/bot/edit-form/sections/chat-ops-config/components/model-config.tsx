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
  Collapse,
  Form,
  type FormInstance,
  Input,
} from '@arco-design/web-react';
import {
  IconCheckCircle,
  IconEye,
  IconEyeInvisible,
} from '@arco-design/web-react/icon';
import { AutofillBlockerPresets } from '@veaiops/utils';
import type React from 'react';
import { SecretField } from '../components/secret-field';
import type { UrlValidator, UseSecretViewerReturn } from '../hooks';

const CollapseItem = Collapse.Item;

/**
 * Model configuration component Props
 */
interface ModelConfigProps {
  form: FormInstance;
  showAdvancedConfig: boolean;
  showSecrets: {
    api_key: boolean;
  };
  toggleSecretVisibility: (field: 'api_key') => void;
  secretViewer: UseSecretViewerReturn;
  urlValidator: UrlValidator;
  botId?: string;
}

/**
 * Model configuration component
 */
export const ModelConfig: React.FC<ModelConfigProps> = ({
  form,
  showAdvancedConfig,
  showSecrets,
  toggleSecretVisibility,
  secretViewer,
  urlValidator,
  botId,
}) => {
  return (
    <Collapse defaultActiveKey={['1']} className="mb-4">
      <CollapseItem header="大模型配置" name="1">
        <Form.Item
          label="模型名称"
          field="agent_cfg.name"
          rules={[
            {
              required: showAdvancedConfig,
              message: '请输入模型名称',
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
            {
              validator: (
                value: string | undefined,
                callback: (error?: string) => void,
              ) => {
                urlValidator(value, callback);
              },
            },
          ]}
        >
          <Input placeholder="请输入API Base URL" allowClear />
        </Form.Item>

        <SecretField
          label="API Key"
          field="agent_cfg.api_key"
          required={showAdvancedConfig}
          placeholder="请输入API Key（留空表示不修改）"
          showSecret={showSecrets.api_key}
          toggleSecretVisibility={() => toggleSecretVisibility('api_key')}
          botId={botId}
          secretViewer={secretViewer}
          secretKey="api_key"
          fieldName="agent_cfg.api_key"
          formField="agent_cfg.api_key"
        />
      </CollapseItem>
    </Collapse>
  );
};
