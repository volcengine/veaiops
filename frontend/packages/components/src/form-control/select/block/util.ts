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

import { safeJSONParse } from '@veaiops/utils';
import {
  camelCase,
  isEmpty,
  isNull,
  isObject,
  isUndefined,
  isNaN as lodashIsNaN,
  mapValues,
  omitBy,
} from 'lodash-es';
import type { ReactElement } from 'react';
import { sessionStore } from './cache-store';
import { logger } from './logger';
import type {
  DataSourceSetter,
  EnumOptionConfigs,
  Option,
  OptionfyProps,
  OptionsEntity,
  StandardEnum,
} from './types/interface';

/**
 * Default dropdown filter
 * @param inputValue
 * @param option
 */
export const defaultFilterOption = (
  inputValue: string,
  option: ReactElement,
) => {
  const lowerCaseValue = inputValue?.toLowerCase();
  return (
    option?.props?.children
      ?.toString()
      ?.toLowerCase()
      ?.includes(lowerCaseValue) ||
    option?.props?.value?.toString()?.toLowerCase()?.includes(lowerCaseValue)
  );
};

/**
 * Ensure input value is an array.
 * If value is undefined, return an empty array.
 * If value is not an array, return an array containing that value.
 * If value is already an array, return it directly.
 *
 * @param value - Input value that needs to be ensured as an array.
 * @returns An array representing the input value.
 */
export const ensureArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value as T];
};

export const getFrontEnumsByKey = ({
  enumCacheKey,
  key,
}: {
  key: string;
  enumCacheKey: string;
}): Array<StandardEnum> => {
  if (!key) {
    return [];
  }
  // Get frontend enum data from sessionStorage
  const frontEnums = sessionStore.get(enumCacheKey, {});
  if (!frontEnums) {
    return [];
  }
  // Get enum data source by key
  return ensureArray<StandardEnum>(frontEnums?.[key]);
};

/**
 * Filter array based on filter criteria object and return filtered array
 * @param data - Array to be filtered
 * @param filterCriteria - Filter criteria object
 * @returns Filtered array
 */
export const filterArrayByObjectCriteria = <T>({
  data,
  filterCriteria,
}: {
  data: T[];
  filterCriteria: Partial<T>;
}): T[] => {
  // Iterate through array to be filtered, match based on filter criteria
  const filteredArray = data.filter((item) => {
    // Check if current array element matches filter criteria
    for (const key in filterCriteria) {
      if (item[key] !== filterCriteria[key]) {
        return false; // If any condition doesn't match, return false, exclude from filtered array
      }
    }
    return true; // When all conditions match, return true, include in filtered array
  });

  return filteredArray; // Return filtered array
};

export const optionfy = <T>({
  dataSet,
  labelKey,
  valueKey,
  countKey,
  countKeyUnit,
  isStringItem = false,
  isJoin = false,
  valueRender,
  labelRender = ({ _label }: { record: T; _label: any }) => _label,
  disabledList = [],
  disabledCheckFunc = (_: any) => false,
  filters = {},
}: OptionfyProps<T>): Array<Option<T>> => {
  if (!dataSet || !Array.isArray(dataSet)) {
    return [];
  }
  if (isStringItem) {
    return dataSet.map((item) => ({
      label: item,
      value: item,
    })) as Array<Option<T>>;
  }
  const _renderLabel = ({ record }: { record: T }) => {
    if (isJoin) {
      return `${record?.[labelKey as keyof T]} (${record?.[valueKey as keyof T]})`;
    }
    if (countKey) {
      return `${record?.[labelKey as keyof T]} (Stock: ${
        record?.[countKey as keyof T]
      }${countKeyUnit})`;
    }
    return labelRender?.({ record, _label: record?.[labelKey as keyof T] });
  };

  let _dataSet = dataSet;

  if (!isEmpty(filters)) {
    _dataSet = filterArrayByObjectCriteria({
      data: dataSet,
      filterCriteria: filters,
    });
  }

  return _dataSet
    .map((item) => {
      const _value = item?.[valueKey as keyof T];
      const renderedValue = valueRender
        ? valueRender({ record: item, value: _value })
        : _value;
      return {
        label: _renderLabel({ record: item }),
        value: renderedValue,
        extra: item,
        disabled:
          disabledList.includes(renderedValue) ||
          disabledCheckFunc?.(renderedValue),
      };
    })
    .filter(
      (item) =>
        item.value !== undefined &&
        item.value !== null &&
        item.label !== undefined &&
        item.label !== null,
    );
};

