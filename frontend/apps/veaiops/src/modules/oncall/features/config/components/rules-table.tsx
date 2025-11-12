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

import { Button } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useRulesData, useRulesTable } from '@oncall-config/hooks';
import { CustomTable, type CustomTableActionType } from '@veaiops/components';
import type { Bot, Interest } from 'api-generate';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';

/**
 * 切换状态参数接口
 */
interface HandleToggleStatusParams {
  ruleUuid: string;
  isActive: boolean;
}

export interface RulesTableProps {
  bots: Bot[];
  onToggleStatus: (params: HandleToggleStatusParams) => Promise<boolean>;
  onViewDetails: (rule: Interest) => void;
  onEdit: (rule: Interest) => void;
  onCreateRule: () => void;
}

export interface RulesTableRef {
  refresh: () => Promise<{ success: boolean; error?: Error }>;
}

/**
 * Oncall规则表格组件
 * 使用 CustomTable 标准化实现
 * 支持刷新功能，各种操作都会自动刷新表格数据
 */
export const RulesTable = forwardRef<RulesTableRef, RulesTableProps>(
  ({ bots, onToggleStatus, onViewDetails, onEdit, onCreateRule }, ref) => {
    // CustomTable 的内部 ref
    const tableRef = useRef<CustomTableActionType<Interest>>(null);

    // 使用内聚型Hook分离业务逻辑和UI配置
    const { customTableProps, operations } = useRulesData({
      bots,
      ref: tableRef,
    });

    // 暴露符合 RulesTableRef 接口的 refresh 方法
    useImperativeHandle(
      ref,
      () => ({
        refresh: async () => {
          if (operations?.refresh) {
            return await operations.refresh();
          }
          // 如果 operations 不可用，尝试使用 tableRef
          if (tableRef.current?.refresh) {
            await tableRef.current.refresh();
            return { success: true };
          }
          return {
            success: false,
            error: new Error('刷新方法不可用'),
          };
        },
      }),
      [operations],
    );
    const { handleColumns, handleFilters } = useRulesTable({
      bots,
      onToggleStatus,
      onViewDetails,
      onEdit,
    });

    // 默认选择第一个机器人作为初始查询参数（与原分支功能一致）
    const initQuery = useMemo(() => {
      if (bots.length > 0 && bots[0]?.bot_id) {
        return { botId: bots[0].bot_id };
      }
      return {};
    }, [bots]);

    // 操作按钮：添加"新增规则"按钮
    const actions = useMemo(
      () => [
        <Button
          key="create"
          type="primary"
          icon={<IconPlus />}
          onClick={onCreateRule}
          data-testid="create-oncall-rule-btn"
        >
          新增规则
        </Button>,
      ],
      [onCreateRule],
    );

    return (
      <div data-testid="oncall-config-table">
        <CustomTable<Interest>
          {...customTableProps}
          ref={tableRef}
          title="内容识别规则详情"
          actions={actions}
          handleColumns={handleColumns}
          handleFilters={handleFilters}
          isAlertShow={true}
          showRefresh={true}
          syncQueryOnSearchParams
          useActiveKeyHook
          initQuery={initQuery}
        />
      </div>
    );
  },
);

RulesTable.displayName = 'RulesTable';
