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

import { Message } from '@arco-design/web-react';
import { logger } from '@veaiops/utils';
import type {
  IntelligentThresholdTask,
  MetricThresholdResult,
} from 'api-generate';
import type {
  ProcessMetricLabelsParams,
  TimeRangeValidationResult,
  ValidateInputsParams,
  ValidateTimeRangeParams,
} from '../types';

/**
 * Validate input parameters
 */
export const validateInputs = ({
  metric,
  task,
}: ValidateInputsParams): boolean => {
  if (!metric || !task) {
    // ✅ Correct: use logger to record warning
    logger.warn({
      message: 'fetchTimeseriesData: metric or task is missing',
      data: { hasMetric: Boolean(metric), hasTask: Boolean(task) },
      source: 'useTimeseriesData',
      component: 'validateInputs',
    });
    return false;
  }
  return true;
};

/**
 * Validate time range
 */
export const validateTimeRange = ({
  timeRange,
}: ValidateTimeRangeParams): TimeRangeValidationResult | null => {
  if (!timeRange || timeRange.length !== 2) {
    Message.error('时间范围无效');
    return null;
  }

  const [startDate, endDate] = timeRange;

  if (
    !startDate ||
    !endDate ||
    !(startDate instanceof Date) ||
    !(endDate instanceof Date)
  ) {
    Message.error('时间范围格式无效');
    return null;
  }

  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    Message.error('时间范围包含无效日期');
    return null;
  }

  if (startTime >= endTime) {
    Message.error('开始时间必须早于结束时间');
    return null;
  }

  // Boundary check: time range should not be too large (e.g., exceed 90 days)
  const MAX_TIME_RANGE_MS = 90 * 24 * 60 * 60 * 1000; // 90 days
  if (endTime - startTime > MAX_TIME_RANGE_MS) {
    Message.warning('时间范围过大，可能导致数据加载缓慢');
  }

  return { startTime, endTime };
};

/**
 * Process metric labels
 * MetricThresholdResult.labels is already Record<string, string> type
 */
export const processMetricLabels = ({
  metric,
}: ProcessMetricLabelsParams): Array<Record<string, string>> | undefined => {
  if (!metric || !metric.labels) {
    return undefined;
  }
  // MetricThresholdResult.labels is already Record<string, string>, return directly
  return [metric.labels];
};
