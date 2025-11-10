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

import { Button, Form, Input, Link, Typography } from '@arco-design/web-react';
import { IconEye, IconEyeInvisible } from '@arco-design/web-react/icon';
import { AutofillBlockerPresets } from '@veaiops/utils';
import type React from 'react';

const { Text } = Typography;

interface AppSecretFieldProps {
  showSecrets: {
    secret: boolean;
  };
  toggleSecretVisibility: (field: 'secret') => void;
}

/**
 * App Secret input field component
 */
export const AppSecretField: React.FC<AppSecretFieldProps> = ({
  showSecrets,
  toggleSecretVisibility,
}) => {
  return (
    <Form.Item
      label="App Secret"
      field="secret"
      rules={[
        { required: true, message: '请输入App Secret' },
        { minLength: 1, message: 'App Secret不能为空' },
      ]}
      extra={
        <Text type="secondary">
          请跳转{' '}
          <Link
            href="https://open.larkoffice.com/app"
            target="_blank"
            style={{ fontSize: '12px' }}
          >
            飞书开发者平台
          </Link>
          ，通过"创建自建应用"来新建机器人，或选择已有的机器人后跳转到详情页，在"凭证与基础信息"页面，复制粘贴相关内容
        </Text>
      }
    >
      <Input
        type={showSecrets.secret ? 'text' : 'password'}
        placeholder="请输入机器人应用凭证：App Secret"
        allowClear
        {...AutofillBlockerPresets.appSecret()}
        suffix={
          <Button
            type="text"
            size="small"
            icon={showSecrets.secret ? <IconEyeInvisible /> : <IconEye />}
            onClick={() => toggleSecretVisibility('secret')}
          />
        }
      />
    </Form.Item>
  );
};
