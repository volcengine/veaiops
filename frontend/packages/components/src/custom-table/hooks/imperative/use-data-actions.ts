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

import type {
  BaseQuery,
  BaseRecord,
  PluginContext,
  RequestManager,
} from '@/custom-table/types';
/**
 * CustomTable data operations Hook
 * Responsible for handling data loading, refresh, cancellation and other operations
 *
 * @date 2025-12-19
 */
import { logger } from '@veaiops/utils';

/**
 * @name Data operation related instance methods
 */
export interface DataActionMethods<RecordType extends BaseRecord> {
  /** @name Reload data */
  reload: (resetPageIndex?: boolean) => Promise<void>;
  /** @name Refresh data (reset page index and clear selection) */
  refresh: () => Promise<void>;
  /** @name Cancel current ongoing request */
  cancel: () => void;
  /** @name Get current table data */
  getData: () => RecordType[];
  /** @name Get data source */
  getDataSource: () => RecordType[];
  /** @name Get formatted table data */
  getFormattedData: () => RecordType[];
  /** @name Set table data */
  setData: (data: RecordType[]) => void;
  /** @name Get filtered data */
  getFilteredData: () => RecordType[];
  /** @name Get selected data */
  getSelectedData: () => RecordType[];
}

/**
 * @name Create data operation methods
 * @description Based on pro-components ActionRef data operation design pattern
 */
export const createDataActions = <
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(
  context: PluginContext<RecordType, QueryType>,
  formattedTableData: RecordType[],
  getRequestManager: () => RequestManager,
): DataActionMethods<RecordType> => ({
  /** @name Reload data */
  reload: async (resetPageIndex?: boolean) => {
    // Cancel current ongoing request
    getRequestManager().abort();

    // If need to reset page index to first page
    if (resetPageIndex && context.helpers.setCurrent) {
      context.helpers.setCurrent(1);
    }

    // Trigger data reload
    if (context.helpers.run) {
      context.helpers.run();
    }
  },

  /** @name Refresh data (reset page index and clear selection) */
  refresh: async () => {
    logger.info({
      message: '[CustomTable.refresh] 🔄 refresh method called',
      data: {
        hasRun: Boolean(context.helpers.run),
        hasSetCurrent: Boolean(context.helpers.setCurrent),
        hasSetSelectedRowKeys: Boolean(context.helpers.setSelectedRowKeys),
      },
      source: 'CustomTable',
      component: 'DataActions.refresh',
    });

    // Cancel current request
    getRequestManager().abort();

    // Clear selection state
    if (context.helpers.setSelectedRowKeys) {
      logger.info({
        message: '[CustomTable.refresh] Clear selection state',
        data: {},
        source: 'CustomTable',
        component: 'DataActions.refresh',
      });
      context.helpers.setSelectedRowKeys([]);
    }

    // Reset to first page
    if (context.helpers.setCurrent) {
      logger.info({
        message: '[CustomTable.refresh] Reset to first page',
        data: {},
        source: 'CustomTable',
        component: 'DataActions.refresh',
      });
      context.helpers.setCurrent(1);
    }

    // Reload data
    if (context.helpers.run) {
      logger.info({
        message:
          '[CustomTable.refresh] 🚀 Call context.helpers.run() to reload data',
        data: {},
        source: 'CustomTable',
        component: 'DataActions.refresh',
      });
      context.helpers.run();
      logger.info({
        message:
          '[CustomTable.refresh] ✅ context.helpers.run() call completed',
        data: {},
        source: 'CustomTable',
        component: 'DataActions.refresh',
      });
    } else {
      logger.warn({
        message: '[CustomTable.refresh] ⚠️ context.helpers.run does not exist',
        data: {
          helpersKeys: Object.keys(context.helpers || {}),
        },
        source: 'CustomTable',
        component: 'DataActions.refresh',
      });
    }
  },

  /** @name Cancel current ongoing request */
  cancel: () => {
    const requestManager = getRequestManager();
    if (!requestManager.isAborted()) {
      requestManager.abort();
    }
  },

  /** @name Get current table data */
  getData: () => formattedTableData,

  /** @name Get data source */
  getDataSource: () => formattedTableData,

  /** @name Get formatted table data */
  getFormattedData: () => formattedTableData,

  /** @name Set table data */
  setData: (_data: RecordType[]) => {
    // Based on pro-components design, implement by resetting data source
    // Note: This should work with data source plugin to implement actual data update
    if (context.helpers.reset) {
      context.helpers.reset();
    }
  },

  /** @name Get filtered data */
  getFilteredData: () => formattedTableData,

  /** @name Get selected data */
  getSelectedData: () => {
    const { selectedRowKeys } = context.state;
    if (!selectedRowKeys || selectedRowKeys.length === 0) {
      return [];
    }
    // Filter corresponding data from data source based on selected keys
    return formattedTableData.filter((record) => {
      const key =
        typeof context.props.rowKey === 'function'
          ? context.props.rowKey(record)
          : (record as Record<string, unknown>)[context.props.rowKey || 'id'];
      return selectedRowKeys.includes(key as string | number);
    });
  },
});
