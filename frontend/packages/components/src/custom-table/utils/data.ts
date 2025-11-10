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
 * CustomTable data processing utility functions
 */
import { isEmpty, isNil, omitBy } from 'lodash-es';

/**
 * Filter empty data
 */
export const filterEmptyDataByKeys = (
  obj: Record<string, unknown>,
): Record<string, unknown> => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  return omitBy(obj, isNil);
};

/**
 * Format table data
 */
export const formatTableData = <RecordType, FormatRecordType>({
  sourceData,
  addRowKey,
  arrayFields = [],
  formatDataConfig = {},
}: {
  sourceData: RecordType[];
  addRowKey?: boolean;
  arrayFields?: string[];
  formatDataConfig?: Record<string, unknown>;
}): FormatRecordType[] => {
  if (!Array.isArray(sourceData) || isEmpty(sourceData)) {
    return [] as FormatRecordType[];
  }

  const processingData = JSON.parse(JSON.stringify(sourceData));

  return processingData.map((item: Record<string, unknown>, index: number) => {
    // Add row key
    if (addRowKey && !item.key) {
      item.key = `${index}`;
    }

    // Process array fields
    if (arrayFields?.length) {
      arrayFields.forEach((field) => {
        if (item[field] && typeof item[field] === 'string') {
          try {
            item[field] = JSON.parse(item[field]);
          } catch (error) {
            // JSON parse failed, keep original (silent handling)
          }
        }
      });
    }

    // Apply custom format configuration
    if (!isEmpty(formatDataConfig)) {
      Object.keys(formatDataConfig).forEach((key) => {
        const formatFn = formatDataConfig[key];
        if (typeof formatFn === 'function') {
          item[key] = formatFn(item);
        }
      });
    }

    return item;
  }) as FormatRecordType[];
};

/**
 * Filter table data parameters interface
 */
export interface FilterTableDataParams<RecordType> {
  data: RecordType[];
  filters: Record<string, string[]>;
}

/**
 * Filter table data
 */
export const filterTableData = <RecordType>({
  data,
  filters,
}: FilterTableDataParams<RecordType>): RecordType[] => {
  if (!Array.isArray(data) || isEmpty(data) || isEmpty(filters)) {
    return data;
  }

  const filterEntries = Object.entries(filters).filter(
    ([, value]) => !isEmpty(value),
  );

  if (isEmpty(filterEntries)) {
    return data;
  }

  return data.filter((record) =>
    filterEntries.every(([key, value]) => {
      const recordValue = (record as Record<string, unknown>)[key];
      return Array.isArray(value)
        ? value.includes(String(recordValue))
        : recordValue === value;
    }),
  );
};
