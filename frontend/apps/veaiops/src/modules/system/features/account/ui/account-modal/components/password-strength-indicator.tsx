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
import { Divider, Progress, Tag } from '@arco-design/web-react';
import { IconInfoCircleFill } from '@arco-design/web-react/icon';
import type React from 'react';
import { useMemo } from 'react';
import { PasswordRequirementItem } from './password-requirement-item';

/**
 * Password strength indicator component
 */
interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password }) => {
  // Calculate whether password requirements are met
  const requirements = useMemo(() => {
    return {
      length: password.length >= 6,
      minLength: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      longEnough: password.length >= 12,
    };
  }, [password]);

  if (!password) {
    return (
      <div
        className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
        style={{ marginBottom: '16px' }}
      >
        <div className="text-xs text-gray-500 mb-2 font-medium">密码要求：</div>
        <PasswordRequirementItem met={false} text="至少 6 个字符（基本要求）" />
        <PasswordRequirementItem met={false} text="建议 8 个字符以上" />
        <PasswordRequirementItem met={false} text="包含小写字母 (a-z)" />
        <PasswordRequirementItem met={false} text="包含大写字母 (A-Z)" />
        <PasswordRequirementItem met={false} text="包含数字 (0-9)" />
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

      {/* Password requirements checklist */}
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
