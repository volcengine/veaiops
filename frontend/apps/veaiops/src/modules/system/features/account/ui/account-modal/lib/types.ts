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

import type { User, UserFormData } from '@account';
import type { FormInstance } from '@arco-design/web-react';

/**
 * Account modal component props interface
 */
export interface AccountModalProps {
  /** Whether to show modal */
  visible: boolean;
  /** User being edited, null means create new */
  editingUser: User | null;
  /** Cancel callback */
  onCancel: () => void;
  /** Submit callback */
  onSubmit: (values: UserFormData) => Promise<boolean>;
  /** Arco Design Form instance type */
  form: FormInstance;
}

/**
 * Form field type
 */
export type FormFieldType =
  | 'username'
  | 'email'
  | 'password'
  | 'old_password'
  | 'new_password'
  | 'role'
  | 'status';

/**
 * Form validation rule type
 */
export interface ValidationRule {
  required?: boolean;
  message?: string;
  minLength?: number;
  maxLength?: number;
  type?: string;
  /** Arco Design Form validator function, accepts value and callback */
  validator?: (
    value: string | undefined,
    callback: (error?: string) => void,
  ) => void;
}
