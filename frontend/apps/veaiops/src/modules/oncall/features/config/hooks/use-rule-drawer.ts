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
import type { Interest } from 'api-generate';
import { useEffect, useState } from 'react';

/**
 * Rule drawer Hook
 * Responsible for form state management and initialization logic
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
 * Rule drawer business logic Hook
 */
export const useRuleDrawer = ({
  visible,
  isEdit,
  rule,
  form,
}: UseRuleDrawerOptions): UseRuleDrawerReturn => {
  // Inspection category state (for conditional field display)
  const [inspectCategory, setInspectCategory] = useState<
    Interest['inspect_category'] | undefined
  >(undefined);

  // Current silence delta (for real-time preview)
  const [currentSilenceDelta, setCurrentSilenceDelta] = useState<
    string | undefined
  >(undefined);

  // Form field name mapping (for change monitoring)
  const inspect_category = Form.useWatch('inspect_category', form);

  // Update state when inspection category changes
  useEffect(() => {
    if (inspect_category) {
      setInspectCategory(inspect_category as Interest['inspect_category']);
    }
  }, [inspect_category]);

  // Initialize form values
  useEffect(() => {
    if (visible && rule && isEdit) {
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
        is_active: rule.is_active,
        examples_positive: rule.examples_positive?.join('\n') || '',
        examples_negative: rule.examples_negative?.join('\n') || '',
      });
    }
  }, [visible, rule, isEdit, form]);

  const handleSubmit = (onSubmit: (values: RuleFormData) => void) => {
    form
      .validate()
      .then(onSubmit)
      .catch(() => {
        // Form validation failed, no additional handling needed
      });
  };

  return {
    inspectCategory,
    currentSilenceDelta,
    setCurrentSilenceDelta,
    handleSubmit,
  };
};
