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

import { validatePassword } from '@/modules/system/features/account/lib';
import {
  Divider,
  Form,
  Grid,
  Input,
  Progress,
  Select,
  Space,
  Tag,
} from '@arco-design/web-react';
import {
  IconCheckCircleFill,
  IconCloseCircleFill,
  IconEmail,
  IconInfoCircleFill,
  IconLock,
  IconUser,
} from '@arco-design/web-react/icon';
import type { User } from 'api-generate';
import type React from 'react';
import { useMemo, useState } from 'react';
import {
  emailRules,
  newPasswordRules,
  passwordRules,
  roleRules,
  statusRules,
  usernameRules,
} from './validation-rules';

const { Row, Col } = Grid;
const { Option } = Select;
const { Password } = Input;

/**
 * Password requirement check item component
 */
interface PasswordRequirementItemProps {
  met: boolean;
  text: string;
}

const PasswordRequirementItem: React.FC<PasswordRequirementItemProps> = ({
  met,
  text,
}) => {
  return (
    <div className="flex items-center gap-2 py-1">
      {met ? (
        <IconCheckCircleFill className="text-green-500 text-sm flex-shrink-0" />
      ) : (
        <IconCloseCircleFill className="text-gray-300 text-sm flex-shrink-0" />
      )}
      <span
        className={`text-xs ${met ? 'text-green-600 font-medium' : 'text-gray-500'}`}
      >
        {text}
      </span>
    </div>
  );
};

/**
 * Password strength indicator component
 */
interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
}) => {
  // Calculate whether password requirements are met
  const requirements = useMemo(() => {
    return {
      length: password.length >= 6,
      minLength: password.length >= 8,
      maxLength: password.length <= 32,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      longEnough: password.length >= 12,
    };
  }, [password]);

  if (!password) {
    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-xs text-gray-500 mb-2 font-medium">密码要求：</div>
        <PasswordRequirementItem met={false} text="至少 6 个字符（基本要求）" />
        <PasswordRequirementItem met={false} text="建议 8 个字符以上" />
        <PasswordRequirementItem met={false} text="包含小写字母" />
        <PasswordRequirementItem met={false} text="包含大写字母" />
        <PasswordRequirementItem met={false} text="包含数字" />
        <PasswordRequirementItem
          met={false}
          text="包含特殊字符 (!@#$%^&* 等)"
        />
      </div>
    );
  }

  const validation = validatePassword(password);
  const { strength } = validation;

  // Password strength configuration
  const strengthConfig = {
    weak: {
      color: 'red',
      percent: 33,
      text: '弱',
      status: 'error' as const,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-600',
    },
    medium: {
      color: 'orange',
      percent: 66,
      text: '中等',
      status: 'normal' as const,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-600',
    },
    strong: {
      color: 'green',
      percent: 100,
      text: '强',
      status: 'success' as const,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
    },
  };

  const config = strengthConfig[strength];

  return (
    <div
      className={`mt-3 mb-4 p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}
    >
      {/* Strength indicator */}
      <div className="mb-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">密码强度</span>
          <Tag color={config.color} size="small" className="font-medium">
            {config.text}
          </Tag>
        </div>
        <Progress
          percent={config.percent}
          status={config.status}
          size="small"
          showText={false}
        />
      </div>

      <Divider className="my-2" />

      {/* Password requirement check list */}
      <div className="space-y-0.5">
        <PasswordRequirementItem
          met={requirements.length}
          text="至少 6 个字符（基本要求）"
        />
        <PasswordRequirementItem
          met={requirements.minLength}
          text="建议 8 个字符以上"
        />
        <PasswordRequirementItem
          met={requirements.lowercase}
          text="包含小写字母 (a-z)"
        />
        <PasswordRequirementItem
          met={requirements.uppercase}
          text="包含大写字母 (A-Z)"
        />
        <PasswordRequirementItem
          met={requirements.number}
          text="包含数字 (0-9)"
        />
        <PasswordRequirementItem
          met={requirements.special}
          text="包含特殊字符 (!@#$%^&* 等)"
        />
        <PasswordRequirementItem
          met={requirements.longEnough}
          text="12 位或更长（推荐）"
        />
      </div>

      {/* Security suggestions */}
      <div className={`mt-3 mb-3 pt-2 border-t ${config.borderColor}`}>
        <div className="flex items-start gap-2">
          <IconInfoCircleFill
            className={`text-xs mt-0.5 flex-shrink-0 ${config.textColor}`}
          />
          <span className={`text-xs ${config.textColor}`}>
            {strength === 'weak' &&
              '建议: 增加密码长度并使用多种字符类型以提高安全性'}
            {strength === 'medium' &&
              '建议: 添加特殊字符或增加至12位以上以达到强密码标准'}
            {strength === 'strong' && '很好! 这是一个强密码，请妥善保管'}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Basic information form fields component
 */
interface BasicInfoFieldsProps {
  editingUser: User | null;
}

export const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  editingUser,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [createPassword, setCreatePassword] = useState('');

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
        />
      </Form.Item>

      {/* Password field - change password mode */}
      {editingUser ? (
        <div className="space-y-4">
          <Form.Item
            label={
              <Space size={4}>
                <IconLock className="text-gray-500" />
                <span>旧密码</span>
              </Space>
            }
            field="old_password"
            disabled={false}
            rules={passwordRules}
          >
            <Password
              placeholder="请输入当前密码"
              autoComplete="current-password"
              prefix={<IconLock className="text-gray-400" />}
              size="large"
            />
          </Form.Item>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <IconInfoCircleFill className="text-blue-500 text-sm mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <div className="font-medium mb-1">身份验证说明</div>
                <div>为了保护您的账户安全，修改密码前请先验证当前登录密码</div>
              </div>
            </div>
          </div>

          <Form.Item
            label={
              <Space size={4}>
                <IconLock className="text-gray-500" />
                <span>新密码</span>
              </Space>
            }
            field="new_password"
            disabled={false}
            rules={newPasswordRules}
          >
            <Password
              placeholder="请输入新密码（至少6个字符）"
              autoComplete="new-password"
              prefix={<IconLock className="text-gray-400" />}
              size="large"
              onChange={(value) => {
                setNewPassword(value);
              }}
            />
          </Form.Item>

          <PasswordStrengthIndicator password={newPassword} />
        </div>
      ) : (
        <>
          <Form.Item
            label={
              <Space size={4}>
                <IconLock className="text-gray-500" />
                <span>密码</span>
              </Space>
            }
            field="password"
            rules={passwordRules}
          >
            <Password
              placeholder="请设置登录密码（至少6个字符）"
              autoComplete="new-password"
              prefix={<IconLock className="text-gray-400" />}
              size="large"
              onChange={(value) => {
                setCreatePassword(value);
              }}
            />
          </Form.Item>

          <PasswordStrengthIndicator password={createPassword} />
        </>
      )}

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

/**
 * Account information display component
 */
interface AccountInfoProps {
  editingUser: User;
}

export const AccountInfo: React.FC<AccountInfoProps> = ({ editingUser }) => {
  return (
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item label="创建时间">
          <Input
            value={
              editingUser.created_at
                ? new Date(editingUser.created_at).toLocaleString()
                : '未知'
            }
            disabled
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="最后登录">
          <Input
            value={
              editingUser.updated_at
                ? new Date(editingUser.updated_at).toLocaleString()
                : '从未登录'
            }
            disabled
          />
        </Form.Item>
      </Col>
    </Row>
  );
};
