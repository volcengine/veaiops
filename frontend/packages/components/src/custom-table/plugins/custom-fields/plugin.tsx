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

import { PluginNames } from '@/custom-table/constants/enum';
import type {
  BaseQuery,
  BaseRecord,
  PluginContext,
  PluginFactory,
} from '@/custom-table/types';
import { PluginPriorityEnum } from '@/custom-table/types/core/enums';
import { devLog } from '@/custom-table/utils/log-utils';
/**
 * Custom Fields Plugin
 *
 * Provides column selection and count display functionality
 */
import React from 'react';
import { CustomFieldsWithCount } from './components';
import { DEFAULT_CUSTOM_FIELDS_CONFIG } from './config';
import type { CustomFieldsConfig } from './types';

export const CustomFieldsPlugin: PluginFactory<CustomFieldsConfig> = (
  config: CustomFieldsConfig = {},
) => {
  const finalConfig = { ...DEFAULT_CUSTOM_FIELDS_CONFIG, ...config };

  return {
    name: PluginNames.CUSTOM_FIELDS,
    version: '1.0.0',
    description:
      'Custom Fields Plugin - Supports column selection and count display',
    priority: finalConfig.priority || PluginPriorityEnum.MEDIUM,
    enabled: finalConfig.enabled !== false,
    dependencies: [],
    conflicts: [],

    install(_context: PluginContext<BaseRecord, BaseQuery>) {
      devLog.log({
        component: 'CustomFields Plugin',
        message: 'Installing plugin',
      });
    },

    setup(context: PluginContext<BaseRecord, BaseQuery>) {
      const {
        props: { baseColumns },
      } = context;

      // Set plugin state
      Object.assign(context.state, {
        enableCustomFields: finalConfig.enableCustomFields,
        customFieldsProps: finalConfig.customFieldsProps,
        baseColumns: baseColumns || [],
      });

      devLog.log({
        component: 'CustomFields Plugin',
        message: 'Plugin setup completed',
        data: {
          enableCustomFields: context.state.enableCustomFields,
          columnsCount: baseColumns?.length || 0,
        },
      });
    },

    update(_context: PluginContext) {
      // Operations when configuration or data is updated
    },

    uninstall(_context: PluginContext) {
      devLog.log({
        component: 'CustomFields Plugin',
        message: 'Uninstalling plugin',
      });
    },

    // Render methods
    render: {
      // Render custom fields component
      customFields(context: PluginContext) {
        const {
          state: { enableCustomFields, customFieldsProps, baseColumns },
        } = context;

        if (!enableCustomFields) {
          return null;
        }

        const props = {
          disabledFields: new Map(),
          columns: baseColumns || [],
          value: [],
          confirm: (value: string[]) => {
            // Confirm custom fields value
          },
          ...customFieldsProps,
        };

        // If custom render function exists, use custom render
        if (finalConfig.customRender) {
          return finalConfig.customRender(props);
        }

        // Otherwise use default component with count
        return (
          <CustomFieldsWithCount key="custom-fields-with-count" {...props} />
        );
      },
    },

    // Plugin hooks
    hooks: {
      onFieldsChange: (...args: unknown[]) => {
        const [fields] = args as [string[]];
        devLog.log({
          component: 'CustomFields Plugin',
          message: 'Fields changed',
          data: { fields },
        });
      },
    },
  };
};
