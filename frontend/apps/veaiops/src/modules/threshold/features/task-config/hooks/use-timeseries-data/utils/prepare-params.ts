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
import type {
  IntelligentThresholdTask,
  MetricThresholdResult,
} from 'api-generate';
import type { RequestParams } from '../types';
import {
  processMetricLabels,
  validateInputs,
  validateTimeRange,
} from './validators';

/**
 * Validate and prepare request parameters
 */
export const prepareRequestParams = ({
  metric,
  task,
  timeRange,
}: {
  metric?: MetricThresholdResult;
  task?: IntelligentThresholdTask;
  timeRange: [Date, Date];
}): RequestParams | null => {
  // Validate input parameters
  if (!validateInputs({ metric, task })) {
    return null;
  }

  // Validate time range
  const timeValidation = validateTimeRange({ timeRange });
  if (!timeValidation) {
    return null;
  }

  const { startTime, endTime } = timeValidation;

  // Boundary check: task must exist
  if (!task) {
    Message.error('任务信息无效');
    return null;
  }

  // Boundary check: datasource type must be string
  const datasourceType = task.datasource_type;
  if (!datasourceType || typeof datasourceType !== 'string') {
    Message.error('数据源类型无效');
    return null;
  }

  const datasourceTypeNormalized = datasourceType.toLowerCase();
  const datasourceId = task.datasource_id;

  // Boundary check: datasource ID must exist
  if (!datasourceId || typeof datasourceId !== 'string') {
    Message.error('数据源ID无效');
    return null;
  }

  // Process metric labels
  const instances = processMetricLabels({ metric });

  return {
    startTime,
    endTime,
    datasourceTypeNormalized,
    datasourceId,
    instances,
  };
};
