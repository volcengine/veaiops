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

import { Button, Form, Input } from '@arco-design/web-react';
import { IconEye, IconEyeInvisible } from '@arco-design/web-react/icon';
import { AutofillBlockerPresets } from '@veaiops/utils';
import type React from 'react';

interface ApiKeyFieldProps {
  showAdvancedConfig: boolean;
  showSecrets: {
    api_key: boolean;
  };
  toggleSecretVisibility: (field: 'api_key') => void;
}

/**
 * API Key input field component
 */
export const ApiKeyField: React.FC<ApiKeyFieldProps> = ({
  showAdvancedConfig,
  showSecrets,
  toggleSecretVisibility,
}) => {
  return (
    <Form.Item
      label="API Key"
      field="agent_cfg.api_key"
      rules={[
        {
          required: showAdvancedConfig,
          message: '请输入API Key',
        },
      ]}
    >
      <Input
        type={showSecrets.api_key ? 'text' : 'password'}
        placeholder="请输入API Key"
        allowClear
        {...AutofillBlockerPresets.apiKey()}
        suffix={
          <Button
            type="text"
            size="small"
            icon={showSecrets.api_key ? <IconEyeInvisible /> : <IconEye />}
            onClick={() => toggleSecretVisibility('api_key')}
          />
        }
      />
    </Form.Item>
  );
};