/**
 * Check if a string can be converted to a number
 * @param str String to be checked
 * @return Returns true if string can be converted to number, otherwise false
 */
export const canConvertToNumber = (str: string | number | unknown): boolean => {
  if (!str) {
    return false;
  }
  const num = Number(str);
  return !lodashIsNaN(num);
};

/**
 * Convert enum data to option object array
 * @param enumData
 * @param isValueToNumber
 * @param isValueToBoolean
 */
const convertToOptionObject = (
  enumData: StandardEnum,
  isValueToNumber: boolean,
  isValueToBoolean: boolean,
) => {
  const { code, name, label, value, extend } = enumData;

  let parsedCode: any = code || value;
  if (isValueToBoolean) {
    parsedCode = (code || value) === 'true';
  } else if (
    isValueToNumber &&
    !isValueToBoolean &&
    canConvertToNumber(parsedCode)
  ) {
    parsedCode = Number(parsedCode);
  }

  return {
    code: parsedCode,
    name: name || label,
    extend: safeJSONParse({ valueString: extend, empty: {} }) as any,
  };
};

/**
 * Get frontend enum options list
 * @param enumCacheKey Enum cache key
 * @param key Enum key
 * @param filterCode Filter code (optional)
 * @param isStringItem
 * @param labelRender
 * @param disabledList
 * @param isValueToNumber
 * @param isValueToBoolean
 * @returns Options list object containing options array
 */
export const getFrontEnumsOptions = ({
  enumCacheKey,
  key,
  filterCode,
  isStringItem = false,
  labelRender,
  disabledList = [],
  isValueToNumber = false,
  isValueToBoolean = false,
}: EnumOptionConfigs): OptionsEntity => {
  // If enum key is empty, return empty options list object
  if (!key) {
    return {
      options: [],
    };
  }

  // Get frontend enum data from sessionStorage
  const enumDataSource = getFrontEnumsByKey({
    enumCacheKey: enumCacheKey || 'front_enums',
    key: camelCase(key),
  });

  // If unable to get frontend enum data or enum data for specified key doesn't exist, return empty options list object
  if (isEmpty(enumDataSource)) {
    return {
      options: [],
    };
  }

  // Convert enum data to option object array
  let _dataSet = enumDataSource.map((config: StandardEnum) =>
    convertToOptionObject(config, isValueToNumber, isValueToBoolean),
  );

  // If filter code is specified, filter enum data based on filter criteria
  if (filterCode) {
    _dataSet = _dataSet.filter((config) => config?.extend?.code === filterCode);
  }

  const _disabledList = disabledList;
  if (_dataSet) {
    // Merge disabled from config
    _disabledList.push(
      ..._dataSet
        .filter((item) => item.extend?.disabled)
        .map((item) => item?.code),
    );
  }

  // Call optionfy function to convert option object array to standard options array
  const options = optionfy({
    dataSet: _dataSet,
    labelKey: 'name',
    valueKey: 'code',
    labelRender,
    isStringItem,
    disabledList,
  });

  // Return options list object
  return { options };
};

/**
 * Type guard function to check if provided dataSource belongs to DataSourceSetter type.
 * @param dataSource Data source to check.
 * @returns A boolean indicating whether dataSource belongs to DataSourceSetter type.
 */
