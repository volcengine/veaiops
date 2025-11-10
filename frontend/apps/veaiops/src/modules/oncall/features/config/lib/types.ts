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

import type { FormInstance } from '@arco-design/web-react';
import type { Interest } from 'api-generate';

/**
 * Rule form data type
 * Note: examples_positive and examples_negative are strings in the form (newline-separated), converted to arrays when submitting
 */
export interface RuleFormData {
  name: string;
  description?: string;
  level?: Interest['level'];
  examples_positive?: string; // String in form, newline-separated
  examples_negative?: string; // String in form, newline-separated
  action_category?: Interest['action_category'];
  inspect_category?: Interest['inspect_category'];
  regular_expression?: string;
  inspect_history?: number;
  silence_delta?: string;
  is_active?: boolean;
}

/**
 * Rule data type when submitting (API format)
 */
export interface RuleSubmitData {
  name: string;
  description?: string;
  level?: Interest['level'];
  examples_positive?: string[]; // Array in API
  examples_negative?: string[]; // Array in API
  regular_expression?: string;
  inspect_history?: number;
  silence_delta?: string;
  is_active?: boolean;
}

/**
 * Rule drawer component properties
 */
export interface RuleDrawerProps {
  visible: boolean;
  isEdit: boolean;
  rule?: Interest;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: (values: RuleFormData) => void;
  loading?: boolean;
}
