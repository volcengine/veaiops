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

import type { TableDataSource } from '@veaiops/types';
import {
  createServerPaginationDataSource,
  createStandardTableProps,
} from '@veaiops/utils';
import type { MetricTemplate } from 'api-generate';
import { useMemo } from 'react';
import { createMetricTemplateTableRequestWrapper } from '../lib/metric-template-request';

/**
 * Metric template table configuration Hook
 * Provides table data source and property configuration
 */
export const useMetricTemplateTableConfig = ({
  handleEdit: _handleEdit,
  handleDelete: _handleDelete,
}: {
  handleEdit: (template: MetricTemplate) => void;
  handleDelete: (templateId: string) => Promise<boolean>;
}): {
  dataSource: TableDataSource<MetricTemplate, MetricTemplate>;
  tableProps: Record<string, any>;
} => {
  const request = useMemo(() => createMetricTemplateTableRequestWrapper(), []);

  // 🎯 Use utility function to create data source
  const dataSource = useMemo(
    () => createServerPaginationDataSource({ request }),
    [request],
  );

  // 🎯 Use utility function to create table properties
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: '_id',
        pageSize: 10,
        scrollX: 2800,
      }),
    [],
  );

  return {
    dataSource,
    tableProps,
  };
};
