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
 * Zabbix metric list component
 * @description Displays a list of all available Zabbix metrics
 */

import { Empty, Radio, Space } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import type { ZabbixTemplateMetric } from 'api-generate';
import type React from 'react';
import styles from '../../../../datasource-wizard.module.less';
import { ZabbixMetricListItem } from './metric-list-item';

interface ZabbixMetricListProps {
  metrics: ZabbixTemplateMetric[];
  selectedMetric: ZabbixTemplateMetric | null;
  searchText: string;
  onMetricSelect: (metric: ZabbixTemplateMetric) => void;
}

export const ZabbixMetricList: React.FC<ZabbixMetricListProps> = ({
  metrics,
  selectedMetric,
  searchText,
  onMetricSelect,
}) => {
  const filteredMetrics = metrics.filter(
    (metric) =>
      metric.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      metric.metric_name?.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className={styles.selectionList}>
      <Radio.Group value={selectedMetric?.metric_name || null}>
        <Space direction="vertical" size="medium" style={{ width: '100%' }}>
          {filteredMetrics.map((metric) => {
            const isSelected =
              selectedMetric?.metric_name === metric.metric_name;
            return (
              <ZabbixMetricListItem
                key={metric.metric_name}
                metric={metric}
                isSelected={isSelected}
                onMetricSelect={onMetricSelect}
              />
            );
          })}
        </Space>
      </Radio.Group>

      {filteredMetrics.length === 0 && searchText && (
        <Empty
          icon={<IconSearch />}
          description={`未找到包含 "${searchText}" 的指标`}
        />
      )}
    </div>
  );
};
