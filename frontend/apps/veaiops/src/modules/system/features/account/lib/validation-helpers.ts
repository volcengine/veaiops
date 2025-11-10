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
 * Account management validation helper functions
 * @description Basic validation functions (username, email, password, etc.)
 */

/**
 * Validate username format
 */
export const validateUsername = (
  username: string,
): { valid: boolean; error?: string } => {
  if (!username) {
    return { valid: false, error: '用户名不能为空' };
  }

  if (username.length < 3) {
    return { valid: false, error: '用户名至少3个字符' };
  }

  if (username.length > 20) {
    return { valid: false, error: '用户名最多20个字符' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: '用户名只能包含字母、数字、下划线和中划线' };
  }

  return { valid: true };
};

/**
 * Validate email format
 */
export const validateEmail = (
  email: string,
): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: '邮箱不能为空' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: '邮箱格式不正确' };
  }

  return { valid: true };
};

/**
 * Validate password strength
 */
export const validatePassword = (
  password: string,
): {
  valid: boolean;
  error?: string;
  strength: 'weak' | 'medium' | 'strong';
} => {
  if (!password) {
    return { valid: false, error: '密码不能为空', strength: 'weak' };
  }

  if (password.length < 8) {
    return { valid: false, error: '密码至少8个字符', strength: 'weak' };
  }

  if (password.length > 32) {
    return { valid: false, error: '密码最多32个字符', strength: 'weak' };
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let score = 0;

  // Check for lowercase letters
  if (/[a-z]/.test(password)) {
    score++;
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(password)) {
    score++;
  }

  // Check for numbers
  if (/\d/.test(password)) {
    score++;
  }

  // Check for special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++;
  }

  // Check length
  if (password.length >= 12) {
    score++;
  }

  if (score >= 4) {
    strength = 'strong';
  } else if (score >= 2) {
    strength = 'medium';
  }

  return { valid: true, strength };
};

/**
 * Basic password validation - Consistent with login validation logic
 * Used for old password validation, only requires basic length restrictions
 */
export const validateBasicPassword = (
  password: string,
): { valid: boolean; error?: string } => {
  if (!password) {
    return { valid: false, error: '密码不能为空' };
  }

  if (password.length < 6) {
    return { valid: false, error: '密码至少6个字符' };
  }

  if (password.length > 32) {
    return { valid: false, error: '密码最多32个字符' };
  }

  return { valid: true };
};

/**
 * Complex password validation - Used for new password setting
 * Only requires basic length restrictions, does not force uppercase letters and special characters
 */
export const validateComplexPassword = (
  password: string,
): { valid: boolean; error?: string } => {
  if (!password) {
    return { valid: false, error: '密码不能为空' };
  }

  if (password.length < 6) {
    return { valid: false, error: '密码至少6个字符' };
  }

  if (password.length > 32) {
    return { valid: false, error: '密码最多32个字符' };
  }

  return { valid: true };
};
