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

import { type Form, Message } from '@arco-design/web-react';
import { DEFAULT_RULE_CONFIG } from '@threshold/shared/constants/rules';
import type { ThresholdRule } from '@threshold/shared/types/rules';
import { validateRuleConfig } from '@threshold/shared/utils/rules';
import { logger } from '@veaiops/utils';
import { useCallback } from 'react';
import type { RuleFormData } from '../../types/rules';
import {
  createRule,
  deleteRule,
  fetchRules,
  toggleRule,
  updateRule,
} from '../lib/api';

/**
 * Rules management business logic Hook
 */
export const useRulesLogic = ({
  loading,
  setLoading,
  rules,
  setRules,
  modalVisible,
  setModalVisible,
  detailModalVisible,
  setDetailModalVisible,
  editingRule,
  setEditingRule,
  selectedRule,
  setSelectedRule,
  form,
}: {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  rules: ThresholdRule[];
  setRules: (rules: ThresholdRule[]) => void;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  detailModalVisible: boolean;
  setDetailModalVisible: (visible: boolean) => void;
  editingRule: ThresholdRule | null;
  setEditingRule: (rule: ThresholdRule | null) => void;
  selectedRule: ThresholdRule | null;
  setSelectedRule: (rule: ThresholdRule | null) => void;
  form: ReturnType<typeof Form.useForm>[0];
}) => {
  /**
   * Fetch rules list
   */
  const handleFetchRules = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedRules = await fetchRules();
      setRules(fetchedRules);
    } catch (error: unknown) {
      // ✅ Correct: Expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage =
        errorObj.message || 'Failed to fetch rules list, please retry';
      Message.error(errorMessage);
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setRules]);

  /**
   * Create rule
   */
  const handleCreateRule = useCallback(
    async (values: RuleFormData | Partial<ThresholdRule>) => {
      const success = await createRule({ values });
      if (success) {
        setModalVisible(false);
        form.resetFields();
        setEditingRule(null);
        // Refresh list
        await handleFetchRules();
      }
    },
    [form, setModalVisible, setEditingRule, handleFetchRules],
  );

  /**
   * Update rule
   */
  const handleUpdateRule = useCallback(
    async (id: string, values: RuleFormData | Partial<ThresholdRule>) => {
      const success = await updateRule({ id, values });
      if (success) {
        setModalVisible(false);
        form.resetFields();
        setEditingRule(null);
        // Refresh list
        await handleFetchRules();
      }
    },
    [form, setModalVisible, setEditingRule, handleFetchRules],
  );

  /**
   * Delete rule
   */
  const handleDeleteRule = useCallback(
    async (id: string) => {
      const success = await deleteRule({ id });
      if (success) {
        // Refresh list
        await handleFetchRules();
      }
    },
    [handleFetchRules],
  );

  /**
   * Toggle rule enabled state
   */
  const handleToggleRule = useCallback(
    async (id: string, isActive: boolean): Promise<boolean> => {
      try {
        const success = await toggleRule({ id, isActive });
        if (success) {
          // Refresh list
          await handleFetchRules();
        }
        return success;
      } catch (error: unknown) {
        // ✅ Correct: Use logger to record error and expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: 'Failed to toggle rule state',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
            ruleId: id,
            isActive,
          },
          source: 'RulesLogic',
          component: 'handleToggleRule',
        });
        return false;
      }
    },
    [handleFetchRules],
  );

  /**
   * Copy rule
   */
  const handleCopyRule = useCallback(
    (rule: ThresholdRule) => {
      setEditingRule(null);
      form.setFieldsValue({
        name: `${rule.name} - 副本`,
        description: rule.description,
        template_id: rule.template_id,
        metric_query: rule.metric_query,
        warning_threshold:
          rule.threshold_config?.warning_threshold ||
          DEFAULT_RULE_CONFIG.threshold_config.warning_threshold,
        critical_threshold:
          rule.threshold_config?.critical_threshold ||
          DEFAULT_RULE_CONFIG.threshold_config.critical_threshold,
        comparison_operator:
          rule.threshold_config?.comparison_operator ||
          DEFAULT_RULE_CONFIG.threshold_config.comparison_operator,
        channels:
          rule.notification_config?.channels ||
          DEFAULT_RULE_CONFIG.notification_config.channels,
        recipients:
          rule.notification_config?.recipients ||
          DEFAULT_RULE_CONFIG.notification_config.recipients,
        suppress_duration:
          rule.notification_config?.suppress_duration ||
          DEFAULT_RULE_CONFIG.notification_config.suppress_duration,
        is_active: false,
      });
      setModalVisible(true);
    },
    [form, setEditingRule, setModalVisible],
  );

  /**
   * Open edit modal
   */
  const openEditModal = useCallback(
    (rule: ThresholdRule) => {
      setEditingRule(rule);
      form.setFieldsValue({
        name: rule.name,
        description: rule.description,
        template_id: rule.template_id,
        metric_query: rule.metric_query,
        warning_threshold:
          rule.threshold_config?.warning_threshold ||
          DEFAULT_RULE_CONFIG.threshold_config.warning_threshold,
        critical_threshold:
          rule.threshold_config?.critical_threshold ||
          DEFAULT_RULE_CONFIG.threshold_config.critical_threshold,
        comparison_operator:
          rule.threshold_config?.comparison_operator ||
          DEFAULT_RULE_CONFIG.threshold_config.comparison_operator,
        channels:
          rule.notification_config?.channels ||
          DEFAULT_RULE_CONFIG.notification_config.channels,
        recipients:
          rule.notification_config?.recipients ||
          DEFAULT_RULE_CONFIG.notification_config.recipients,
        suppress_duration:
          rule.notification_config?.suppress_duration ||
          DEFAULT_RULE_CONFIG.notification_config.suppress_duration,
        is_active: rule.is_active,
      });
      setModalVisible(true);
    },
    [form, setEditingRule, setModalVisible],
  );

  /**
   * View rule detail
   */
  const viewRuleDetail = useCallback(
    (rule: ThresholdRule) => {
      setSelectedRule(rule);
      setDetailModalVisible(true);
    },
    [setSelectedRule, setDetailModalVisible],
  );

  /**
   * Submit form
   */
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validate();
      const validation = validateRuleConfig(values);

      if (!validation.isValid) {
        Object.entries(validation.errors).forEach(([_field, message]) => {
          Message.error(message);
        });
        return;
      }

      if (editingRule) {
        await handleUpdateRule(editingRule.id, values);
      } else {
        await handleCreateRule(values);
      }
    } catch (error: unknown) {
      // ✅ Correct: Expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = errorObj.message || '操作失败，请重试';
      Message.error(errorMessage);
    }
  }, [form, editingRule, handleUpdateRule, handleCreateRule]);

  return {
    handleFetchRules,
    handleCreateRule,
    handleUpdateRule,
    handleDeleteRule,
    handleToggleRule,
    handleCopyRule,
    openEditModal,
    viewRuleDetail,
    handleSubmit,
  };
};
