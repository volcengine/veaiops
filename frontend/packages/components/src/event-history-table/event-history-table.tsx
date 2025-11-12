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
import {
  createServerPaginationDataSource,
  createStandardTableProps,
  queryArrayFormat,
} from '@veaiops/utils';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { CustomTable } from '../custom-table';
import type { HandleFilterProps } from '../custom-table/types/core/common';
import { getEventHistoryColumns } from './columns';
import { getEventHistoryFilters } from './filters';
import type { EventHistoryFilters, EventHistoryTableProps } from './types';
// Query format 配置
const queryFormat = {
  agent_type: queryArrayFormat,
  event_level: queryArrayFormat,
  show_status: queryArrayFormat,
};
/**
 * 统一的历史事件表格组件
 *
 * 用于三个模块的历史事件展示：
 * - 智能阈值历史事件
 * - ChatOps历史事件
 * - 事件中心历史事件
 *
 * 特点：
 * - 统一的列配置：事件ID、智能体、状态、事件级别、项目、创建时间、更新时间
 * - 根据模块类型自动过滤智能体选项
 * - 支持自定义操作列
 * - 通过 props 注入 API 请求函数，避免在组件库层直接依赖应用层代码
 */
export const EventHistoryTable: React.FC<EventHistoryTableProps> = ({
  moduleType,
  title = '历史事件',
  showExport = false,
  onViewDetail,
  customActions,
  request,
}) => {
  // 使用传入的 request 函数
  if (!request) {
    throw new Error('EventHistoryTable: request prop is required');
  }

  // 数据源配置
  const dataSource = useMemo(
    () => createServerPaginationDataSource({ request }),
    [request],
  );

  // 表格属性配置
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: '_id',
        pageSize: 10,
        scrollX: 1400,
      }),
    [],
  );

  // 列配置
  const handleColumns = useMemo(() => {
    return () => getEventHistoryColumns({ onViewDetail, customActions });
  }, [onViewDetail, customActions]);

  // 筛选器配置
  const handleFilters = useCallback(
    (props: HandleFilterProps<EventHistoryFilters>) => {
      return getEventHistoryFilters({
        ...props,
        moduleType,
      });
    },
    [moduleType],
  );

  // 操作按钮
  const actions = useMemo(() => {
    const buttons: React.ReactNode[] = [];

    if (showExport) {
      buttons.push(
        <Button key="export" type="primary">
          导出
        </Button>,
      );
    }

    return buttons;
  }, [showExport]);

  return (
    <CustomTable
      title={title}
      dataSource={dataSource}
      handleColumns={handleColumns}
      handleFilters={handleFilters}
      tableProps={tableProps}
      actions={actions}
      queryFormat={queryFormat}
      syncQueryOnSearchParams
      useActiveKeyHook
    />
  );
};

export default EventHistoryTable;
