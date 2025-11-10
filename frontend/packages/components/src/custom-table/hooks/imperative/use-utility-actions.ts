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
 * CustomTable utility operations Hook
 * Responsible for handling export, scroll, validation, reset and other operations
 *
 * @date 2025-12-19
 */
import type {
  BaseQuery,
  BaseRecord,
  PluginContext,
  PluginManager,
  PluginPerformanceMetrics,
  RequestManager,
} from '@/custom-table/types';

/**
 * Reset options interface
 */
export interface ResetOptions {
  /** Whether to reset data */
  resetData?: boolean;
  /** Whether to reset query parameters */
  resetQuery?: boolean;
  /** Whether to reset filter conditions */
  resetFilters?: boolean;
  /** Whether to reset selection state */
  resetSelection?: boolean;
  /** Whether to reset expanded state */
  resetExpandedRows?: boolean;
}

/**
 * Utility operation related instance methods
 */
export interface UtilityActionMethods<RecordType extends BaseRecord> {
  /** Export data */
  exportData: (format?: 'excel' | 'csv' | 'json') => RecordType[];
  /** Scroll to top */
  scrollToTop: () => void;
  /** Scroll to bottom */
  scrollToBottom: () => void;
  /** Scroll to specified row */
  scrollToRow: (index: number) => void;
  /** Validate table state */
  validate: () => Promise<boolean>;
  /** Reset table state */
  reset: (options?: ResetOptions) => void;
  /** Get table instance */
  getTableInstance: () => unknown;
  /** Get plugin manager */
  getPluginManager: () => PluginManager;
  /** Get performance metrics */
  getPerformanceMetrics: () => PluginPerformanceMetrics;
}

/**
 * Create utility operation methods
 * Based on pro-components utility function design pattern
 */
export const createUtilityActions = <
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(
  context: PluginContext<RecordType, QueryType>,
  formattedTableData: RecordType[],
  pluginManager: PluginManager,
  getRequestManager: () => RequestManager,
): UtilityActionMethods<RecordType> => ({
  /** Export data */
  exportData: (format: 'excel' | 'csv' | 'json' = 'excel'): RecordType[] => {
    const dataToExport = formattedTableData;

    if (format === 'json') {
      // JSON format export
      const jsonStr = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `table-data-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      // CSV format export - simple implementation
      if (dataToExport.length > 0) {
        const headers = Object.keys(dataToExport[0] as Record<string, unknown>);
        const csvContent = [
          headers.join(','),
          ...dataToExport.map((row) =>
            headers
              .map((header) =>
                JSON.stringify((row as Record<string, unknown>)[header] || ''),
              )
              .join(','),
          ),
        ].join('\n');

        const blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `table-data-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } else {
      // Excel format export - basic export using HTML table method
      if (dataToExport.length === 0) {
        // Data is empty, skip export

        return dataToExport;
      }

      const headers = Object.keys(dataToExport[0] as Record<string, unknown>);
      const htmlTable = [
        '<table>',
        '<thead><tr>',
        ...headers.map((header) => `<th>${header}</th>`),
        '</tr></thead>',
        '<tbody>',
        ...dataToExport.map(
          (row) =>
            `<tr>${headers
              .map((header) => {
                const value = (row as Record<string, unknown>)[header];
                let displayValue = '';
                if (value == null) {
                  displayValue = '';
                } else if (typeof value === 'object') {
                  displayValue = JSON.stringify(value);
                } else {
                  displayValue = String(value);
                }
                return `<td>${displayValue}</td>`;
              })
              .join('')}</tr>`,
        ),
        '</tbody>',
        '</table>',
      ].join('');

      const blob = new Blob([htmlTable], {
        type: 'application/vnd.ms-excel',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `table-data-${Date.now()}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    return dataToExport;
  },

  /** Scroll to top */
  scrollToTop: () => {
    const tableElement = document.querySelector('.arco-table-body');
    if (tableElement) {
      tableElement.scrollTop = 0;
    }
  },

  /** Scroll to bottom */
  scrollToBottom: () => {
    const tableElement = document.querySelector('.arco-table-body');
    if (tableElement) {
      tableElement.scrollTop = tableElement.scrollHeight;
    }
  },

  /** Scroll to specific row */
  scrollToRow: (index: number) => {
    const rowElement = document.querySelector(`[data-row-key="${index}"]`);
    if (rowElement) {
      rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  /** Validate table state */
  validate: async (): Promise<boolean> => {
    // Based on pro-components validation design
    try {
      // Check if there are ongoing requests
      const requestManager = getRequestManager();
      if (requestManager.currentController && !requestManager.isAborted()) {
        return false;
      }

      // Check data integrity
      if (!formattedTableData || formattedTableData.length === 0) {
        return false;
      }

      // Check plugin state
      if (!pluginManager || pluginManager.getAllPlugins().length === 0) {
        return false;
      }

      return true;
    } catch (error) {
      // Plugin state check failed, return false (silent handling)
      return false;
    }
  },

  /** Reset table state */
  reset: (options: ResetOptions = {}) => {
    const {
      resetData = true,
      resetQuery = true,
      resetFilters = true,
      resetSelection = true,
      resetExpandedRows = true,
    } = options;

    // Cancel ongoing requests
    getRequestManager().abort();

    // Reset data
    if (resetData && context.helpers.reset) {
      context.helpers.reset();
    }

    // Reset query parameters
    if (resetQuery && context.helpers.setQuery) {
      context.helpers.setQuery({} as QueryType);
    }

    // Reset filter conditions
    if (resetFilters && context.helpers.setFilters) {
      context.helpers.setFilters({});
    }

    // Reset selection state
    if (resetSelection && context.helpers.setSelectedRowKeys) {
      context.helpers.setSelectedRowKeys([]);
    }

    // Reset expanded state
    if (resetExpandedRows && context.helpers.setExpandedRowKeys) {
      context.helpers.setExpandedRowKeys([]);
    }
  },

  /** Get table instance */
  getTableInstance: () => null, // Return actual Arco Table instance

  /** Get plugin manager */
  getPluginManager: () => pluginManager,

  /** Get performance metrics */
  getPerformanceMetrics: () => pluginManager.getMetrics(),
});
