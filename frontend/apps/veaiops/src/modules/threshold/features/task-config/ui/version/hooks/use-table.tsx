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

import { CustomTable } from '@veaiops/components';
import type { TableDataSource } from '@veaiops/types';
import type { IntelligentThresholdTaskVersion } from 'api-generate';
import type React from 'react';
import { handleColumns } from '../columns';
import { getTaskVersionFilters } from '../filters';

export interface TaskVersionTableRendererProps {
  dataSource: TableDataSource<
    IntelligentThresholdTaskVersion,
    Record<string, unknown>
  >;
  setDetailConfigData: (data: IntelligentThresholdTaskVersion) => void;
  setDetailConfigVisible: (visible: boolean) => void;
  onCreateAlarm: (version: IntelligentThresholdTaskVersion) => void;
  onViewCleaningResult?: (version: IntelligentThresholdTaskVersion) => void;
  onRerunOpen: (data: IntelligentThresholdTaskVersion) => void;
  tableRef: React.RefObject<any>;
}

/**
 * Task version table renderer hook
 * Encapsulates core rendering logic and configuration for the table
 */
export const useTaskVersionTableRenderer = ({
  dataSource,
  setDetailConfigData,
  setDetailConfigVisible,
  onCreateAlarm,
  onViewCleaningResult,
  onRerunOpen,
  tableRef,
}: TaskVersionTableRendererProps): React.ReactElement => {
  return (
    <CustomTable<
      IntelligentThresholdTaskVersion,
      any,
      any,
      IntelligentThresholdTaskVersion
    >
      ref={tableRef}
      rowKey="version"
      handleColumns={(props) =>
        handleColumns({
          ...props,
          setDetailConfigData,
          setDetailConfigVisible,
          onCreateAlarm,
          onViewCleaningResult,
          onRerunOpen,
        })
      }
      handleFilters={getTaskVersionFilters}
      dataSource={dataSource}
      tableProps={{
        scroll: { x: 900 },
        border: { headerCell: true, bodyCell: true },
      }}
      pagination={{
        pageSize: 50,
        sizeOptions: [50, 100],
      }}
      showReset
      supportSortColumns
    />
  );
};
