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

import { useDeepCompareEffect } from 'ahooks';
import { isEmpty } from 'lodash-es';
import { useEffect, useMemo, useRef } from 'react';
import { logger } from '../logger';
import type { DataFetcherPluginImpl } from '../plugins/data-fetcher';
import type {
  EnumOptionConfigs,
  SelectOption,
  VeArchSelectBlockProps,
} from '../types/interface';
import type { PluginContext, SelectBlockState } from '../types/plugin';
import { getFrontEnumsOptions } from '../util';

// Define DataFetcher interface with internal context access
interface DataFetcherWithContext {
  context: PluginContext;
}

/**
 * Options processing Hook
 * Responsible for option calculation, merging, filtering and final value processing
 */
export function useOptionsProcessing(
  props: VeArchSelectBlockProps,
  currentState: SelectBlockState,
  dataFetcher: DataFetcherPluginImpl | undefined,
) {
  const {
    options: initialOptions = [],
    enumOptionConfig = { key: '' } as EnumOptionConfigs,
    defaultValue,
    value,
    dependency,
    defaultActiveFirstOption = false,
    mode,
    dataSource,
    dataSourceShare = false,
    isFirstHint = false,
    canFetch = true,
    isCascadeRemoteSearch = true,
    isValueEmptyTriggerOptions = true,
    searchKey,
    remoteSearchKey,
    multiSearchKeys = [],
    handleOptions = ({ options }: { options: SelectOption[] }) => options,
    onOptionsChange,
  } = props;

  // Reference to track previous value
  const prevValueRef = useRef(value);

  // Get frontend enum options
  const { options: enumOptions } = getFrontEnumsOptions(
    enumOptionConfig?.key
      ? enumOptionConfig
      : { ...enumOptionConfig, key: enumOptionConfig.key || '' },
  );

  // Determine if should fetch options based on defaultValue
  const shouldFetchOptionsWithDefaultValue = useMemo(
    () =>
      Boolean(
        isCascadeRemoteSearch &&
          (searchKey || remoteSearchKey) &&
          (isValueEmptyTriggerOptions ? true : !isEmpty(value)),
      ),
    [
      isCascadeRemoteSearch,
      isValueEmptyTriggerOptions,
      remoteSearchKey,
      searchKey,
      value,
    ],
  );

  // Determine if can fetch data
  const _canFetch = useMemo(() => {
    const result = (() => {
      if (!canFetch) {
        return false;
      }
      if (searchKey || remoteSearchKey || multiSearchKeys?.length > 0) {
        return shouldFetchOptionsWithDefaultValue;
      }
      return true;
    })();

    // 🔧 Add _canFetch calculation logging
    logger.debug(
      'UseOptionsProcessing',
      '_canFetch calculation',
      {
        result,
        canFetch,
        hasSearchKey: Boolean(searchKey),
        hasRemoteSearchKey: Boolean(remoteSearchKey),
        multiSearchKeysLength: multiSearchKeys?.length || 0,
        shouldFetchOptionsWithDefaultValue,
        hasDataSource: Boolean(dataSource),
        dataSourceType: typeof dataSource,
        dataSourceApi:
          typeof dataSource === 'object' &&
          dataSource !== null &&
          'api' in dataSource
            ? (dataSource as any).api
            : undefined,
      },
      'useMemo_canFetch',
    );

    return result;
  }, [
    searchKey,
    remoteSearchKey,
    multiSearchKeys,
    canFetch,
    shouldFetchOptionsWithDefaultValue,
    dataSource,
  ]);

  // Calculate whether value changes from having value to empty state
  const shouldFetchDueToValueEmpty = useMemo(() => {
    const prevValueEmpty = isEmpty(prevValueRef.current);
    const currentValueEmpty = isEmpty(value);
    // Only trigger refetch when value changes from having value to empty, and other conditions are met
    return (
      !prevValueEmpty &&
      currentValueEmpty &&
      _canFetch &&
      Boolean(dataSource) &&
      !currentState?.searchValue
    );
  }, [value, _canFetch, dataSource, currentState?.searchValue]);

  // Update prevValueRef
  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);

  // Side effect for automatically fetching options
  useEffect(() => {
    // ... Logic for fetching options will be here
  }, [shouldFetchOptionsWithDefaultValue]);

  // Calculate final options
  const finalOptions: Array<SelectOption> = useMemo(() => {
    if (
      isEmpty(enumOptionConfig) &&
      isEmpty(initialOptions) &&
      !_canFetch &&
      !currentState?.searchValue
    ) {
      return [];
    }
    if (initialOptions?.length > 0) {
      return handleOptions({
        options: initialOptions as SelectOption[],
        value,
      });
    }
    if (dataSource) {
      return handleOptions({
        options: currentState?.fetchOptions || [],
        value,
      });
    }
    return handleOptions({ options: enumOptions, value });
  }, [
    enumOptionConfig,
    initialOptions,
    _canFetch,
    dataSource,
    handleOptions,
    enumOptions,
    value,
    // 🔧 Fix infinite loop: Use specific values instead of entire object
    JSON.stringify(currentState?.fetchOptions),
    currentState?.searchValue,
    currentState?.stateVersion,
  ]);

  // Type guard function
  const isValidSelectValue = (
    val: unknown,
  ): val is string | number | boolean | string[] | number[] | boolean[] => {
    if (
      typeof val === 'string' ||
      typeof val === 'number' ||
      typeof val === 'boolean'
    ) {
      return true;
    }
    if (Array.isArray(val)) {
      return val.every(
        (item) =>
          typeof item === 'string' ||
          typeof item === 'number' ||
          typeof item === 'boolean',
      );
    }
    return false;
  };

  // 🔧 Type-compatible value conversion function: Intelligent conversion based on actual type of options
  const convertToSelectValue = (
    val: unknown,
  ):
    | string
    | number
    | boolean
    | string[]
    | number[]
    | boolean[]
    | undefined => {
    if (val === null || val === undefined) {
      return undefined;
    }

    if (isValidSelectValue(val)) {
      return val;
    }

    // Get first option's value type as reference
    const firstOptionValueType =
      finalOptions?.length > 0 ? typeof finalOptions[0].value : 'string';

    // If not valid value, try conversion
    if (Array.isArray(val)) {
      const validItems = val.filter(
        (item) =>
          typeof item === 'string' ||
          typeof item === 'number' ||
          typeof item === 'boolean',
      );

      if (validItems.length === 0) {
        return undefined;
      }

      // 🔧 Determine conversion direction based on options type, ensure array type consistency
      if (firstOptionValueType === 'number') {
        // If options value is number, convert value to number array
        const converted = validItems.map((item) => {
          const numValue = Number(item);
          return Number.isNaN(numValue) ? 0 : numValue; // Use 0 as default when conversion fails
        });
        return converted;
      }
      if (firstOptionValueType === 'boolean') {
        // If options value is boolean, convert value to boolean array
        const converted = validItems.map((item) => Boolean(item));
        return converted;
      }
      // If options value is string, convert value to string array
      const converted = validItems.map((item) => String(item));
      return converted;
    }

    // For other types, only process string, number and boolean, object types return undefined
    if (typeof val === 'string' || typeof val === 'number') {
      // 🔧 Determine conversion direction based on options type
      if (firstOptionValueType === 'number') {
        const numValue = Number(val);
        return Number.isNaN(numValue) ? String(val) : numValue;
      }
      return String(val);
    }

    // 🔧 Boolean type directly return, no conversion
    if (typeof val === 'boolean') {
      return val;
    }

    // Object types don't stringify, return undefined
    return undefined;
  };

  // Calculate final default value
  const finalDefaultValue = useMemo(():
    | string
    | number
    | boolean
    | string[]
    | number[]
    | boolean[]
    | undefined => {
    if (defaultValue !== undefined) {
      return convertToSelectValue(defaultValue);
    }

    if (defaultActiveFirstOption) {
      const defaultActiveValue = finalOptions?.find(
        (option) => !option?.disabled,
      )?.value;

      if (mode === 'multiple') {
        // 🔧 Return homogeneous array based on options type
        if (defaultActiveValue !== undefined) {
          if (typeof defaultActiveValue === 'number') {
            return [defaultActiveValue] as number[];
          }
          if (typeof defaultActiveValue === 'boolean') {
            return [defaultActiveValue] as boolean[];
          }
          return [String(defaultActiveValue)] as string[];
        }
        return [];
      }
      return defaultActiveValue;
    }

    return undefined;
  }, [defaultValue, defaultActiveFirstOption, finalOptions, mode]);

  // Calculate final value
  const finalValue = useMemo(():
    | string
    | number
    | boolean
    | string[]
    | number[]
    | boolean[]
    | undefined => {
    const converted = convertToSelectValue(value);

    logger.info(
      'UseOptionsProcessing',
      '🔍 finalValue calculation',
      {
        inputValue: value,
        inputValueType: typeof value,
        convertedValue: converted,
        convertedValueType: typeof converted,
        valueChanged: prevValueRef.current !== value,
        prevValue: prevValueRef.current,
        finalOptionsLength: finalOptions?.length || 0,
        placeholder: (props as any).placeholder,
        addBefore: (props as any).addBefore,
        timestamp: new Date().toISOString(),
      },
      'useMemo_finalValue',
    );

    return converted;
  }, [value, finalOptions]); // 🔧 Add finalOptions dependency to ensure recalculation when options type changes

  // Initial options side effect
  useDeepCompareEffect(() => {
    if (!initialOptions) {
      return;
    }
    // Original logic: Set fetchOptions through context, but context is private
    // Use type assertion and unknown intermediate type to safely access internal context
    if (dataFetcher && 'context' in dataFetcher) {
      const dataFetcherWithContext =
        dataFetcher as unknown as DataFetcherWithContext;
      if (dataFetcherWithContext.context) {
        dataFetcherWithContext.context.setState({
          fetchOptions: initialOptions as SelectOption[],
        });
      }
    }
  }, [initialOptions, dataFetcher]);

  // Options change callback
  useDeepCompareEffect(() => {
    onOptionsChange?.(finalOptions);
  }, [finalOptions, onOptionsChange]);

  return {
    finalOptions,
    finalDefaultValue,
    finalValue,
    shouldFetchOptionsWithDefaultValue,
    shouldFetchDueToValueEmpty,
    _canFetch,
    dataSource,
    dataSourceShare,
    isFirstHint,
    dependency,
  };
}
