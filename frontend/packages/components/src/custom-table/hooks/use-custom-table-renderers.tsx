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

import { PluginNames, RendererNames } from '@/custom-table/constants';
import type {
  BaseQuery,
  BaseRecord,
  PluginContext,
  PluginManager,
  TableDataSource,
} from '@/custom-table/types';
import { devLog } from '@/custom-table/utils/log-utils';
/**
 * CustomTable Renderer Hook
 * Responsible for handling rendering logic of various components
 *
 * @date 2025-12-19
 */
import React, { useMemo, useCallback } from 'react';

/**
 * @name Renderer methods collection
 */
export interface TableRenderers {
  /** @name No data element renderer */
  NoDataElement: React.ReactNode;
  /** @name Table filter component renderer */
  TableFilterComponent: React.ReactNode;
  /** @name Alert component renderer */
  AlertComponent: React.ReactNode;
  /** @name Table content renderer */
  renderTableContent: (tableComponent: React.ReactNode) => React.ReactNode;
  /** @name Footer content renderer */
  renderFooterContent: () => React.ReactNode;
}

/**
 * @name Create table renderer collection
 * @description Create various renderer methods based on plugin system
 */
const useCustomTableRenderers = <
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(
  context: PluginContext<RecordType, QueryType>,
  pluginManager: PluginManager,
  dataSource?: any,
  pluginsReady?: boolean, // New plugin ready state parameter
): TableRenderers => {
  const {
    state: { error },
    props: { customComponentRender, customFooter },
  } = context as any;

  // Component renderer - inline implementation
  const NoDataElement = useMemo(() => {
    try {
      let dataElement;
      if (error) {
        dataElement = pluginManager.render({
          pluginName: PluginNames.DATA_SOURCE,
          renderer: RendererNames.ERROR_STATE,
          args: [context],
        });
      } else {
        dataElement = pluginManager.render({
          pluginName: PluginNames.DATA_SOURCE,
          renderer: RendererNames.EMPTY_STATE,
          args: [context],
        });
      }

      // If render result is a valid React element, wrap in Fragment to avoid Context issues
      if (React.isValidElement(dataElement)) {
        return (
          <React.Fragment key="data-wrapper">{dataElement}</React.Fragment>
        );
      }

      return dataElement;
    } catch (error: unknown) {
      devLog.warn({
        component: 'useCustomTableRenderers',
        message: 'Failed to render TableDataComponent',
        data: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
      return null;
    }
  }, [pluginManager, context, error]);

  const TableFilterComponent = useMemo(() => {
    // Only render when plugins are ready
    if (!pluginsReady) {
      return null;
    }

    try {
      const filterComponent = pluginManager.render({
        pluginName: PluginNames.TABLE_FILTER,
        renderer: RendererNames.FILTER,
        args: [context],
      });

      // If render result is a valid React element, wrap in Fragment to avoid Context issues
      if (React.isValidElement(filterComponent)) {
        return (
          <React.Fragment key="filter-wrapper">
            {filterComponent}
          </React.Fragment>
        );
      }

      return filterComponent;
    } catch (error: unknown) {
      devLog.warn({
        component: 'useCustomTableRenderers',
        message: 'Failed to render TableFilterComponent',
        data: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
      return null;
    }
  }, [pluginManager, context, pluginsReady]);

  const AlertComponent = useMemo(() => {
    // Only render when plugins are ready
    if (!pluginsReady) {
      devLog.log({
        component: 'useCustomTableRenderers',
        message: '🚨 Plugin not ready, AlertComponent returns null',
      });
      return null;
    }

    try {
      devLog.log({
        component: 'useCustomTableRenderers',
        message: '🚨 Starting to render AlertComponent',
      });

      // Directly call plugin render method, add detailed debug information
      const alertComponent = pluginManager.render({
        pluginName: PluginNames.TABLE_ALERT,
        renderer: 'alert',
        args: [context],
      });

      devLog.log({
        component: 'useCustomTableRenderers',
        message: '🚨 AlertComponent render result:',
        data: {
          alertComponent,
          alertComponentType: typeof alertComponent,
          isValidElement: React.isValidElement(alertComponent),
          isReactElement: React.isValidElement(alertComponent),
          alertComponentKeys:
            alertComponent && typeof alertComponent === 'object'
              ? Object.keys(alertComponent)
              : 'N/A',
        },
      });

      return alertComponent;
    } catch (error: unknown) {
      devLog.warn({
        component: 'useCustomTableRenderers',
        message: 'Failed to render AlertComponent',
        data: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
      return null;
    }
  }, [pluginManager, context, pluginsReady]);

  const handleLoadMore = useCallback(() => {
    if (context.helpers.loadMoreData) {
      context.helpers.loadMoreData();
    }
  }, [context.helpers]);

  const renderTableContent = useCallback(
    (tableComponent: React.ReactNode) => {
      if (context.props.customRender?.table) {
        return context.props.customRender.table(tableComponent);
      }
      if (
        customComponentRender &&
        typeof customComponentRender === 'function'
      ) {
        return customComponentRender({ table: tableComponent });
      }
      return tableComponent;
    },
    [context.props.customRender, customComponentRender],
  );

  const renderFooterContent = useCallback(() => {
    if (context.props.customRender?.footer) {
      return (
        <div className="flex my-1">
          {context.props.customRender.footer({
            hasMoreData: dataSource?.hasMoreData || false,
            needContinue: dataSource?.needContinue,
            onLoadMore: handleLoadMore,
          })}
        </div>
      );
    }

    if (customFooter) {
      return (
        <div className="flex my-1">
          {typeof customFooter === 'function'
            ? customFooter({
                hasMoreData: dataSource?.hasMoreData || false,
                needContinue: dataSource?.needContinue,
                onLoadMore: handleLoadMore,
              })
            : customFooter}
        </div>
      );
    }

    if (dataSource?.scrollFetchData && dataSource?.hasMoreData) {
      try {
        const loadMoreButton = pluginManager.render({
          pluginName: PluginNames.DATA_SOURCE,
          renderer: RendererNames.LOAD_MORE_BUTTON,
          args: [
            {
              ...context,
              helpers: {
                ...context.helpers,
                loadMoreData: handleLoadMore,
              },
            },
          ],
        });

        return (
          <div className="flex my-1">
            {React.isValidElement(loadMoreButton) ? (
              <React.Fragment key="loadmore-wrapper">
                {loadMoreButton}
              </React.Fragment>
            ) : (
              loadMoreButton
            )}
          </div>
        );
      } catch (error: unknown) {
        devLog.warn({
          component: 'useCustomTableRenderers',
          message: 'Failed to render LoadMoreButton',
          data: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
        return null;
      }
    }

    return null;
  }, [context, customFooter, dataSource, handleLoadMore, pluginManager]);

  return {
    NoDataElement,
    TableFilterComponent,
    AlertComponent,
    renderTableContent,
    renderFooterContent,
  };
};

export { useCustomTableRenderers };
