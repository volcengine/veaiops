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
 * Zabbix credentials form component
 */

import { Form, Input } from '@arco-design/web-react';
import { WrapperWithTitle } from '@veaiops/components';
import type React from 'react';

export const ZabbixCredentialsForm: React.FC = () => {
  return (
    <WrapperWithTitle title="连接配置" level={2}>
      <Form.Item
        label="API地址"
        field="zabbix_api_url"
        rules={[
          { required: true, message: '请输入Zabbix API地址' },
          { type: 'url', message: '请输入有效的URL地址' },
        ]}
        tooltip="Zabbix API的完整URL地址，通常以 /api_jsonrpc.php 结尾"
      >
        <Input placeholder="https://zabbix.example.com" allowClear />
      </Form.Item>
      <Form.Item
        label="API用户名"
        field="zabbix_api_user"
        rules={[
          { required: true, message: '请输入API用户名' },
          { minLength: 1, message: '用户名不能为空' },
        ]}
        tooltip="具有API访问权限的Zabbix用户名"
      >
        <Input placeholder="admin" allowClear autoComplete="off" />
      </Form.Item>
      <Form.Item
        label="API密码"
        field="zabbix_api_password"
        rules={[
          {
            required: true,
            message: '请输入API密码',
          },
          {
            minLength: 1,
            message: '密码不能为空',
          },
        ]}
        tooltip="对应用户的登录密码"
      >
        <Input.Password
          placeholder="请输入密码"
          allowClear
          autoComplete="new-password"
        />
      </Form.Item>
    </WrapperWithTitle>
  );
};
