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

import type { CustomTableActionType } from '@veaiops/components';
import type { BaseQuery, BaseRecord } from '@veaiops/types';
import { logger } from '@veaiops/utils';
import { useInterval } from 'ahooks';
import { useRef } from 'react';
import {
  useAlarmDrawer,
  useRerunDrawer,
  useTaskVersionTableConfig,
  useTaskVersionTableRenderer,
} from './hooks';
import type { TaskVersionTableProps } from './types';

const TaskVersionTable: React.FC<TaskVersionTableProps> = ({
  task,
  setDetailConfigData,
  setDetailConfigVisible,
  onViewCleaningResult,
}) => {
  const tableRef = useRef<CustomTableActionType<BaseRecord, BaseQuery>>(null);

  // 使用抽屉 hooks
  const alarmDrawer = useAlarmDrawer(task);
  const rerunDrawer = useRerunDrawer(tableRef);

  // 使用数据源配置
  const { dataSource } = useTaskVersionTableConfig(task?._id);

  // 渲染表格
  const tableElement = useTaskVersionTableRenderer({
    dataSource,
    setDetailConfigData,
    setDetailConfigVisible,
    onCreateAlarm: alarmDrawer.open,
    onViewCleaningResult,
    onRerunOpen: rerunDrawer.open,
    tableRef,
  });

  // Auto refresh table data every 3 seconds to update task status
  useInterval(() => {
    // Only refresh when tableRef is available
    if (tableRef.current?.refresh) {
      logger.debug({
        message: '[TaskVersionTable] Auto refreshing task versions',
        source: 'TaskVersionTable',
      });
      tableRef.current.refresh();
    }
  }, 3000);

  return (
    <>
      {tableElement}
      {/* 渲染抽屉组件 */}
      {alarmDrawer.render()}
      {rerunDrawer.render()}
    </>
  );
};

export default TaskVersionTable;
