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
 * Account management validation functions
 * @description User form data validation related functions
 */

import type { UserFormData } from '@account';
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from './validation-helpers';

/**
 * Validate form data
 */
export const validateUserFormData = (
  data: UserFormData,
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Validate username
  const usernameValidation = validateUsername(data.username);
  if (!usernameValidation.valid) {
    errors.username = usernameValidation.error!;
  }

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error!;
  }

  // Validate password (only when password is provided)
  if (data.password) {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.error!;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
