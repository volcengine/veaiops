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
 * Zabbix metric list item component
 * @description Display and interaction for a single Zabbix metric item
 */

import { IconDashboard } from '@arco-design/web-react/icon';
import type { ZabbixTemplateMetric } from 'api-generate';
import type React from 'react';
import { SelectableItem } from '../../../../components/selectable-item';

interface ZabbixMetricListItemProps {
  metric: ZabbixTemplateMetric;
  isSelected: boolean;
  onMetricSelect: (metric: ZabbixTemplateMetric) => void;
}

export const ZabbixMetricListItem: React.FC<ZabbixMetricListItemProps> = ({
  metric,
  isSelected,
  onMetricSelect,
}) => {
  const getMetricType = () => {
    if (metric.history === '0') {
      return 'Float';
    }
    if (metric.history === '3') {
      return 'Integer';
    }
    return metric.history;
  };

  const description = `Key: ${metric.metric_name} | 类型: ${getMetricType()}`;

  return (
    <SelectableItem
      selected={isSelected}
      onClick={() => {
        onMetricSelect(metric);
      }}
      icon={<IconDashboard />}
      title={metric.name}
      description={description}
      radioValue={metric.metric_name}
    />
  );
};
