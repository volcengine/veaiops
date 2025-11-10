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

import type { MetricThresholdResult } from 'api-generate';
import { useMemo } from 'react';
import {
  ActionsColumn,
  LabelsColumn,
  MetricInfoColumn,
  ThresholdConfigColumn,
  getStatusColumn,
} from '../components';

/**
 * Cleaning result table column configuration Hook
 */
export const useCleaningResultColumns = (options?: {
  onViewTimeSeries?: (record: MetricThresholdResult) => void;
}) => {
  const { onViewTimeSeries } = options || {};

  return useMemo(() => {
    return () => [
      {
        title: '指标信息',
        dataIndex: 'name',
        key: 'name',
        width: 250,
        render: (name: string, record: MetricThresholdResult) => (
          <MetricInfoColumn name={name} record={record} />
        ),
      },
      {
        title: '阈值配置',
        dataIndex: 'thresholds',
        key: 'thresholds',
        width: 350,
        render: (thresholds: MetricThresholdResult['thresholds']) => (
          <ThresholdConfigColumn thresholds={thresholds} />
        ),
      },
      {
        title: '标签',
        dataIndex: 'labels',
        key: 'labels',
        width: 200,
        render: (labels: MetricThresholdResult['labels']) => (
          <LabelsColumn labels={labels} />
        ),
      },
      getStatusColumn(),
      {
        title: '操作',
        key: 'actions',
        width: 120,
        fixed: 'right' as const,
        render: (_: unknown, record: MetricThresholdResult) => {
          return (
            <ActionsColumn
              record={record}
              onViewTimeSeries={onViewTimeSeries}
            />
          );
        },
      },
    ];
  }, [onViewTimeSeries]);
};
