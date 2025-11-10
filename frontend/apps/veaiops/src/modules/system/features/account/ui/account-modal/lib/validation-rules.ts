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

import type { ValidationRule } from './types';

/**
 * Password validator
 *
 * @param value - Password value to validate
 * @param callback - Arco Design Form validation callback function, accepts optional error message string
 */
const passwordValidator = (
  value: string | undefined,
  callback: (error?: string) => void,
) => {
  if (!value) {
    callback('密码不能为空');
    return;
  }
  // const validation = validateBasicPassword(value);
  // if (!validation.valid) {
  //   callback(validation.error);
  // } else {
  //   callback();
  // }
  // Temporarily using simple validation
  if (value && value.length < 6) {
    callback('密码长度不能少于6位');
  } else {
    callback();
  }
};

/**
 * Username validator
 *
 * @param value - Username to validate
 * @param callback - Arco Design Form validation callback function, accepts optional error message string
 */
const usernameValidator = (
  value: string | undefined,
  callback: (error?: string) => void,
) => {
  if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
    callback('用户名只能包含字母、数字和下划线');
  } else {
    callback();
  }
};

/**
 * Unified password validation rules - Consistent with login validation logic
 */
export const passwordRules: ValidationRule[] = [
  { required: true, message: '请输入密码' },
  { validator: passwordValidator },
];

/**
 * New password validation rules - Uses basic password validation
 */
export const newPasswordRules: ValidationRule[] = [
  { required: true, message: '请输入密码' },
  { validator: passwordValidator },
];

/**
 * Username validation rules
 */
export const usernameRules: ValidationRule[] = [
  { required: true, message: '请输入用户名' },
  { minLength: 3, message: '用户名至少3个字符' },
  { maxLength: 20, message: '用户名不能超过20个字符' },
  { validator: usernameValidator },
];

/**
 * Email validation rules
 */
export const emailRules: ValidationRule[] = [
  { required: true, message: '请输入邮箱' },
  { type: 'email', message: '请输入有效的邮箱地址' },
];

/**
 * Role validation rules
 */
export const roleRules: ValidationRule[] = [
  { required: true, message: '请选择角色' },
];

/**
 * Status validation rules
 */
export const statusRules: ValidationRule[] = [
  { required: true, message: '请选择状态' },
];
