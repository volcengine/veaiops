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
import type { DataSourceConfig } from '@/custom-table/types/plugins/data-source';
import { Empty } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
/**
 * Data Source Plugin Implementation
 */
import type React from 'react';
import { DEFAULT_DATA_SOURCE_CONFIG } from './config';

/**
 * Data Source Plugin Factory Function
 */
export const DataSourcePlugin: PluginFactory<DataSourceConfig> = (
  config: Partial<DataSourceConfig> = {},
) => {
  const finalConfig: DataSourceConfig = {
    ...DEFAULT_DATA_SOURCE_CONFIG,
    ...config,
  };

  return {
    name: PluginNames.DATA_SOURCE,
    version: '1.0.0',
    description: 'Table data source management plugin',
    priority: finalConfig.priority || PluginPriorityEnum.HIGH,
    enabled: finalConfig.enabled !== false,
    dependencies: [],
    conflicts: [],
    config: finalConfig,

    install(_context: PluginContext) {
      // Operations during installation
    },

    setup(context: PluginContext) {
      // Plugin setup logic - don't call Hooks, only configure
      // Hook calls have been moved to useCustomTable
      // Store configuration in state instead of directly returning
      Object.assign(context.state, {
        hookConfig: {
          dataSource: context.props.dataSource,
          config: finalConfig,
        },
      });
    },

    update(_context: PluginContext) {
      // Operations when configuration or data is updated
    },

    uninstall(_context: PluginContext) {
      // Cleanup operations during uninstallation
    },

    // Data processing hooks
    hooks: {
      // Hook for loading data
      loadData(...args: unknown[]) {
        const context = args[0] as PluginContext;
        if (context.helpers.run) {
          context.helpers.run();
        }
      },

      // Hook for resetting data
      resetData(...args: unknown[]) {
        const context = args[0] as PluginContext;
        if (context.helpers.reset) {
          context.helpers.reset({ resetEmptyData: true });
        }
      },

      // Hook for loading more data
      loadMore(...args: unknown[]) {
        const context = args[0] as PluginContext;
        if (context.helpers.loadMoreData) {
          context.helpers.loadMoreData();
        }
      },
    },

    // Render methods - dynamically render content based on context
    render: {
      // Empty state renderer (aligned with RendererNames.EMPTY_STATE)
      emptyState(context: PluginContext) {
        const props = context.props as unknown as {
          noDataElement?: React.ReactNode;
        };
        // Priority: use externally provided noDataElement
        if (props.noDataElement) {
          return props.noDataElement;
        }
        return (
          <Empty
            description="No data available"
            style={{ padding: '40px 0' }}
          />
        );
      },

      // Error state renderer (aligned with RendererNames.ERROR_STATE)
      errorState(context: PluginContext) {
        const props = context.props as unknown as {
          noDataElement?: React.ReactNode;
        };
        if (props.noDataElement) {
          return props.noDataElement;
        }
        return (
          <Empty description="Request failed" style={{ padding: '40px 0' }} />
        );
      },
      footer(context: PluginContext) {
        const props = context.props as unknown as {
          dataSource?: {
            scrollFetchData?: boolean;
            hasMoreData?: boolean;
            needContinue?: boolean;
          };
          noDataElement?: React.ReactNode;
          customFooter?:
            | React.ReactNode
            | ((params: {
                hasMoreData?: boolean;
                needContinue?: boolean;
                loadMoreData?: () => void;
                onLoadMore?: () => void;
              }) => React.ReactNode);
        };
        const { dataSource } = props;
        const { loadMoreData } = context.helpers;

        // If there is an error, render error state
        if (context.state.error) {
          return (
            props.noDataElement || (
              <Empty
                description="Request failed"
                style={{ padding: '40px 0' }}
              />
            )
          );
        }

        // If need to load more, render load more button
        if (dataSource?.scrollFetchData && dataSource?.hasMoreData) {
          if (props.customFooter) {
            if (typeof props.customFooter === 'function') {
              return props.customFooter({
                hasMoreData: dataSource.hasMoreData,
                needContinue: dataSource.needContinue,
                onLoadMore:
                  loadMoreData ||
                  (() => {
                    // Load more data handler
                  }),
              });
            }
            return props.customFooter;
          }

          return (
            <div
              className="w-full text-center custom-table-footer"
              style={{ color: '#80838a' }}
              onClick={loadMoreData || undefined}
            >
              <IconSearch />
              {dataSource?.needContinue
                ? 'Continue searching for more data'
                : 'Load more'}
            </div>
          );
        }

        // Default: render empty data state
        return (
          props.noDataElement || (
            <Empty
              description="No data available"
              style={{ padding: '40px 0' }}
            />
          )
        );
      },

      // Load more button (aligned with RendererNames.LOAD_MORE_BUTTON)
      loadMoreButton(context: PluginContext) {
        const props = context.props as unknown as {
          dataSource?: {
            scrollFetchData?: boolean;
            hasMoreData?: boolean;
            needContinue?: boolean;
          };
        };
        const { dataSource } = props;
        const { loadMoreData } = context.helpers;
        if (!dataSource?.scrollFetchData || !dataSource?.hasMoreData) {
          return null;
        }
        return (
          <div
            className="w-full text-center custom-table-footer"
            style={{ color: '#80838a' }}
            onClick={loadMoreData || undefined}
          >
            <IconSearch />
            {dataSource?.needContinue
              ? 'Continue searching for more data'
              : 'Load more'}
          </div>
        );
      },
    },
  };
};
