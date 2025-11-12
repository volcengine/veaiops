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
 * 规则表单数据类型
 * 注意：examples_positive 和 examples_negative 在表单中是字符串（换行符分隔），提交时转换为数组
 */
export interface RuleFormData {
  name: string;
  description?: string;
  level?: Interest['level'];
  examples_positive?: string; // 表单中是字符串，换行符分隔
  examples_negative?: string; // 表单中是字符串，换行符分隔
  action_category?: Interest['action_category']; // 创建模式必填
  inspect_category?: Interest['inspect_category']; // 创建模式必填
  regular_expression?: string;
  inspect_history?: number;
  silence_delta?: string;
  is_active?: boolean;
}

/**
 * 提交时的规则数据类型（API 格式）
 */
export interface RuleSubmitData {
  name: string;
  description?: string;
  level?: Interest['level'];
  examples_positive?: string[]; // 提交时是数组
  examples_negative?: string[]; // 提交时是数组
  action_category?: Interest['action_category']; // 创建模式必填
  inspect_category?: Interest['inspect_category']; // 创建模式必填
  regular_expression?: string;
  inspect_history?: number;
  silence_delta?: string;
  is_active?: boolean;
}

/**
 * 规则抽屉组件属性
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
