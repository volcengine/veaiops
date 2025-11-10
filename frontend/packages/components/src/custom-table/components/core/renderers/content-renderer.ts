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
/**
 * CustomTable content renderer functions
 */
import React from 'react';

/**
 * Create table content renderer
 */
export const createTableContentRenderer = (
  props: {
    customRender?: {
      table?: (table: React.ReactNode) => React.ReactNode;
      [key: string]: unknown;
    };
    customComponentRender?: (props: {
      table: React.ReactNode;
    }) => React.ReactNode;
  },
  tableComponent: React.ReactNode,
) => {
  // Apply custom table rendering
  if (props.customRender?.table) {
    return props.customRender.table(tableComponent);
  }

  // Apply traditional custom component rendering
  if (props.customComponentRender) {
    return props.customComponentRender({ table: tableComponent });
  }

  return tableComponent;
};

/**
 * Create footer content renderer
 */
export const createFooterContentRenderer = (
  props: {
    customRender?: {
      footer?: (props: Record<string, unknown>) => React.ReactNode;
      [key: string]: unknown;
    };
    customFooter?:
      | React.ReactNode
      | ((props: {
          hasMoreData: boolean;
          needContinue?: boolean;
          onLoadMore: () => void;
        }) => React.ReactNode);
    dataSource?: {
      hasMoreData?: boolean;
      needContinue?: boolean;
      scrollFetchData?: boolean;
    };
  },
  handleLoadMore: () => void,
  pluginManager: {
    render: (params: {
      pluginName: string;
      renderer: string;
      args?: unknown[];
    }) => React.ReactNode;
  },
  context: Record<string, unknown>,
) => {
  const { customRender, customFooter, dataSource } = props;

  // Custom footer rendering
  if (customRender?.footer) {
    return React.createElement(
      'div',
      { className: 'flex my-1' },
      customRender.footer({
        hasMoreData: dataSource?.hasMoreData || false,
        needContinue: dataSource?.needContinue,
        onLoadMore: handleLoadMore,
      }),
    );
  }

  // Traditional custom footer
  if (customFooter) {
    return React.createElement(
      'div',
      { className: 'flex my-1' },
      typeof customFooter === 'function'
        ? customFooter({
            hasMoreData: dataSource?.hasMoreData || false,
            needContinue: dataSource?.needContinue,
            onLoadMore: handleLoadMore,
          })
        : customFooter,
    );
  }

  // Default load more button
  if (dataSource?.scrollFetchData && dataSource?.hasMoreData) {
    return React.createElement(
      'div',
      { className: 'flex my-1' },
      pluginManager.render({
        pluginName: PluginNames.DATA_SOURCE,
        renderer: RendererNames.LOAD_MORE_BUTTON,
        args: [
          {
            ...context,
            helpers: {
              ...(context.helpers || {}),
              loadMoreData: handleLoadMore,
            },
          },
        ],
      }),
    );
  }

  return null;
};
