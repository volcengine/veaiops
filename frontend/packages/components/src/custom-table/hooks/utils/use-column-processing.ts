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
  BaseRecord,
  ColumnItem,
  ModernTableColumnProps,
} from '@/custom-table/types';
import type { CustomTableColumnProps } from '@/custom-table/types/components';
import { devLog } from '@/custom-table/utils/log-utils';
import { logger } from '@veaiops/utils';
import { useMemo } from 'react';

export const useColumnProcessing = <FormatRecordType extends BaseRecord>({
  handleColumns,
  handleColumnsProps,
  query,
}: {
  handleColumns?: (
    props: Record<string, unknown>,
  ) => ModernTableColumnProps<FormatRecordType>[];
  handleColumnsProps?: Record<string, unknown>;
  query: Record<string, unknown>;
}) => {
  const baseColumns = useMemo(() => {
    if (typeof handleColumns !== 'function') {
      devLog.warn({
        component: 'useColumnProcessing',
        message:
          'handleColumns is not a function, returning empty column array',
        data: {
          handleColumnsType: typeof handleColumns,
          handleColumnsValue: handleColumns,
        },
      });
      return [];
    }

    try {
      devLog.log({
        component: 'useColumnProcessing',
        message: 'Starting to call handleColumns',
        data: {
          hasHandleColumnsProps: Boolean(handleColumnsProps),
          handleColumnsPropsKeys: Object.keys(handleColumnsProps || {}),
          query,
          queryKeys: Object.keys(query || {}),
        },
      });

      const columns = handleColumns({
        ...handleColumnsProps,
        query,
      });

      devLog.log({
        component: 'useColumnProcessing',
        message: 'handleColumns called successfully',
        data: {
          columnsCount: Array.isArray(columns) ? columns.length : 0,
          columnsType: typeof columns,
          isArray: Array.isArray(columns),
        },
      });

      return columns;
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: 'handleColumns call failed',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
          handleColumnsType: typeof handleColumns,
          handleColumnsPropsKeys: Object.keys(handleColumnsProps || {}),
          query,
        },
        source: 'CustomTable',
        component: 'useColumnProcessing/handleColumns',
      });
      return [];
    }
  }, [handleColumns, handleColumnsProps, query]);

  const compatibleBaseColumns = useMemo(() => {
    try {
      if (!Array.isArray(baseColumns)) {
        devLog.warn({
          component: 'useColumnProcessing',
          message: 'baseColumns is not an array',
          data: {
            baseColumnsType: typeof baseColumns,
            baseColumnsValue: baseColumns,
          },
        });
        return [];
      }

      devLog.log({
        component: 'useColumnProcessing',
        message: 'Starting to convert baseColumns',
        data: {
          baseColumnsCount: baseColumns.length,
        },
      });

      const converted = baseColumns.map(
        (col: ModernTableColumnProps<FormatRecordType>, index: number) => {
          try {
            return {
              ...col,
              key: (() => {
                if (col.key) {
                  return String(col.key);
                }
                if (col.dataIndex) {
                  return String(col.dataIndex);
                }
                return `col-${index}-${Math.random()}`;
              })(),
            };
          } catch (colError: unknown) {
            const colErrorObj =
              colError instanceof Error
                ? colError
                : new Error(String(colError));
            logger.error({
              message: `Failed to convert column configuration (index ${index})`,
              data: {
                error: colErrorObj.message,
                stack: colErrorObj.stack,
                errorObj: colErrorObj,
                col,
                index,
              },
              source: 'CustomTable',
              component: 'useColumnProcessing/convertColumn',
            });
            return {
              key: `col-error-${index}`,
              title: `Column ${index}`,
              dataIndex: `col_${index}`,
            };
          }
        },
      ) as ColumnItem<FormatRecordType>[];

      devLog.log({
        component: 'useColumnProcessing',
        message: 'baseColumns conversion completed',
        data: {
          convertedCount: converted.length,
        },
      });

      return converted;
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: 'baseColumns conversion failed',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
          baseColumnsType: typeof baseColumns,
          isArray: Array.isArray(baseColumns),
          baseColumnsLength: Array.isArray(baseColumns)
            ? baseColumns.length
            : 0,
        },
        source: 'CustomTable',
        component: 'useColumnProcessing/convertBaseColumns',
      });
      return [];
    }
  }, [baseColumns]);

  const customTableColumns = useMemo(
    () =>
      compatibleBaseColumns.map((col) => ({
        ...col,
        title: col.title || '',
        dataIndex: col.dataIndex || col.key || '',
      })) as CustomTableColumnProps<FormatRecordType>[],
    [compatibleBaseColumns],
  );

  return {
    baseColumns,
    compatibleBaseColumns,
    customTableColumns,
  };
};
