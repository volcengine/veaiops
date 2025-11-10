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
 * Metric list item component
 * @description Display and interaction for a single metric item
 */

import { IconDashboard } from '@arco-design/web-react/icon';
import type React from 'react';
import { SelectableItem } from '../../../components/selectable-item';
import type { MetricListItemProps } from '../types';
import { GroupBySelector } from './group-by-selector';

export const MetricListItem: React.FC<MetricListItemProps> = ({
  metric,
  isSelected,
  selectedGroupBy,
  onMetricSelect,
  onGroupByChange,
}) => {
  return (
    <SelectableItem
      selected={isSelected}
      onClick={() => onMetricSelect(metric)}
      icon={<IconDashboard />}
      title={metric.metricName}
      description={`命名空间: ${metric.namespace}${metric.unit ? ` | 单位: ${metric.unit}` : ''}`}
      radioValue={metric.metricName}
    >
      {/* GroupBy dimension selection - only shown when selected and has dimensions */}
      {metric.dimensionKeys && metric.dimensionKeys.length > 0 && (
        <GroupBySelector
          dimensionKeys={metric.dimensionKeys}
          selectedGroupBy={selectedGroupBy}
          onGroupByChange={onGroupByChange}
        />
      )}
    </SelectableItem>
  );
};
