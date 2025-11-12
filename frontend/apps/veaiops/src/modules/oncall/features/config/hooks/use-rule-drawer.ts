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

import { Form, type FormInstance } from '@arco-design/web-react';
import type { RuleFormData } from '@oncall-config/lib';
import { Interest } from 'api-generate';
import { useEffect, useState } from 'react';

/**
 * 规则抽屉 Hook
 * 负责表单状态管理和初始化逻辑
 */
export interface UseRuleDrawerOptions {
  visible: boolean;
  isEdit: boolean;
  rule?: Interest;
  form: FormInstance;
}

export interface UseRuleDrawerReturn {
  inspectCategory: Interest['inspect_category'] | undefined;
  currentSilenceDelta: string | undefined;
  setCurrentSilenceDelta: (value: string | undefined) => void;
  handleSubmit: (onSubmit: (values: RuleFormData) => void) => void;
}

/**
 * 规则抽屉业务逻辑 Hook
 */
export const useRuleDrawer = ({
  visible,
  isEdit,
  rule,
  form,
}: UseRuleDrawerOptions): UseRuleDrawerReturn => {
  // 检测类别状态（用于条件显示字段）
  const [inspectCategory, setInspectCategory] = useState<
    Interest['inspect_category'] | undefined
  >(undefined);

  // 当前抑制间隔（用于实时预览）
  const [currentSilenceDelta, setCurrentSilenceDelta] = useState<
    string | undefined
  >(undefined);

  // 表单字段名称映射（用于监听变化）
  const inspect_category = Form.useWatch('inspect_category', form);

  // 当检测类别变化时，更新状态
  useEffect(() => {
    if (inspect_category) {
      setInspectCategory(inspect_category as Interest['inspect_category']);
    }
  }, [inspect_category]);

  // 初始化表单值
  useEffect(() => {
    if (visible) {
      if (rule && isEdit) {
        // 编辑模式：填充规则数据
        const category = rule.inspect_category;
        setInspectCategory(category);
        setCurrentSilenceDelta(rule.silence_delta);

        form.setFieldsValue({
          name: rule.name,
          description: rule.description,
          level: rule.level || undefined,
          action_category: rule.action_category,
          inspect_category: rule.inspect_category,
          regular_expression: rule.regular_expression || '',
          inspect_history: rule.inspect_history || 1,
          silence_delta: rule.silence_delta || '',
          is_active: rule.is_active ?? true,
          examples_positive: rule.examples_positive?.join('\n') || '',
          examples_negative: rule.examples_negative?.join('\n') || '',
        });
      } else if (!isEdit) {
        // 创建模式：设置默认值
        setInspectCategory(undefined);
        setCurrentSilenceDelta(undefined);
        form.setFieldsValue({
          name: '',
          description: '',
          level: undefined,
          action_category: Interest.action_category.DETECT,
          inspect_category: Interest.inspect_category.SEMANTIC,
          regular_expression: '',
          inspect_history: 1,
          silence_delta: '',
          is_active: true,
          examples_positive: '',
          examples_negative: '',
        });
        // Set initial inspection category to SEMANTIC
        setInspectCategory(Interest.inspect_category.SEMANTIC);
      }
    }
  }, [visible, rule, isEdit, form]);

  const handleSubmit = (onSubmit: (values: RuleFormData) => void) => {
    form
      .validate()
      .then(onSubmit)
      .catch(() => {
        // 表单验证失败，无需额外处理
      });
  };

  return {
    inspectCategory,
    currentSilenceDelta,
    setCurrentSilenceDelta,
    handleSubmit,
  };
};
