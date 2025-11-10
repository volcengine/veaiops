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

import type { User } from '@account';
import { Form, Grid, Input, Select, Space } from '@arco-design/web-react';
import {
  IconEmail,
  IconInfoCircleFill,
  IconUser,
} from '@arco-design/web-react/icon';
import { logger } from '@veaiops/utils';
import type React from 'react';
import type { ValidationRule } from '../lib';
import { PasswordFields } from './password-fields';

const { Row, Col } = Grid;
const { Option } = Select;

/**
 * Basic info form fields component Props
 */
interface BasicInfoFieldsProps {
  editingUser: User | null;
  usernameRules: ValidationRule[];
  emailRules: ValidationRule[];
  passwordRules: ValidationRule[];
  newPasswordRules: ValidationRule[];
  roleRules: ValidationRule[];
  statusRules: ValidationRule[];
}

/**
 * Basic info form fields component
 */
export const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  editingUser,
  usernameRules,
  emailRules,
  passwordRules,
  newPasswordRules,
  roleRules,
  statusRules,
}) => {
  return (
    <>
      {/* Username field */}
      <Form.Item
        label={
          <Space size={4}>
            <IconUser className="text-gray-500" />
            <span>用户名</span>
          </Space>
        }
        field="username"
        rules={usernameRules}
        extra={
          !editingUser ? (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <IconInfoCircleFill className="text-xs" />
              <span>仅支持字母、数字和下划线，3-20个字符</span>
            </div>
          ) : undefined
        }
      >
        <Input
          placeholder="请输入用户名，如：admin、user_001"
          autoComplete="off"
          prefix={<IconUser className="text-gray-400" />}
          size="large"
          onFocus={(e) => {
            const autocomplete = (
              e.currentTarget as HTMLInputElement
            ).getAttribute('autocomplete');
            logger.debug({
              message: 'username autocomplete',
              data: { autocomplete },
              source: 'AccountFormFields',
              component: 'onFocus',
            });
          }}
        />
      </Form.Item>

      {/* Email field */}
      <Form.Item
        label={
          <Space size={4}>
            <IconEmail className="text-gray-500" />
            <span>邮箱</span>
          </Space>
        }
        field="email"
        rules={emailRules}
        extra={
          !editingUser ? (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <IconInfoCircleFill className="text-xs" />
              <span>用于接收系统通知和找回密码</span>
            </div>
          ) : undefined
        }
      >
        <Input
          placeholder="请输入有效邮箱地址，如：user@example.com"
          autoComplete="off"
          prefix={<IconEmail className="text-gray-400" />}
          size="large"
          onFocus={(e) => {
            const autocomplete = (
              e.currentTarget as HTMLInputElement
            ).getAttribute('autocomplete');
            logger.debug({
              message: 'email autocomplete',
              data: { autocomplete },
              source: 'AccountFormFields',
              component: 'onFocus',
            });
          }}
        />
      </Form.Item>

      {/* Password field */}
      <PasswordFields
        isEditing={Boolean(editingUser)}
        passwordRules={passwordRules}
        newPasswordRules={newPasswordRules}
      />

      {/* Role field */}
      <Form.Item
        label="角色"
        field="role"
        rules={roleRules}
        extra={
          !editingUser
            ? '管理员可管理系统配置和其他账号，请谨慎选择'
            : '账号创建后角色不可修改'
        }
      >
        <Select placeholder="请选择账号角色">
          <Option value="admin">管理员（可管理所有配置和账号）</Option>
          <Option value="user">普通用户（仅查看和使用功能）</Option>
        </Select>
      </Form.Item>

      {/* Status field (hidden) */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="状态"
            field="status"
            hidden
            initialValue="active"
            rules={statusRules}
          >
            <Select placeholder="请选择状态" defaultValue="active">
              <Option value="active">活跃</Option>
              <Option value="inactive">非活跃</Option>
              <Option value="locked">锁定</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};
