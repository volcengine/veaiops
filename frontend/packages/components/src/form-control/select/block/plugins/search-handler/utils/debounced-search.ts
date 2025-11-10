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

import { logger } from '../../../logger';
import type {
  CacheHandlerPlugin,
  DataFetcherPlugin,
  PluginContext,
  SearchParams,
} from '../../../types/plugin';
import { isDataSourceSetter } from '../../../util';
import { getSearchParams } from './search-params';

interface DebouncedSearchDependencies {
  capturedContext: PluginContext;
  capturedDataFetcher: DataFetcherPlugin | undefined;
  capturedCacheHandler: CacheHandlerPlugin | undefined;
  config: {
    remoteSearchKey?: string;
  };
  getSearchParams: (inputValue: string) => Record<string, any>;
}

export async function executeDebouncedSearch(
  params: SearchParams,
  deps: DebouncedSearchDependencies,
): Promise<boolean> {
  const { initValue, inputValue, scroll, isOptionAppend = false } = params;
  const {
    capturedContext,
    capturedDataFetcher,
    capturedCacheHandler,
    config,
    getSearchParams: getSearchParamsFn,
  } = deps;

  logger.debug(
    'SearchHandler',
    'DEBOUNCED_SEARCH_FUNCTION_EXECUTED',
    {
      initValue,
      inputValue,
      scroll,
      isOptionAppend,
      timestamp: Date.now(),
      hasCapturedContext: Boolean(capturedContext),
      capturedContextType: typeof capturedContext,
    },
    'createDebouncedSearch',
  );

  if (!capturedContext) {
    logger.warn(
      'SearchHandler',
      'DEBOUNCED_SEARCH_ABORT - capturedContext is null',
      {
        timestamp: Date.now(),
        capturedContextType: typeof capturedContext,
        capturedContextIsNull: capturedContext === null,
        capturedContextIsUndefined: capturedContext === undefined,
      },
      'createDebouncedSearch',
    );
    return false;
  }

  const { props } = capturedContext;
  logger.info(
    'SearchHandler',
    'DEBOUNCED_SEARCH_START',
    {
      initValue,
      inputValue,
      scroll,
      isOptionAppend,
      dataSource: props.dataSource ? 'present' : 'missing',
    },
    'createDebouncedSearch',
  );

  if (!props.dataSource) {
    logger.warn(
      'SearchHandler',
      'DEBOUNCED_SEARCH_ABORT - no dataSource',
      {},
      'createDebouncedSearch',
    );
    return false;
  }

  const loadingStartTime = Date.now();
  logger.debug(
    'SearchHandler',
    'LOADING_STATE_SET_TRUE',
    {
      loadingStartTime,
      timestamp: Date.now(),
    },
    'createDebouncedSearch',
  );

  const { state } = capturedContext;
  const { limit } = capturedContext.props.pageReq || { limit: 100 };
  const newSkip = scroll ? state.skip + limit : 0;

  capturedContext.setState({
    loading: true,
    fetching: true,
    skip: newSkip,
  });

  if (props.cacheKey !== undefined && capturedCacheHandler) {
    const optionsInCache = capturedCacheHandler.getFromCache(props.cacheKey);
    if (optionsInCache) {
      capturedCacheHandler.scheduleRemoval(props.cacheKey);
      return optionsInCache;
    }
  }

  let remoteSearchParams = {};

  if (initValue && config.remoteSearchKey) {
    remoteSearchParams = { [config.remoteSearchKey]: initValue };
  }

  if (inputValue) {
    remoteSearchParams = getSearchParamsFn(inputValue);
  }

  try {
    const dataFetcher = capturedDataFetcher;
    if (!dataFetcher) {
      logger.warn(
        'SearchHandler',
        'DEBOUNCED_SEARCH_ABORT - no dataFetcher',
        {},
        'createDebouncedSearch',
      );
      return false;
    }

    const apiName = isDataSourceSetter(props.dataSource)
      ? props.dataSource.api
      : 'Function';

    logger.info(
      'SearchHandler',
      'API_REQUEST_START',
      {
        apiName,
        remoteSearchParams,
        timestamp: Date.now(),
        timeSinceLoadingStart: Date.now() - loadingStartTime,
      },
      'createDebouncedSearch',
    );

    const options = await dataFetcher.fetchData(
      props.dataSource,
      remoteSearchParams,
      capturedContext,
    );

    logger.info(
      'SearchHandler',
      'API_REQUEST_COMPLETE',
      {
        apiName,
        optionsCount: options?.length || 0,
        timestamp: Date.now(),
        apiDuration: Date.now() - loadingStartTime,
      },
      'createDebouncedSearch',
    );

    const processedOptions = dataFetcher.processOptions(
      options,
      scroll || isOptionAppend,
      apiName,
      capturedContext,
    );

    const { state: currentState } = capturedContext;
    const limitValue = props?.pageReq?.limit || 100;

    const currentDataSourceApi = isDataSourceSetter(props.dataSource)
      ? props.dataSource.api
      : undefined;

    const newState: any = {
      fetchOptions: processedOptions,
      canTriggerLoadMore: options?.length >= limitValue,
      loading: false,
      fetching: false,
      lastDataSourceApi: currentDataSourceApi,
    };

    if (!currentState.mounted) {
      newState.initFetchOptions = processedOptions;
      newState.mounted = true;
    }

    const elapsedTime = Date.now() - loadingStartTime;

    logger.debug(
      'SearchHandler',
      'LOADING_STATE_SET_FALSE_SUCCESS',
      {
        elapsedTime,
        totalDuration: elapsedTime,
        timestamp: Date.now(),
      },
      'createDebouncedSearch',
    );

    logger.info(
      'SearchHandler',
      'STATE_UPDATE_OPTIONS',
      {
        processedOptionsCount: processedOptions?.length || 0,
        mounted: newState.mounted,
        canTriggerLoadMore: newState.canTriggerLoadMore,
        timestamp: Date.now(),
      },
      'createDebouncedSearch',
    );

    capturedContext.setState(newState);

    try {
      const setDirectOptionsFunc = (window as any)[
        `setDirectOptions_${apiName}`
      ];
      if (setDirectOptionsFunc) {
        setDirectOptionsFunc(processedOptions);
      }
    } catch (error) {}

    return true;
  } catch (error) {
    logger.error(
      'SearchHandler',
      'API_REQUEST_ERROR',
      error as Error,
      {
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
        errorDuration: Date.now() - loadingStartTime,
      },
      'createDebouncedSearch',
    );

    const elapsedTime = Date.now() - loadingStartTime;

    logger.debug(
      'SearchHandler',
      'LOADING_STATE_SET_FALSE_ERROR',
      {
        elapsedTime,
        totalDuration: elapsedTime,
        timestamp: Date.now(),
      },
      'createDebouncedSearch',
    );

    capturedContext.setState({
      loading: false,
      fetching: false,
    });

    return false;
  }
}
