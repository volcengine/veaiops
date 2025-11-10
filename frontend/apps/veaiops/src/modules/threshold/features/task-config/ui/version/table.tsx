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

  // Use drawer hooks
  const alarmDrawer = useAlarmDrawer(task);
  const rerunDrawer = useRerunDrawer(tableRef);

  // Use data source configuration
  const { dataSource } = useTaskVersionTableConfig(task?._id);

  // Render table
  const tableElement = useTaskVersionTableRenderer({
    dataSource,
    setDetailConfigData,
    setDetailConfigVisible,
    onCreateAlarm: alarmDrawer.open,
    onViewCleaningResult,
    onRerunOpen: rerunDrawer.open,
    tableRef,
  });

  return (
    <>
      {tableElement}
      {/* Render drawer components */}
      {alarmDrawer.render()}
      {rerunDrawer.render()}
    </>
  );
};

export default TaskVersionTable;