export const isDataSourceSetter: (
  dataSource: any,
) => dataSource is DataSourceSetter = (
  dataSource: any,
): dataSource is DataSourceSetter => {
  // Basic type check
  if (
    typeof dataSource !== 'object' ||
    !dataSource ||
    !('serviceInstance' in dataSource) ||
    !('api' in dataSource) ||
    !('responseEntityKey' in dataSource) ||
    !('optionCfg' in dataSource)
  ) {
    logger.debug(
      'Util',
      'isDataSourceSetter - basic check failed',
      {
        typeofDataSource: typeof dataSource,
        isNull: dataSource === null,
        hasServiceInstance: dataSource
          ? 'serviceInstance' in dataSource
          : false,
        hasApi: dataSource ? 'api' in dataSource : false,
        hasResponseEntityKey: dataSource
          ? 'responseEntityKey' in dataSource
          : false,
        hasOptionCfg: dataSource ? 'optionCfg' in dataSource : false,
      },
      'isDataSourceSetter',
    );
    return false;
  }

  // 🔧 Enhanced validation: Check if key property values are valid
  const { serviceInstance, api, responseEntityKey, optionCfg } = dataSource;

  // serviceInstance must be an object
  if (!serviceInstance || typeof serviceInstance !== 'object') {
    logger.warn(
      'Util',
      'isDataSourceSetter - serviceInstance invalid',
      {
        hasServiceInstance: Boolean(serviceInstance),
        serviceInstanceType: typeof serviceInstance,
      },
      'isDataSourceSetter',
    );
    return false;
  }

  // api must be a non-empty string and cannot contain undefined/null strings
  if (
    !api ||
    typeof api !== 'string' ||
    api.trim() === '' ||
    api.includes('undefined') ||
    api.includes('null')
  ) {
    logger.warn(
      'Util',
      'isDataSourceSetter - api invalid',
      {
        api,
        apiType: typeof api,
        apiTrimmed: typeof api === 'string' ? api.trim() : null,
        includesUndefined: typeof api === 'string' && api.includes('undefined'),
        includesNull: typeof api === 'string' && api.includes('null'),
      },
      'isDataSourceSetter',
    );
    return false;
  }

  // API method must exist in serviceInstance
  if (typeof serviceInstance[api] !== 'function') {
    logger.warn(
      'Util',
      'isDataSourceSetter - api method does not exist',
      {
        api,
        apiMethodType: typeof serviceInstance[api],
        serviceInstanceKeys: Object.keys(serviceInstance).slice(0, 10),
      },
      'isDataSourceSetter',
    );
    return false;
  }

  // responseEntityKey must be a non-empty string
  if (
    !responseEntityKey ||
    typeof responseEntityKey !== 'string' ||
    responseEntityKey.trim() === ''
  ) {
    logger.warn(
      'Util',
      'isDataSourceSetter - responseEntityKey invalid',
      {
        responseEntityKey,
        responseEntityKeyType: typeof responseEntityKey,
      },
      'isDataSourceSetter',
    );
    return false;
  }

  // optionCfg must be an object
  if (!optionCfg || typeof optionCfg !== 'object') {
    logger.warn(
      'Util',
      'isDataSourceSetter - optionCfg invalid',
      {
        hasOptionCfg: Boolean(optionCfg),
        optionCfgType: typeof optionCfg,
      },
      'isDataSourceSetter',
    );
    return false;
  }

  logger.debug(
    'Util',
    'isDataSourceSetter - validation passed',
    {
      api,
      responseEntityKey,
      optionCfgKeys: Object.keys(optionCfg),
    },
    'isDataSourceSetter',
  );

  return true;
};

/**
 * Remove undefined values from object
 * @param target Target object
 * @returns New object with undefined values removed
 */
export const removeUndefinedValues = (target: any): any => {
  // Check if it's an object
  if (!isObject(target)) {
    return target;
  }

  // Remove undefined values and generate new object
  const filteredObj = omitBy(target, isUndefined);

  // Recursively remove undefined values in nested objects

  return mapValues(filteredObj, (value) => {
    if (Array.isArray(value)) {
      // Filter undefined values in array
      return value.filter(
        (item) => !isUndefined(item) && !isNull(item) && !lodashIsNaN(item),
      );
    }
    // Recursively call function to remove undefined values
    return removeUndefinedValues(value);
  });
};

/**
 * Split pasted text content by separators
 * @param text Original pasted text
 * @param separators Separator array, defaults to newline, comma, semicolon, tab
 * @returns Split string array
 */
export const splitPastedText = (
  text: string,
  separators: string[] = ['\n', ',', ';', '\t'],
): string[] => {
  if (!text || !text.trim()) {
    return [];
  }

  // Build regex, handle special character escaping
  const escapedSeparators = separators.map((sep) => {
    switch (sep) {
      case '\n':
        return '\\n';
      case '\t':
        return '\\t';
      case '\r':
        return '\\r';
      default:
        // Escape regex special characters
        return sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  });

  // Create regex to match any separator
  const separatorRegex = new RegExp(`[${escapedSeparators.join('')}]+`, 'g');

  // Split text and process
  return text
    .split(separatorRegex)
    .map((val) => val.trim())
    .filter((val) => val.length > 0);
};
