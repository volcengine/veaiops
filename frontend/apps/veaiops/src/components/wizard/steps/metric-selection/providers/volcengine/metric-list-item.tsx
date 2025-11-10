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
 * Volcengine metric list item component
 * @description Display and interaction for a single Volcengine metric item
 */

import { Tag, Typography } from '@arco-design/web-react';
import { IconDashboard } from '@arco-design/web-react/icon';
import type React from 'react';
import { SelectableItem } from '../../../../components/selectable-item';
import type { VolcengineMetric } from '../../../../types';

const { Text } = Typography;

interface VolcengineMetricListItemProps {
  metric: VolcengineMetric;
  isSelected: boolean;
  onMetricSelect: (metric: VolcengineMetric) => void;
}

export const VolcengineMetricListItem: React.FC<
  VolcengineMetricListItemProps
> = ({ metric, isSelected, onMetricSelect }) => {
  const description = `命名空间: ${metric.namespace}${metric.subNamespace ? ` | 子命名空间: ${metric.subNamespace}` : ''}${metric.unit ? ` | 单位: ${metric.unit}` : ''}`;

  const extra = metric.dimensions && metric.dimensions.length > 0 && (
    <div style={{ marginTop: 4 }}>
      <Text type="secondary" style={{ fontSize: 12 }}>
        维度:{' '}
      </Text>
      {metric.dimensions.map((dim, index) => (
        <Tag key={index} size="small" style={{ marginRight: 4 }}>
          {dim.key}
        </Tag>
      ))}
    </div>
  );

  return (
    <SelectableItem
      selected={isSelected}
      onClick={() => onMetricSelect(metric)}
      icon={<IconDashboard />}
      title={metric.metricName}
      description={description}
      extra={extra}
      radioValue={metric.metricName}
    />
  );
};
