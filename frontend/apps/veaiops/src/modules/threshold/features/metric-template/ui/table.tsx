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

import { CustomTable } from '@veaiops/components';
import { logger, queryNumberFormat } from '@veaiops/utils';
import type { MetricTemplate } from 'api-generate';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { useMetricTemplateTableConfig } from '../hooks/use-table-config';

const queryFormat = {
  metricType: queryNumberFormat,
};
/**
 * Metric template table component props interface
 */
interface MetricTemplateTableProps {
  onEdit: (template: MetricTemplate) => Promise<boolean>;
  onDelete: (templateId: string) => Promise<boolean>;
  onCreate: () => Promise<boolean>;
  onRefreshReady?: (refresh: () => Promise<boolean>) => void;
}

/**
 * Metric template table component
 * Encapsulates table rendering logic, provides clear interface
 */
export const MetricTemplateTable: React.FC<MetricTemplateTableProps> = ({
  onEdit,
  onDelete,
  onCreate,
  onRefreshReady,
}) => {
  // CustomTable ref used to call refresh method
  const tableRef = useRef<any>(null);

  // Table configuration - cohesive action button configuration
  const { customTableProps, handleColumns, handleFilters, actionButtons } =
    useMetricTemplateTableConfig({
      onEdit,
      onDelete,
      onCreate,
    });

  // Expose refresh method to parent component
  useEffect(() => {
    if (onRefreshReady && tableRef.current?.refresh) {
      // Wrap CustomTable's refresh method
      const wrappedRefresh = async () => {
        logger.debug({
          message: '刷新方法被调用',
          data: {},
          source: 'MetricTemplateTable',
          component: 'wrappedRefresh',
        });
        await tableRef.current.refresh();
        logger.debug({
          message: '刷新完成',
          data: {},
          source: 'MetricTemplateTable',
          component: 'wrappedRefresh',
        });
        return true;
      };
      onRefreshReady(wrappedRefresh);
      logger.debug({
        message: '刷新方法已注册到父组件',
        data: {},
        source: 'MetricTemplateTable',
        component: 'useEffect',
      });
    }
  }, [onRefreshReady]);

  return (
    <CustomTable<MetricTemplate>
      ref={tableRef}
      title="指标模板管理"
      handleColumns={handleColumns}
      handleFilters={handleFilters}
      syncQueryOnSearchParams
      useActiveKeyHook
      actions={actionButtons}
      queryFormat={queryFormat}
      tableClassName="metric-template-table"
      {...customTableProps}
    />
  );
};
