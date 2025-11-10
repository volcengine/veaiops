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

import { Drawer } from '@arco-design/web-react';
import { CustomTable } from '@veaiops/components';
import type {
  IntelligentThresholdTask,
  IntelligentThresholdTaskVersion,
  MetricThresholdResult,
} from 'api-generate';
import type React from 'react';
import { useMemo } from 'react';
import { TaskDrawerTitle } from '../components/displays';
import { useCleaningResultColumns } from '../hooks';

/**
 * Cleaning result drawer props interface
 */
export interface CleaningResultDrawerProps {
  /** Whether visible */
  visible: boolean;
  /** Task record */
  taskRecord?: IntelligentThresholdTask | null;
  /** Version record */
  versionRecord?: IntelligentThresholdTaskVersion | null;
  /** Close callback */
  onClose: () => void;
  /** View timeseries chart callback */
  onViewTimeSeries?: (
    record: MetricThresholdResult,
    task?: IntelligentThresholdTask,
  ) => void;
}

/**
 * Cleaning result drawer component
 * Uses CustomTable to display cleaning result data
 */
const CleaningResultDrawer: React.FC<CleaningResultDrawerProps> = ({
  visible,
  taskRecord,
  versionRecord,
  onClose,
  onViewTimeSeries,
}) => {
  // Handle column configuration, wrap onViewTimeSeries to pass task information
  const wrappedOnViewTimeSeries = onViewTimeSeries
    ? (record: MetricThresholdResult) =>
        onViewTimeSeries(record, taskRecord || undefined)
    : undefined;

  const handleColumns = useCleaningResultColumns({
    onViewTimeSeries: wrappedOnViewTimeSeries,
  });

  // Handle filter configuration (temporarily empty, can be extended later)
  const handleFilters = useMemo(() => {
    return () => [];
  }, []);

  // Data source configuration
  const dataSource = useMemo(() => {
    const results = versionRecord?.result || [];

    return {
      // Use static data source
      dataList: results,
      ready: false,
    };
  }, [versionRecord?.result]);

  // Generate row key
  // const getRowKey = useMemo(() => {
  //   return (record: MetricThresholdResult) =>
  //     record.unique_key || record.name || 'unknown';
  // }, []); // Removed unused variable

  return (
    <Drawer
      title={
        <TaskDrawerTitle
          titleType="cleaning-result"
          taskRecord={taskRecord}
          version={versionRecord?.version}
        />
      }
      visible={visible}
      onCancel={onClose}
      width="80%"
      footer={null}
      maskClosable={false}
      focusLock={false}
    >
      <div className="mb-5">
        <CustomTable<MetricThresholdResult>
          rowKey={'unique_key'}
          handleColumns={handleColumns}
          handleFilters={handleFilters}
          dataSource={dataSource}
          tableProps={{
            scroll: { x: 1000 },
            border: { headerCell: true, bodyCell: true },
            size: 'small',
          }}
          pagination={{
            defaultPageSize: 20,
            sizeOptions: [20, 50, 100],
          }}
          showReset={false}
          syncQueryOnSearchParams={false}
        />
      </div>
    </Drawer>
  );
};

export default CleaningResultDrawer;
