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

import { devLog } from '@/custom-table/utils/log-utils';
import React from 'react';

export interface UseTableStateMonitorParams {
  formattedTableData: any[];
  loading: boolean;
  tableTotal: number;
  current: number;
  pageSize: number;
  sorter: any;
  filters: any;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  AlertComponent?: React.ReactNode;
}

export function useTableStateMonitor({
  formattedTableData,
  loading,
  tableTotal,
  current,
  pageSize,
  sorter,
  filters,
  title,
  actions,
  AlertComponent,
}: UseTableStateMonitorParams): void {
  React.useEffect(() => {
    const dataLength = formattedTableData?.length;
    devLog.info({
      component: 'DataState',
      message: 'Table data state updated',
      data: {
        dataLength,
        loading,
        total: tableTotal,
        current,
        pageSize,
        hasSorter: Boolean(sorter),
        hasFilters: Boolean(
          filters && Object.keys(filters as Record<string, unknown>).length > 0,
        ),
        filtersCount: filters
          ? Object.keys(filters as Record<string, unknown>).length
          : 0,
      },
    });
  }, [
    formattedTableData,
    loading,
    tableTotal,
    current,
    pageSize,
    sorter,
    filters,
  ]);

  const renderStart = React.useRef<number>();
  React.useEffect(() => {
    renderStart.current = Date.now();
    return () => {
      if (renderStart.current) {
        const duration = Date.now() - renderStart.current;
        devLog.performance({
          component: 'MainContent',
          operation: 'Main content render',
          duration,
          data: {
            hasTitle: Boolean(title),
            hasActions: Boolean(actions),
            hasAlert: Boolean(AlertComponent),
          },
        });
      }
    };
  });
}
