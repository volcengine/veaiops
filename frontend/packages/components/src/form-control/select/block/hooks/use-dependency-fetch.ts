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

import { logger as utilLogger } from '@veaiops/utils';
import { useEffect, useRef } from 'react';
import type { DataFetcherPluginImpl } from '../../plugins/data-fetcher';
import type { SearchHandlerPluginImpl } from '../../plugins/search-handler';
import type { SelectBlockState } from '../../types/plugin';
import { logger } from '../logger';

interface UseDependencyFetchParams {
  dependency: unknown;
  dataSource: unknown;
  _canFetch: boolean;
  currentState: SelectBlockState | undefined;
  dataFetcher: DataFetcherPluginImpl | undefined;
  searchHandler: SearchHandlerPluginImpl | undefined;
  value: unknown;
  remoteSearchKey?: string;
  isDependencyFetchingRef: React.MutableRefObject<boolean>;
  instanceIdRef: React.MutableRefObject<string>;
}

export const useDependencyFetch = ({
  dependency,
  dataSource,
  _canFetch,
  currentState,
  dataFetcher,
  searchHandler,
  value,
  remoteSearchKey,
  isDependencyFetchingRef,
  instanceIdRef,
}: UseDependencyFetchParams) => {
  const prevDependencyStrRef = useRef<string>('');

  useEffect(() => {
    utilLogger.info({
      message: '⚡ dependency useEffect execution started',
      data: {
        instanceId: instanceIdRef.current,
        dependency,
        dataSource: Boolean(dataSource),
        prevDependency: prevDependencyStrRef.current,
      },
      source: 'SelectBlock',
      component: 'UseFetchEffects',
    });

    const prevDependencyStr = prevDependencyStrRef.current;
    const currentDependencyStr = JSON.stringify(dependency) || '';
    const dependencyChanged = prevDependencyStr !== currentDependencyStr;

    const hasValidDependency = Boolean(
      currentDependencyStr &&
        currentDependencyStr !== '' &&
        currentDependencyStr !== 'null' &&
        currentDependencyStr !== 'undefined',
    );
    const hasDataSource = Boolean(dataSource);

    utilLogger.info({
      message: '🟣 dependency useEffect triggered',
      data: {
        instanceId: instanceIdRef.current,
        dependency: currentDependencyStr,
        dependencyRaw: dependency,
        dependencyType: typeof dependency,
        dependencyIsArray: Array.isArray(dependency),
        dependencyFirstItem: Array.isArray(dependency)
          ? dependency[0]
          : undefined,
        prevDependency: prevDependencyStr,
        dependencyChanged,
        hasValidDependency,
        hasDataSource,
        dataSourceType: typeof dataSource,
        dataSourceApi:
          typeof dataSource === 'object' &&
          dataSource !== null &&
          'api' in dataSource
            ? (dataSource as any).api
            : undefined,
        _canFetch,
        currentSearchValue: currentState?.searchValue,
        hasFetchOptions: Boolean(currentState?.fetchOptions?.length),
        willTriggerFetch: _canFetch && hasDataSource && dependencyChanged,
      },
      source: 'SelectBlock',
      component: 'UseFetchEffects',
    });

    logger.info(
      'UseFetchEffects',
      '🟣 dependency useEffect triggered',
      {
        dependencyChanged,
        hasValidDependency,
        willTriggerFetch: _canFetch && hasDataSource && dependencyChanged,
      },
      'useEffect_dependency',
    );

    if (!dependencyChanged) {
      utilLogger.debug({
        message: 'dependency unchanged, skipping',
        data: {
          dependency: currentDependencyStr,
          prevDependency: prevDependencyStr,
        },
        source: 'SelectBlock',
        component: 'UseFetchEffects',
      });
      logger.debug(
        'UseFetchEffects',
        'dependency unchanged, skipping',
        {
          dependency: currentDependencyStr,
          prevDependency: prevDependencyStr,
          bothAreEqual: prevDependencyStr === currentDependencyStr,
        },
        'useEffect_dependency',
      );
      return;
    }

    if (!hasValidDependency) {
      prevDependencyStrRef.current = currentDependencyStr;
      utilLogger.debug({
        message: 'dependency invalid, only updating ref',
        data: {
          dependency: currentDependencyStr,
        },
        source: 'SelectBlock',
        component: 'UseFetchEffects',
      });
      logger.debug(
        'UseFetchEffects',
        'dependency invalid, only updating ref',
        {
          dependency: currentDependencyStr,
          hasValidDependency,
        },
        'useEffect_dependency',
      );
      return;
    }

    prevDependencyStrRef.current = currentDependencyStr;

    if (searchHandler && 'clearDebouncedSearch' in searchHandler) {
      (searchHandler as any).clearDebouncedSearch();
      const currentDataSourceApi =
        typeof dataSource === 'object' &&
        dataSource !== null &&
        'api' in dataSource
          ? (dataSource as any).api
          : undefined;

      logger.info(
        'UseFetchEffects',
        '✅ dependency changed - cleared old debounced function',
        {
          dependency: JSON.stringify(dependency),
          dataSourceApi: currentDataSourceApi,
        },
        'useEffect_dependency',
      );
      utilLogger.info({
        message: '✅ dependency changed - cleared old debounced function',
        data: {
          dependency: JSON.stringify(dependency),
          dataSourceApi: currentDataSourceApi,
        },
        source: 'SelectBlock',
        component: 'UseFetchEffects',
      });
    } else {
      const reason = !searchHandler
        ? 'searchHandler does not exist'
        : 'searchHandler has no clearDebouncedSearch method';
      utilLogger.warn({
        message: '⚠️ dependency changed - unable to clear debounced function',
        data: {
          reason,
          hasSearchHandler: Boolean(searchHandler),
          dependency: JSON.stringify(dependency),
        },
        source: 'SelectBlock',
        component: 'UseFetchEffects',
      });
    }

    if (!_canFetch || !dataSource) {
      utilLogger.warn({
        message: '⚠️ dependency changed - unable to trigger data fetch',
        data: {
          reason: !_canFetch
            ? 'canFetch is false'
            : 'dataSource does not exist',
          _canFetch,
          hasDataSource: Boolean(dataSource),
          dependency: JSON.stringify(dependency),
        },
        source: 'SelectBlock',
        component: 'UseFetchEffects',
      });
      isDependencyFetchingRef.current = false;
      return;
    }

    utilLogger.info({
      message: '✅ dependency changed - triggering data fetch',
      data: {
        dependency: JSON.stringify(dependency),
        hasDataFetcher: Boolean(dataFetcher),
        hasSearchHandler: Boolean(searchHandler),
      },
      source: 'SelectBlock',
      component: 'UseFetchEffects',
    });
    logger.info(
      'UseFetchEffects',
      'dependency changed - triggering data fetch',
      {
        dependency: JSON.stringify(dependency),
        hasDataFetcher: Boolean(dataFetcher),
        hasSearchHandler: Boolean(searchHandler),
        currentSearchValue: currentState?.searchValue,
      },
      'useEffect_dependency',
    );

    isDependencyFetchingRef.current = true;

    if (!dataFetcher || !searchHandler || !currentState) {
      utilLogger.warn({
        message: '⚠️ dependency changed - missing required plugins or state',
        data: {
          hasDataFetcher: Boolean(dataFetcher),
          hasSearchHandler: Boolean(searchHandler),
          hasCurrentState: Boolean(currentState),
        },
        source: 'SelectBlock',
        component: 'UseFetchEffects',
      });
      isDependencyFetchingRef.current = false;
      return;
    }

    logger.info(
      'UseFetchEffects',
      'dependency changed - fetching data immediately (no debounce)',
      {
        hasDataFetcher: Boolean(dataFetcher),
        hasSearchHandler: Boolean(searchHandler),
        remoteSearchKey,
        value,
      },
      'useEffect_dependency',
    );

    (async () => {
      try {
        const ctx =
          (searchHandler as any).context || (dataFetcher as any).context;
        if (!ctx) {
          utilLogger.warn({
            message: '⚠️ dependency changed - context unavailable',
            data: {
              hasSearchHandlerContext: Boolean((searchHandler as any).context),
              hasDataFetcherContext: Boolean((dataFetcher as any).context),
            },
            source: 'SelectBlock',
            component: 'UseFetchEffects',
          });
          logger.warn(
            'UseFetchEffects',
            'dependency changed - context unavailable',
            {},
            'useEffect_dependency',
          );
          isDependencyFetchingRef.current = false;
          return;
        }

        logger.info(
          'UseFetchEffects',
          'dependency changed - starting data request',
          {
            hasContext: Boolean(ctx),
          },
          'useEffect_dependency',
        );

        ctx.setState({
          fetchOptions: [],
          initFetchOptions: [],
          loading: true,
          fetching: true,
        });

        logger.info(
          'UseFetchEffects',
          'dependency changed - cleared old options',
          {},
          'useEffect_dependency',
        );

        const options = await dataFetcher.fetchData(dataSource as any, {}, ctx);

        logger.info(
          'UseFetchEffects',
          'dependency changed - request completed',
          {
            optionsCount: options?.length || 0,
          },
          'useEffect_dependency',
        );

        if ((dataFetcher as any).isDestroyed) {
          utilLogger.warn({
            message:
              '⚠️ Component destroyed but continuing to update state (may be rapid rebuild)',
            data: {
              instanceId: instanceIdRef.current,
              optionsCount: options?.length || 0,
            },
            source: 'SelectBlock',
            component: 'UseFetchEffects',
          });
        }

        const processedOptions = dataFetcher.processOptions(
          options,
          false,
          undefined,
          ctx,
        );

        const dataSourceApi =
          typeof dataSource === 'object' &&
          dataSource !== null &&
          'api' in dataSource
            ? (dataSource as any).api
            : undefined;

        ctx.setState({
          fetchOptions: processedOptions,
          initFetchOptions: processedOptions,
          loading: false,
          fetching: false,
          mounted: true,
          lastDataSourceApi: dataSourceApi,
        });

        utilLogger.info({
          message: '✅ dependency changed - state update completed',
          data: {
            finalOptionsCount: processedOptions?.length || 0,
          },
          source: 'SelectBlock',
          component: 'UseFetchEffects',
        });
        logger.info(
          'UseFetchEffects',
          'dependency changed - state update completed',
          {
            finalOptionsCount: processedOptions?.length || 0,
          },
          'useEffect_dependency',
        );

        isDependencyFetchingRef.current = false;
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error(
          'UseFetchEffects',
          'dependency changed - data fetch error',
          {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          'useEffect_dependency',
        );
        utilLogger.error({
          message: 'dependency changed - data fetch error',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'SelectBlock',
          component: 'UseFetchEffects',
        });
        isDependencyFetchingRef.current = false;
      }
    })();
  }, [
    dependency,
    dataSource,
    _canFetch,
    currentState,
    dataFetcher,
    searchHandler,
    value,
    remoteSearchKey,
    isDependencyFetchingRef,
    instanceIdRef,
  ]);
};
