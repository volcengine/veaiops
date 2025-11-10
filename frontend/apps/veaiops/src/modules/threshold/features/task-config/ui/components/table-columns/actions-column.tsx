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

import type { MetricThresholdResult } from 'api-generate';
import type React from 'react';

/**
 * Actions column render component
 */
export const ActionsColumn: React.FC<{
  record: MetricThresholdResult;
  onViewTimeSeries?: (record: MetricThresholdResult) => void;
}> = ({ record, onViewTimeSeries }) => {
  return (
    <Button
      type="text"
      size="small"
      data-testid="view-time-series-btn"
      onClick={() => {
        if (onViewTimeSeries) {
          try {
            onViewTimeSeries(record);
          } catch (error) {
            // Silent handling: viewing timeseries chart failure does not affect other operations
          }
        } else {
          // TODO: Implement view timeseries chart functionality
        }
      }}
    >
      查看时序图
    </Button>
  );
};
