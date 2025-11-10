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

import { TableAlert } from '@/custom-table/components/table-alert';
import { PluginNames } from '@/custom-table/constants/enum';
import type {
  PluginContext,
  PluginFactory,
  TableAlertConfig,
} from '@/custom-table/types';
import type { TableAlertProps } from '@/custom-table/types/components/table-alert';
import { devLog } from '@/custom-table/utils/log-utils';
/**
 * Table alert message plugin
 */
import type React from 'react';
import { DEFAULT_TABLE_ALERT_CONFIG } from './config';

type ExtendedPluginContext = PluginContext & {
  props: {
    isAlertShow?: boolean;
    customAlertNode?: React.ReactNode;
    alertType?: 'info' | 'warning' | 'error';
    alertContent?: React.ReactNode;
  };
  state: {
    isAlertShow?: boolean;
    alertType?: 'info' | 'warning' | 'error';
    alertContent?: React.ReactNode;
    customAlertNode?: React.ReactNode;
    [key: string]: unknown;
  };
};

export const TableAlertPlugin: PluginFactory<TableAlertConfig> = (
  config: TableAlertConfig = {},
) => {
  const finalConfig = { ...DEFAULT_TABLE_ALERT_CONFIG, ...config };

  return {
    name: PluginNames.TABLE_ALERT,
    version: '1.0.0',
    description: 'Table alert message plugin',
    priority: finalConfig.priority || 'medium',
    enabled: finalConfig.enabled !== false,
    config: finalConfig,
    dependencies: [],
    conflicts: [],

    install(_context: PluginContext): void {
      // Operations during installation
    },

    setup(context: PluginContext): void {
      // Initialize alert message processing
      const extContext = context as ExtendedPluginContext;
      const { props } = extContext;
      const {
        isAlertShow = false,
        customAlertNode,
        alertType = 'info',
        alertContent,
      } = props;

      // 🐛 Table Alert Plugin setup debug log
      devLog.log({
        component: 'TableAlertPlugin',
        message: 'Setup phase debug',
        data: {
          // 1. Values received from props
          receivedProps: {
            isAlertShow,
            customAlertNode,
            alertType,
            alertContent,
            hasAlertContent: Boolean(alertContent),
          },
          // 2. Complete props object
          fullProps: props,
          // 3. Alert-related key props
          alertRelatedProps: {
            isAlertShow: props.isAlertShow,
            alertType: props.alertType,
            alertContent: props.alertContent,
            customAlertNode: props.customAlertNode,
          },
        },
      });

      // Plugin setup logic - do not call Hooks, only configure
      // Hook calls have been moved to component level
      // Directly use values from props to set state
      Object.assign(context.state, {
        isAlertShow,
        alertType,
        alertContent,
        customAlertNode,
      });

      // 🐛 Debug log after state setup
      devLog.log({
        component: 'TableAlertPlugin',
        message: 'State setup completed',
        data: {
          contextState: context.state,
          alertState: {
            isAlertShow: context.state.isAlertShow,
            alertType: context.state.alertType,
            alertContent: context.state.alertContent,
            customAlertNode: context.state.customAlertNode,
          },
        },
      });

      // Add alert-related methods to context
      Object.assign(context.helpers, {
        showAlert: (
          content: React.ReactNode,
          type: 'info' | 'warning' | 'error' = 'info',
        ) => {
          // Implementation based on Arco Design Message component for alert display
          Object.assign(context.state, {
            isAlertShow: true,
            alertContent: content,
            alertType: type,
          });
        },
        hideAlert: () => {
          Object.assign(context.state, {
            isAlertShow: false,
            alertContent: null,
          });
        },
      });
    },

    // Renderer - 🐛 Use TableAlert component, fix props passing issue
    render: {
      alert: (...args: unknown[]): React.ReactNode => {
        const context = args[0] as PluginContext;
        const extContext = context as ExtendedPluginContext;
        const { state, props } = extContext;

        // 🐛 Fix: Get alert data from two places, prioritize props
        const isAlertShow = props.isAlertShow ?? state.isAlertShow;
        const alertType = props.alertType ?? state.alertType;
        const alertContent = props.alertContent ?? state.alertContent;
        const customAlertNode = props.customAlertNode ?? state.customAlertNode;

        // Detailed debug log, check data sources
        devLog.log({
          component: 'TableAlertPlugin',
          message: 'Alert render detailed debug',
          data: {
            // 1. Data from props
            propsData: {
              isAlertShow: props.isAlertShow,
              alertType: props.alertType,
              alertContent: props.alertContent,
              customAlertNode: props.customAlertNode,
            },
            // 2. Data from state
            stateData: {
              isAlertShow: state.isAlertShow,
              alertType: state.alertType,
              alertContent: state.alertContent,
              customAlertNode: state.customAlertNode,
            },
            // 3. Final data used
            finalData: {
              isAlertShow,
              alertType,
              alertContent: Boolean(alertContent),
              customAlertNode: Boolean(customAlertNode),
            },
            // 4. Render decision
            willRender: Boolean(isAlertShow) && Boolean(alertContent),
          },
        });

        // Prioritize rendering custom node
        if (customAlertNode) {
          devLog.log({
            component: 'TableAlertPlugin',
            message: 'Returning custom alert node',
          });
          return customAlertNode;
        }

        // If there's no content to display, return null directly
        if (!isAlertShow || !alertContent) {
          return null;
        }

        const alertProps: TableAlertProps = {
          show: isAlertShow,
          type: alertType || 'info',
          content: alertContent,
        };

        devLog.log({
          component: 'TableAlertPlugin',
          message: '🚨 Creating TableAlert component:',
          data: {
            alertProps,
          },
        });

        // ✅ Directly use TableAlert component, removed ConfigProvider wrapper
        return <TableAlert {...alertProps} />;
      },
    },

    // Lifecycle methods
    beforeMount(_context: PluginContext): void {
      // Handle before component mount
    },

    afterMount(_context: PluginContext): void {
      // Handle after component mount
    },

    beforeUpdate(_context: PluginContext): void {
      // Handle before component update
    },

    afterUpdate(_context: PluginContext): void {
      // Handle after component update
    },

    beforeUnmount(_context: PluginContext): void {
      // Handle before component unmount
    },

    uninstall(_context: PluginContext): void {
      // Cleanup operations during plugin uninstallation
    },
  } as ReturnType<PluginFactory<TableAlertConfig>>;
};
