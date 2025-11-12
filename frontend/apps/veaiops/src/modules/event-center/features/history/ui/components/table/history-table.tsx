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

// ✅ 优化：使用最短路径，合并同源导入
import {
  type HistoryFilters,
  useHistoryTableConfigFromTable as useHistoryTableConfig,
} from '@ec/history';
import { CustomTable, type CustomTableActionType } from '@veaiops/components';
import { queryArrayFormat, queryNumberArrayFormat } from '@veaiops/utils';
import type { Event } from 'api-generate';
import { forwardRef, useImperativeHandle, useRef } from 'react';

/**
 * 历史事件表格组件属性接口
 */
interface HistoryTableProps {
  onViewDetail: (record: Event) => void;
  filters: HistoryFilters;
  updateFilters: (filters: Partial<HistoryFilters>) => void;
  /** Initial query parameters - default filter values */
  initQuery?: HistoryFilters;
}

/**
 * 历史事件表格组件 Ref 接口
 */
export interface HistoryTableRef {
  refresh: () => Promise<{ success: boolean; error?: Error }>;
}

/**
 * 历史事件管理配置
 */
const HISTORY_MANAGEMENT_CONFIG = {
  title: '历史事件',
  description: '查看和管理历史事件记录',
};

/**
 * queryFormat: 用于合并多个同名参数时的处理
 * 在 querySearchParamsFormat 之后执行
 */
const queryFormat = {
  agent_type: queryArrayFormat,
  show_status: queryArrayFormat,
  status: queryNumberArrayFormat,
  event_level: queryArrayFormat,
};
/**
 * 历史事件表格组件
 * 使用CustomTable标准化实现 - 按照事件中心的标准模式
 *
 * ✅ 支持 initQuery：设置默认筛选条件（如默认只显示"发送成功"的事件）
 */
export const HistoryTable = forwardRef<HistoryTableRef, HistoryTableProps>(
  (
    { onViewDetail, filters, updateFilters: _updateFilters, initQuery },
    ref,
  ) => {
    // CustomTable 的内部 ref
    const tableRef = useRef<CustomTableActionType<Event>>(null);

    // 表格配置（已使用 useBusinessTable 自动处理刷新）
    const {
      customTableProps,
      handleColumns: configHandleColumns,
      handleFilters: configHandleFilters,
      operations,
    } = useHistoryTableConfig({
      filters,
      onViewDetail, // onViewDetail 类型为 (record: Event) => void，与接口定义一致
      ref: tableRef,
    });

    // 暴露符合 HistoryTableRef 接口的 refresh 方法
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

    return (
      <CustomTable<Event>
        {...customTableProps}
        title={HISTORY_MANAGEMENT_CONFIG.title}
        handleColumns={configHandleColumns}
        handleFilters={configHandleFilters}
        syncQueryOnSearchParams
        useActiveKeyHook
        // 表格配置
        tableClassName="history-management-table"
        queryFormat={queryFormat}
        initQuery={initQuery} // ✅ Pass initQuery to CustomTable for default filter
      />
    );
  },
);

HistoryTable.displayName = 'HistoryTable';

export default HistoryTable;
