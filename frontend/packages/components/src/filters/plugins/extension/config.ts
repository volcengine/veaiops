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
  FilterPluginHooks,
  FilterPluginRenderProps,
  PluginConfig,
} from '@veaiops/types';
import { pluginExtensionManager } from './manager';

// Export extension manager
export { pluginExtensionManager };

/**
 * Predefined plugin global configurations
 */
export const PLUGIN_GLOBAL_CONFIGS: Record<string, PluginConfig> = {
  // Common configuration for input components
  Input: {
    allowClear: true,
    placeholder: '请输入...',
    size: 'default',
  },

  InputNumber: {
    allowClear: true,
    placeholder: '请输入数字...',
    precision: 0,
    size: 'default',
  },

  InputTag: {
    allowClear: true,
    placeholder: '请输入标签...',
    size: 'default',
  },

  // Common configuration for select components
  Select: {
    allowClear: true,
    placeholder: '请选择',
    size: 'default',
    filterOption: true,
  },

  Cascader: {
    allowClear: true,
    placeholder: '请选择',
    size: 'default',
    expandTrigger: 'click',
  },

  TreeSelect: {
    allowClear: true,
    placeholder: '请选择',
    size: 'default',
    treeDefaultExpandAll: false,
  },

  // Common configuration for date components
  DatePicker: {
    allowClear: true,
    placeholder: '请选择日期...',
    size: 'default',
  },

  RangePicker: {
    allowClear: true,
    placeholder: ['开始日期', '结束日期'],
    size: 'default',
  },

  // Special component configuration
  XByteTreeSelector: {
    allowClear: true,
    placeholder: '请选择服务...',
    size: 'default',
  },
};

/**
 * Predefined plugin hooks
 */
export const PLUGIN_HOOKS: Record<string, FilterPluginHooks> = {
  // Common log hook
  _global: {
    beforeRender: (props: any) => {
      return props;
    },
    afterRender: (element: any, props: any) => {
      return element;
    },
    validateConfig: (config: any) => {
      if (!config || typeof config !== 'object') {
        return '配置必须是一个对象';
      }
      return true;
    },
  },

  // Input component specific hook
  Input: {
    beforeRender: (props: FilterPluginRenderProps) => {
      // Add additional style class for Input component
      return {
        ...props,
        hijackedProps: {
          ...props.hijackedProps,
          className: `${
            typeof props.hijackedProps.className === 'string'
              ? props.hijackedProps.className
              : ''
          } filter-input-enhanced`.trim(),
        },
      };
    },
  },

  // Select component specific hook
  Select: {
    beforeRender: (props: FilterPluginRenderProps) => {
      // Add search functionality enhancement for Select component
      return {
        ...props,
        hijackedProps: {
          ...props.hijackedProps,
          showSearch: props.hijackedProps.showSearch !== false, // Enable search by default
          filterOption: (input: string, option: unknown) => {
            const optionLabel = (option as { label?: string })?.label || '';
            return optionLabel.toLowerCase().includes(input.toLowerCase());
          },
        },
      };
    },
  },

  // Date component hook
  DatePicker: {
    beforeRender: (props: FilterPluginRenderProps) => {
      // Add date formatting, use time format if showTime is enabled
      const hasShowTime = props.hijackedProps?.showTime;
      const defaultFormat = hasShowTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';

      return {
        ...props,
        hijackedProps: {
          ...props.hijackedProps,
          format: props.hijackedProps.format || defaultFormat,
        },
      };
    },
  },

  RangePicker: {
    beforeRender: (props: FilterPluginRenderProps) => {
      // Add date range formatting, use time format if showTime is enabled
      const hasShowTime = props.hijackedProps?.showTime;
      const defaultFormat = hasShowTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';

      return {
        ...props,
        hijackedProps: {
          ...props.hijackedProps,
          format: props.hijackedProps.format || defaultFormat,
        },
      };
    },
  },
};

/**
 * Initialize plugin extension configuration
 */
export const initializePluginExtensions = (): void => {
  // Set global configuration
  Object.entries(PLUGIN_GLOBAL_CONFIGS).forEach(([pluginType, config]) => {
    pluginExtensionManager.setGlobalConfig({ pluginType, config });
  });

  // Register hooks
  Object.entries(PLUGIN_HOOKS).forEach(([pluginType, hooks]) => {
    pluginExtensionManager.registerHooks({ pluginType, hooks });
  });
};

/**
 * Helper function to get plugin configuration
 */
export const getPluginConfig = (
  pluginType: string,
  instanceConfig: PluginConfig = {},
): PluginConfig => {
  return pluginExtensionManager.mergeConfig(pluginType, instanceConfig);
};

/**
 * Add custom plugin configuration
 */
export const addCustomPluginConfig = (
  pluginType: string,
  config: PluginConfig,
): void => {
  pluginExtensionManager.setGlobalConfig({
    pluginType,
    config: {
      ...pluginExtensionManager.getGlobalConfig(pluginType),
      ...config,
    },
  });
};

/**
 * Add custom plugin hooks
 */
export const addCustomPluginHooks = (
  pluginType: string,
  hooks: FilterPluginHooks,
): void => {
  const existingHooks = pluginExtensionManager.getHooks(pluginType) || {};
  pluginExtensionManager.registerHooks({
    pluginType,
    hooks: {
      ...existingHooks,
      ...hooks,
    },
  });
};
