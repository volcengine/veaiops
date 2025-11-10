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

import { useBotList } from '@/modules/system/features/bot/hooks';
import { Form, Message } from '@arco-design/web-react';
import {
  RuleDrawer,
  RulesTable,
  type RulesTableRef,
} from '@oncall-config/components';
import type { RuleFormData, RuleSubmitData } from '@oncall-config/lib';
import { oncallRuleService } from '@oncall/api';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { useManagementRefresh } from '@veaiops/hooks';
import { logger } from '@veaiops/utils';
import { Interest } from 'api-generate';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';

/**
 * Oncall configuration page
 * Corresponding route: /oncall/config
 * Functionality: Oncall rule configuration management (includes all UI such as table, drawer, etc.)
 *
 * Refactoring notes:
 * - Original branch (feat/web-v2): Used useOncallRules hook and independent table component
 * - Current branch: Uses CustomTable standardized architecture
 * - Functional equivalence: ✅ All original branch functionality implemented
 *   - Rule list retrieval ✅
 *   - Rule status toggle ✅
 *   - Rule editing ✅
 *   - Rule detail viewing ✅
 *   - Table refresh ✅
 */
export const OncallConfigPage: React.FC = () => {
  const { bots } = useBotList();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentRule, setCurrentRule] = useState<Interest | undefined>();
  const [form] = Form.useForm();

  // CustomTable ref for getting refresh function
  const tableRef = useRef<RulesTableRef>(null);

  // Get table refresh function
  const getRefreshTable = useCallback(async () => {
    if (tableRef.current?.refresh) {
      const result = await tableRef.current.refresh();
      if (!result.success && result.error) {
        logger.warn({
          message: 'oncall规则表格刷新失败',
          data: {
            error: result.error.message,
            stack: result.error.stack,
            errorObj: result.error,
          },
          source: 'OncallConfigPage',
          component: 'getRefreshTable',
        });
      }
    }
  }, []);

  // Use management refresh Hook to provide refresh functionality after editing
  const { afterUpdate } = useManagementRefresh(getRefreshTable);

  // Status toggle handling - implements actual API call
  interface HandleToggleStatusParams {
    ruleUuid: string;
    isActive: boolean;
  }
  const handleToggleStatus = useCallback(
    async ({
      ruleUuid,
      isActive,
    }: HandleToggleStatusParams): Promise<boolean> => {
      try {
        const response = await oncallRuleService.updateInterestActiveStatus(
          ruleUuid,
          isActive,
        );

        if (response.code === API_RESPONSE_CODE.SUCCESS) {
          Message.success({
            content: isActive ? '规则已启用' : '规则已停止',
            duration: 20000,
          });
          // Refresh table
          await getRefreshTable();
          return true;
        }

        Message.error({
          content: response.message || '更新规则状态失败',
          duration: 20000,
        });
        logger.error({
          message: '更新规则状态失败',
          data: { ruleUuid, isActive, response },
          source: 'OncallConfigPage',
          component: 'handleToggleStatus',
        });
        return false;
      } catch (error) {
        // ✅ Correct: expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || '更新规则状态失败，请重试';
        Message.error({ content: errorMessage, duration: 20000 });
        logger.error({
          message: errorMessage,
          data: { error: errorObj, ruleUuid, isActive },
          source: 'OncallConfigPage',
          component: 'handleToggleStatus',
        });
        return false;
      }
    },
    [getRefreshTable],
  );

  // View details
  const handleViewDetails = useCallback((rule: Interest) => {
    setCurrentRule(rule);
    setIsEdit(false);
    setDrawerVisible(true);
  }, []);

  // Edit rule
  const handleEdit = useCallback((rule: Interest) => {
    setCurrentRule(rule);
    setIsEdit(true);
    setDrawerVisible(true);
  }, []);

  // Close drawer
  const handleCloseDrawer = useCallback(() => {
    setDrawerVisible(false);
    setCurrentRule(undefined);
    setIsEdit(false);
    form.resetFields();
  }, [form]);

  // Submit form - implements actual API call
  const handleSubmit = useCallback(
    async (values: RuleFormData) => {
      if (!currentRule?.uuid) {
        Message.error({ content: '规则ID不存在', duration: 20000 });
        return;
      }

      try {
        // Process form data based on inspect category
        const inspectCategory = currentRule.inspect_category;
        const updateData: RuleSubmitData = {
          name: values.name,
          description: values.description,
          level: values.level,
          silence_delta: values.silence_delta,
          is_active: values.is_active,
          inspect_history: values.inspect_history,
        };

        // Add corresponding editable fields based on inspect category
        if (inspectCategory === Interest.inspect_category.SEMANTIC) {
          updateData.examples_positive = values.examples_positive
            ? values.examples_positive
                .split('\n')
                .filter((s: string) => s.trim())
            : [];
          updateData.examples_negative = values.examples_negative
            ? values.examples_negative
                .split('\n')
                .filter((s: string) => s.trim())
            : [];
        } else if (inspectCategory === Interest.inspect_category.RE) {
          updateData.regular_expression = values.regular_expression;
        }

        const response = await oncallRuleService.updateInterestRule(
          currentRule.uuid,
          updateData,
        );

        if (response.code === API_RESPONSE_CODE.SUCCESS) {
          Message.success({
            content: '规则更新成功',
            duration: 20000,
          });
          // Use useManagementRefresh's afterUpdate method to refresh table
          const refreshResult = await afterUpdate();
          if (!refreshResult.success && refreshResult.error) {
        logger.warn({
          message: '更新后刷新表格失败',
          data: {
            error: refreshResult.error.message,
            stack: refreshResult.error.stack,
            errorObj: refreshResult.error,
          },
          source: 'OncallConfigPage',
          component: 'handleSubmit',
        });
          }
          handleCloseDrawer();
        } else {
          Message.error({
            content: response.message || '更新规则失败',
            duration: 20000,
          });
          logger.error({
            message: '更新规则失败',
            data: { currentRule, values, response },
            source: 'OncallConfigPage',
            component: 'handleSubmit',
          });
        }
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || '更新规则失败，请重试';
        Message.error({ content: errorMessage, duration: 20000 });
        logger.error({
          message: errorMessage,
          data: { error: errorObj, currentRule, values },
          source: 'OncallConfigPage',
          component: 'handleSubmit',
        });
      }
    },
    [currentRule, afterUpdate, handleCloseDrawer],
  );

  return (
    <>
      {/* Rules table */}
      <RulesTable
        ref={tableRef}
        bots={bots}
        onToggleStatus={handleToggleStatus}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
      />

      {/* Rule drawer */}
      <RuleDrawer
        visible={drawerVisible}
        isEdit={isEdit}
        rule={currentRule}
        form={form}
        onCancel={handleCloseDrawer}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default OncallConfigPage;
