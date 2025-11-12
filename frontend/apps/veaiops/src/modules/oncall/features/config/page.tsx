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
import { convertToISO8601Duration } from '@oncall-config/lib';
import { oncallRuleService } from '@oncall/api';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { useManagementRefresh } from '@veaiops/hooks';
import { logger } from '@veaiops/utils';
import { Interest } from 'api-generate';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';

/**
 * Oncall 配置页面
 * 对应路由: /oncall/config
 * 功能: Oncall 规则配置管理（包含表格、抽屉等所有 UI）
 *
 * 重构说明：
 * - 原分支 (feat/web-v2): 使用 useOncallRules hook 和独立的表格组件
 * - 当前分支: 使用 CustomTable 标准化架构
 * - 功能等价性: ✅ 已实现所有原分支功能
 *   - 规则列表获取 ✅
 *   - 规则状态切换 ✅
 *   - 规则编辑 ✅
 *   - 规则详情查看 ✅
 *   - 表格刷新 ✅
 */
export const OncallConfigPage: React.FC = () => {
  const { bots } = useBotList();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentRule, setCurrentRule] = useState<Interest | undefined>();
  const [submitLoading, setSubmitLoading] = useState(false);
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

  // Use management refresh Hook to provide post-edit refresh functionality
  const { afterUpdate } = useManagementRefresh(getRefreshTable);

  // Status toggle handler - implements real API call
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
          // 刷新表格
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
        // ✅ 正确：透出实际的错误信息
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

  // 查看详情
  const handleViewDetails = useCallback((rule: Interest) => {
    setCurrentRule(rule);
    setIsEdit(false);
    setDrawerVisible(true);
  }, []);

  // 编辑规则
  const handleEdit = useCallback((rule: Interest) => {
    setCurrentRule(rule);
    setIsEdit(true);
    setDrawerVisible(true);
  }, []);

  // 新增规则
  const handleCreateRule = useCallback(() => {
    setCurrentRule(undefined);
    setIsEdit(false); // 创建模式
    setDrawerVisible(true);
  }, []);

  // 关闭抽屉
  const handleCloseDrawer = useCallback(() => {
    setDrawerVisible(false);
    setCurrentRule(undefined);
    setIsEdit(false);
    form.resetFields();
  }, [form]);

  // Get currently selected bot info (from query params or bots list)
  const getCurrentBot = useCallback(() => {
    // Get current botId from query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const botId =
      urlParams.get('botId') || (bots.length > 0 ? bots[0]?.bot_id : '');
    const bot = bots.find((b) => b.bot_id === botId);
    return { botId: botId || '', channel: bot?.channel || 'lark' };
  }, [bots]);

  // Submit form - implements real API call
  const handleSubmit = useCallback(
    async (values: RuleFormData) => {
      setSubmitLoading(true);
      try {
        // Process form data based on inspection category
        const inspectCategory = isEdit
          ? currentRule?.inspect_category
          : values.inspect_category;

        // Convert silence_delta from human-readable format to ISO 8601 duration
        // e.g., "2h" → "PT2H", "30m" → "PT30M", "1d" → "P1D"
        const silenceDeltaISO8601 = values.silence_delta
          ? convertToISO8601Duration(values.silence_delta)
          : undefined;

        const submitData: RuleSubmitData = {
          name: values.name,
          description: values.description,
          level: values.level,
          silence_delta: silenceDeltaISO8601,
          is_active: values.is_active,
          inspect_history: values.inspect_history,
        };

        // Create mode requires additional required fields
        if (!isEdit) {
          submitData.action_category = values.action_category;
          submitData.inspect_category = values.inspect_category;
        }

        // Add fields based on inspection category
        if (inspectCategory === Interest.inspect_category.SEMANTIC) {
          submitData.examples_positive = values.examples_positive
            ? values.examples_positive
                .split('\n')
                .filter((s: string) => s.trim())
            : [];
          submitData.examples_negative = values.examples_negative
            ? values.examples_negative
                .split('\n')
                .filter((s: string) => s.trim())
            : [];
        } else if (inspectCategory === Interest.inspect_category.RE) {
          submitData.regular_expression = values.regular_expression;
        }

        let response: APIResponseInterest;

        if (isEdit) {
          // 编辑模式
          if (!currentRule?.uuid) {
            Message.error({ content: '规则ID不存在', duration: 20000 });
            return;
          }
          response = await oncallRuleService.updateInterestRule(
            currentRule.uuid,
            submitData,
          );

          if (response.code === API_RESPONSE_CODE.SUCCESS) {
            Message.success({
              content: <span>✅ 规则更新成功！列表正在刷新...</span>,
              duration: 3000,
            });
            // 使用 useManagementRefresh 的 afterUpdate 方法刷新表格
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
        } else {
          // Create mode
          const { botId, channel } = getCurrentBot();
          if (!botId) {
            Message.error({ content: '请选择机器人', duration: 20000 });
            return;
          }

          response = await oncallRuleService.createInterestRule(
            channel,
            botId,
            submitData,
          );

          // ✅ Check status code: 201 means creation success, others mean failure
          if (response.code === API_RESPONSE_CODE.SUCCESS) {
            Message.success({
              content: <span>🎉 规则创建成功！列表正在刷新...</span>,
              duration: 3000,
            });
            // Refresh table
            const refreshResult = await afterUpdate();
            if (!refreshResult.success && refreshResult.error) {
              logger.warn({
                message: '创建后刷新表格失败',
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
            // ✅ When not 201, don't close drawer and show error message
            Message.error({
              content: response.message || '创建规则失败',
              duration: 20000,
            });
            logger.error({
              message: '创建规则失败',
              data: { values, response },
              source: 'OncallConfigPage',
              component: 'handleSubmit',
            });
            // Don't call handleCloseDrawer() to keep drawer open
          }
        }
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage =
          errorObj.message || `${isEdit ? '更新' : '创建'}规则失败，请重试`;
        Message.error({ content: errorMessage, duration: 20000 });
        logger.error({
          message: errorMessage,
          data: { error: errorObj, currentRule, values },
          source: 'OncallConfigPage',
          component: 'handleSubmit',
        });
        // ✅ 出现异常时，不关闭抽屉，让用户可以修改后重试
      } finally {
        setSubmitLoading(false);
      }
    },
    [isEdit, currentRule, afterUpdate, handleCloseDrawer, getCurrentBot],
  );

  return (
    <>
      {/* 规则表格 */}
      <RulesTable
        ref={tableRef}
        bots={bots}
        onToggleStatus={handleToggleStatus}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onCreateRule={handleCreateRule}
      />

      {/* 规则抽屉 */}
      <RuleDrawer
        visible={drawerVisible}
        isEdit={isEdit}
        rule={currentRule}
        form={form}
        loading={submitLoading}
        onCancel={handleCloseDrawer}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default OncallConfigPage;
