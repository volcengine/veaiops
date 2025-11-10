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

import type { PluginContext, PluginManager } from '@/custom-table/types';
import type { ColumnProps } from '@arco-design/web-react/es/Table/interface';
import { logger } from '@veaiops/utils';
import { getProcessedColumns } from './table-renderer.builders';
import type { BaseQuery, BaseRecord } from './table-renderer.types';

export interface ProcessColumnsParams<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  pluginManager: PluginManager;
  context: PluginContext<RecordType, QueryType>;
  baseColumns: ColumnProps<RecordType>[];
}

export function processColumns<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>({
  pluginManager,
  context,
  baseColumns,
}: ProcessColumnsParams<RecordType, QueryType>): ColumnProps<RecordType>[] {
  try {
    const processedColumns = getProcessedColumns<RecordType, QueryType>({
      pluginManager,
      context,
      baseColumns,
    });
    logger.debug({
      message: '[createTableRenderer] getProcessedColumns succeeded',
      data: {
        processedColumnsCount: Array.isArray(processedColumns)
          ? processedColumns.length
          : 0,
      },
      source: 'CustomTable',
      component: 'createTableRenderer',
    });
    return processedColumns;
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: '[createTableRenderer] getProcessedColumns failed',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
        baseColumnsCount: Array.isArray(baseColumns) ? baseColumns.length : 0,
      },
      source: 'CustomTable',
      component: 'createTableRenderer/getProcessedColumns',
    });
    return Array.isArray(baseColumns) ? baseColumns : [];
  }
}
