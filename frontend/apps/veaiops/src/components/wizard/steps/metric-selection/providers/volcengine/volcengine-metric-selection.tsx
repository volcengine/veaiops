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
 * Volcengine metric selection component
 * @description Specifically handles metric selection for Volcengine data sources
 * @author AI Assistant
 * @date 2025-01-16
 */

import type React from 'react';
import styles from '../../../../datasource-wizard.module.less';
import { MetricSearch } from '../../../shared';
import type { VolcengineMetricSelectionProps } from '../../../shared';
import { EmptyState } from './empty-state';
import { LoadingState } from './loading-state';
import { VolcengineMetricList } from './metric-list';
import { SelectionAlert } from './selection-alert';
import { StepHeader } from './step-header';
import { useVolcengineMetricSelection } from './use-volcengine-metric-selection';

export const VolcengineMetricSelection: React.FC<
  VolcengineMetricSelectionProps
> = ({
  metrics,
  selectedMetric,
  loading,
  searchText,
  onSearchChange,
  actions,
}) => {
  // Use custom hook to handle business logic
  const { handleMetricSelect } = useVolcengineMetricSelection(actions);

  if (loading) {
    return <LoadingState />;
  }

  if (metrics.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={styles.stepContent}>
      <StepHeader />

      {/* Search box */}
      <MetricSearch searchText={searchText} onSearchChange={onSearchChange} />

      {/* Metric list */}
      <VolcengineMetricList
        metrics={metrics}
        selectedMetric={selectedMetric}
        searchText={searchText}
        onMetricSelect={handleMetricSelect}
      />

      <SelectionAlert selectedMetric={selectedMetric} />
    </div>
  );
};

export default VolcengineMetricSelection;
