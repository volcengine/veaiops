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

/**
 * Aliyun metric selection business logic Hook
 * @description Handles core business logic for metric selection
 */

import { useCallback } from 'react';
import type { AliyunMetric, WizardActions } from '../../../../types';

export const useAliyunMetricSelection = (actions: WizardActions) => {
  // Handle metric selection, automatically set all dimensions as selected (default select all)
  const handleMetricSelect = useCallback(
    (metric: AliyunMetric) => {
      actions.setSelectedAliyunMetric(metric);
      // Default select all dimensions
      if (metric.dimensionKeys && metric.dimensionKeys.length > 0) {
        actions.setSelectedGroupBy(metric.dimensionKeys);
      } else {
        actions.setSelectedGroupBy([]);
      }
    },
    [actions],
  );

  return {
    handleMetricSelect,
  };
};
