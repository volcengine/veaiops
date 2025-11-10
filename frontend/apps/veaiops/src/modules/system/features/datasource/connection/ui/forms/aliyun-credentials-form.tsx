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

/**
 * Aliyun credentials form component
 */

import { Form, Input } from '@arco-design/web-react';
import { WrapperWithTitle } from '@veaiops/components';
import type React from 'react';

export const AliyunCredentialsForm: React.FC = () => {
  return (
    <WrapperWithTitle title="连接配置" level={2} noPadding>
      <Form.Item
        label="Access Key ID"
        field="aliyun_access_key_id"
        rules={[
          { required: true, message: '请输入Access Key ID' },
          {
            validator: (value, callback) => {
              if (value && !/^LTAI[a-zA-Z0-9]+$/.test(value)) {
                callback('请输入有效的阿里云Access Key ID');
              } else {
                callback();
              }
            },
          },
        ]}
        tooltip="阿里云访问密钥ID，通常以LTAI开头"
      >
        <Input placeholder="LTAI4G..." allowClear autoComplete="off" />
      </Form.Item>
      <Form.Item
        label="Access Key Secret"
        field="aliyun_access_key_secret"
        rules={[
          {
            required: true,
            message: '请输入Access Key Secret',
          },
          {
            minLength: 30,
            message: 'Access Key Secret长度不能少于30位',
          },
        ]}
        tooltip="阿里云访问密钥Secret，请妥善保管"
      >
        <Input.Password
          placeholder="请输入访问密钥Secret"
          allowClear
          autoComplete="new-password"
        />
      </Form.Item>
    </WrapperWithTitle>
  );
};
