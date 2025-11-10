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

interface VolcCredentialsProps {
  showAdvancedConfig: boolean;
  showSecrets: {
    ak: boolean;
    sk: boolean;
  };
  toggleSecretVisibility: (field: 'ak' | 'sk') => void;
}

/**
 * Volcengine credentials configuration section component
 */
export const VolcCredentials: React.FC<VolcCredentialsProps> = ({
  showAdvancedConfig,
  showSecrets,
  toggleSecretVisibility,
}) => {
  return (
    <>
      <Form.Item
        label="Access Key"
        field="volc_cfg.ak"
        rules={[
          {
            required: showAdvancedConfig,
            message: '请输入Access Key',
          },
        ]}
      >
        <Input
          type={showSecrets.ak ? 'text' : 'password'}
          placeholder="请输入火山引擎Access Key"
          allowClear
          {...AutofillBlockerPresets.accessKey()}
          suffix={
            <Button
              type="text"
              size="small"
              icon={showSecrets.ak ? <IconEyeInvisible /> : <IconEye />}
              onClick={() => toggleSecretVisibility('ak')}
            />
          }
        />
      </Form.Item>

      <Form.Item
        label="Secret Key"
        field="volc_cfg.sk"
        rules={[
          {
            required: showAdvancedConfig,
            message: '请输入Secret Key',
          },
        ]}
      >
        <Input
          type={showSecrets.sk ? 'text' : 'password'}
          placeholder="请输入火山引擎Secret Key"
          allowClear
          {...AutofillBlockerPresets.secretKey()}
          suffix={
            <Button
              type="text"
              size="small"
              icon={showSecrets.sk ? <IconEyeInvisible /> : <IconEye />}
              onClick={() => toggleSecretVisibility('sk')}
            />
          }
        />
      </Form.Item>
    </>
  );
};
