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
import type { PluginContext, PluginFactory } from '@/custom-table/types';
import { PluginPriorityEnum } from '@/custom-table/types/core/enums';
import { devLog } from '@/custom-table/utils/log-utils';
import { Button } from '@arco-design/web-react';
import { IconSettings } from '@arco-design/web-react/icon';
/**
 * Custom Filter Setting Plugin
 *
 * Provides drag-and-drop sorting and configuration saving functionality for filters
 */
import React from 'react';
import { DraggableFilterSetting } from './components';
import { DEFAULT_FILTER_SETTING_CONFIG } from './config';
import type { CustomFilterSettingConfig } from './types';

export const CustomFilterSettingPlugin: PluginFactory<
  CustomFilterSettingConfig
> = (config: CustomFilterSettingConfig = {}) => {
  const finalConfig = { ...DEFAULT_FILTER_SETTING_CONFIG, ...config };

  return {
    name: PluginNames.CUSTOM_FILTER_SETTING,
    version: '1.0.0',
    description:
      'Custom Filter Setting Plugin - Supports drag-and-drop sorting and configuration saving',
    priority: finalConfig.priority || PluginPriorityEnum.MEDIUM,
    enabled: finalConfig.enabled !== false,
    dependencies: [],
    conflicts: [],

    install(_context: PluginContext) {
      devLog.log({
        component: 'CustomFilterSetting Plugin',
        message: 'Installing plugin',
      });
    },

    setup(context: PluginContext) {
      const {
        props: { baseColumns },
      } = context;

      // Set plugin state
      Object.assign(context.state, {
        enableFilterSetting: finalConfig.enableFilterSetting,
        filterSettingProps: finalConfig.filterSettingProps,
      });

      devLog.log({
        component: 'CustomFilterSetting Plugin',
        message: 'Plugin setup completed',
        data: {
          enableFilterSetting: context.state.enableFilterSetting,
        },
      });
    },

    update(_context: PluginContext) {
      // Operations when configuration or data is updated
    },

    uninstall(_context: PluginContext) {
      devLog.log({
        component: 'CustomFilterSetting Plugin',
        message: 'Uninstalling plugin',
      });
    },

    // Render methods
    render: {
      // Render filter setting component
      filterSetting(context: PluginContext) {
        const {
          state: { enableFilterSetting, filterSettingProps },
        } = context;

        if (!enableFilterSetting) {
          return null;
        }

        const props = {
          title: 'Search Item Settings',
          mode: ['select'] as Array<'select' | 'fixed'>,
          caseSelectText: (key: string) => key,
          saveFun: (settings: {
            fixed_fields: string[];
            selected_fields: string[];
            hidden_fields: string[];
          }) => {
            // Save filter settings
          },
          ...filterSettingProps,
        };

        // If custom render function exists, use custom render
        if (finalConfig.customRender) {
          return finalConfig.customRender(props);
        }

        // Otherwise use default draggable component
        return (
          <DraggableFilterSetting key="custom-filter-setting" {...props}>
            <Button type="text" size="mini">
              <IconSettings />
              Filter Settings
            </Button>
          </DraggableFilterSetting>
        );
      },
    },

    // Plugin hooks
    hooks: {
      onFilterSettingChange: (...args: unknown[]) => {
        const [settings] = args as [
          {
            fixed_fields: string[];
            selected_fields: string[];
            hidden_fields: string[];
          },
        ];
        devLog.log({
          component: 'CustomFilterSetting Plugin',
          message: 'Filter settings changed',
          data: {
            settings,
          },
        });
      },
    },
  };
};
