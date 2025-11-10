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

import { Form } from '@arco-design/web-react';
import { useCallback, useEffect, useMemo } from 'react';
import {
  type FilterPluginContext,
  filterPluginRegistry,
  initializeCorePlugins,
} from '../plugins';
import { defaultFilterStyle } from './constants';
import { renderSingleField } from './renderer';
import type { FieldItem, FilterStyle } from './types';
import { createPluginContext, isFieldVisible, mergeFilterStyle } from './utils';

/**
 * Hook for initializing plugin system
 * @returns - Plugin system state
 */
export const usePluginSystem = () => {
  // Initialize plugin system (only on first render)
  const pluginSystemStats = useMemo(() => {
    return initializeCorePlugins();
  }, []);

  return {
    pluginSystemStats,
    registry: filterPluginRegistry,
  };
};

/**
 * Hook for filter form
 * @param query - Query object
 * @returns - Form instance and related methods
 */
export const useFilterForm = (query: Record<string, unknown>) => {
  const [form] = Form.useForm();

  // Update form values when query object changes
  useEffect(() => {
    form.setFieldsValue(query);
  }, [form, query]);

  return {
    form,
    setFieldsValue: form.setFieldsValue,
    getFieldsValue: form.getFieldsValue,
    resetFields: form.resetFields,
  };
};

/**
 * Hook for plugin context
 * @param form - Form instance
 * @param filterStyle - Filter style
 * @returns - Plugin context
 */
export const usePluginContext = (
  form: unknown,
  filterStyle?: Partial<FilterStyle>,
): FilterPluginContext => {
  return useMemo(() => {
    const finalStyle = mergeFilterStyle(defaultFilterStyle, filterStyle);
    return createPluginContext(
      form,
      finalStyle,
      filterPluginRegistry.getEventBus(),
    );
  }, [form, filterStyle]);
};

/**
 * Hook for field rendering
 * @param context - Plugin context
 * @returns - Field rendering function
 */
export const useFieldRenderer = (context: FilterPluginContext) => {
  return useCallback(
    (field: FieldItem) => {
      if (!isFieldVisible(field)) {
        return null;
      }

      return renderSingleField(field, context, field.field);
    },
    [context],
  );
};

/**
 * Hook for filter style
 * @param filterStyle - Custom style
 * @returns - Final style configuration
 */
export const useFilterStyle = (filterStyle?: Partial<FilterStyle>) => {
  return useMemo(() => {
    return mergeFilterStyle(defaultFilterStyle, filterStyle);
  }, [filterStyle]);
};

/**
 * Hook for filter configuration
 * @param config - Field configuration array
 * @returns - Processed configuration and statistics
 */
export const useFilterConfig = (config: FieldItem[] = []) => {
  const configStats = useMemo(() => {
    const visibleFields = config.filter(isFieldVisible);
    const hiddenFields = config.filter((field) => !isFieldVisible(field));

    const typeCount = config.reduce(
      (acc, field) => {
        if (field.type) {
          acc[field.type] = (acc[field.type] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total: config.length,
      visible: visibleFields.length,
      hidden: hiddenFields.length,
      typeCount,
      types: Object.keys(typeCount),
    };
  }, [config]);

  return {
    config,
    configStats,
    hasFields: config.length > 0,
    hasVisibleFields: configStats.visible > 0,
  };
};

/**
 * Hook for resetting filter
 * @param resetFilterValues - Reset callback function
 * @param config - Field configuration
 * @returns - Reset related methods
 */
export const useFilterReset = (
  resetFilterValues?: (props: { resetEmptyData?: boolean }) => void,
  config: FieldItem[] = [],
) => {
  const handleReset = useCallback(() => {
    if (resetFilterValues) {
      resetFilterValues({});
    }
  }, [resetFilterValues]);

  const canReset = useMemo(() => {
    return Boolean(resetFilterValues && config.length > 0);
  }, [resetFilterValues, config.length]);

  return {
    handleReset,
    canReset,
  };
};
