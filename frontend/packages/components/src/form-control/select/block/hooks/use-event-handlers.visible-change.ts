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

import { isEmpty } from 'lodash-es';
import { logger } from '../logger';
import type { EventHandlersContext } from './use-event-handlers.types';

function extractDataSourceApi(dataSource: unknown): string | undefined {
  if (dataSource && typeof dataSource === 'object' && 'api' in dataSource) {
    return (dataSource as { api?: string }).api;
  }
  return undefined;
}

function checkDataSourceChanged(
  currentApi: string | undefined,
  lastApi: string | undefined,
): boolean {
  return Boolean(currentApi && (!lastApi || lastApi !== currentApi));
}

function handleEmptyOptions(
  context: EventHandlersContext,
  visible: boolean,
): void {
  const { currentState, _canFetch, _fetchOptions, logger } = context;

  if (visible && isEmpty(currentState?.fetchOptions) && _canFetch) {
    logger.info(
      'UseEventHandlers',
      'Dropdown opened - options empty, preparing to fetch data',
      {
        fetchOptionsEmpty: isEmpty(currentState?.fetchOptions),
        _canFetch,
        dataSourceApi: extractDataSourceApi(context.props.dataSource),
      },
      'handleVisibleChange',
    );
    _fetchOptions();
  }
}

function handleDataSourceChange(
  context: EventHandlersContext,
  visible: boolean,
): void {
  const {
    currentState,
    pluginManagerRef,
    searchHandler,
    props,
    logger,
    _fetchOptions,
    _canFetch,
  } = context;

  if (!visible || isEmpty(currentState?.fetchOptions)) {
    return;
  }

  if (!pluginManagerRef.current) {
    logger.warn(
      'UseEventHandlers',
      '⚠️ Dropdown opened - pluginManagerRef.current does not exist',
      {},
      'handleVisibleChange',
    );
    return;
  }

  const currentApi = extractDataSourceApi(props.dataSource);
  const lastApi = currentState?.lastDataSourceApi;
  const dataSourceChanged = checkDataSourceChanged(currentApi, lastApi);

  logger.info(
    'UseEventHandlers',
    '🔍 Dropdown opened - detecting dataSource changes',
    {
      currentApi,
      lastApi,
      hasCurrentApi: Boolean(currentApi),
      hasLastApi: Boolean(lastApi),
      apiMatches: currentApi === lastApi,
      dataSourceChanged,
      fetchOptionsCount: currentState?.fetchOptions?.length || 0,
      dependency: props.dependency,
    },
    'handleVisibleChange',
  );

  if (dataSourceChanged) {
    logger.info(
      'UseEventHandlers',
      '✅ Dropdown opened - dataSource changed, clearing options and refetching',
      {
        oldApi: lastApi,
        newApi: currentApi,
        dependency: props.dependency,
      },
      'handleVisibleChange',
    );

    if (searchHandler && 'clearDebouncedSearch' in searchHandler) {
      (
        searchHandler as { clearDebouncedSearch: () => void }
      ).clearDebouncedSearch();
      logger.info(
        'UseEventHandlers',
        '✅ Dropdown opened - dataSource changed, cleared old debounced function',
        {
          oldApi: lastApi,
          newApi: currentApi,
        },
        'handleVisibleChange',
      );
    }

    if (pluginManagerRef.current) {
      pluginManagerRef.current.setState({
        fetchOptions: [],
        initFetchOptions: [],
        lastDataSourceApi: currentApi,
      });
    }

    if (_canFetch && currentApi) {
      logger.info(
        'UseEventHandlers',
        '✅ Dropdown opened - preparing to refetch data',
        {
          _canFetch,
          currentApi,
        },
        'handleVisibleChange',
      );
      _fetchOptions();
    } else {
      logger.warn(
        'UseEventHandlers',
        '⚠️ Dropdown opened - cannot refetch data',
        {
          _canFetch,
          currentApi,
          reason: !_canFetch
            ? 'canFetch is false'
            : 'currentApi does not exist',
        },
        'handleVisibleChange',
      );
    }
  } else {
    logger.debug(
      'UseEventHandlers',
      'Dropdown opened - options already exist, no need to fetch',
      {
        fetchOptionsCount: currentState?.fetchOptions?.length || 0,
        currentApi,
        lastApi,
        dataSourceChanged,
      },
      'handleVisibleChange',
    );
  }
}

export function handleVisibleChangeLogic(
  context: EventHandlersContext,
  visible: boolean,
): void {
  const { currentState, props, logger, addDebugLog } = context;

  logger.info(
    'UseEventHandlers',
    'Visibility changed',
    {
      visible,
      hasFetchOptions: !isEmpty(currentState?.fetchOptions),
      fetchOptionsCount: currentState?.fetchOptions?.length || 0,
      _canFetch: context._canFetch,
      dataSourceApi: extractDataSourceApi(props.dataSource),
      dependency: props.dependency,
    },
    'handleVisibleChange',
  );

  addDebugLog('VISIBLE_CHANGE', { visible });

  handleEmptyOptions(context, visible);
  handleDataSourceChange(context, visible);
}
