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

import { omit } from 'lodash-es';
import { useEffect, useMemo, useRef } from 'react';
import { SelectBlockPluginManager } from '../core/plugin-manager';
import { logger } from '../logger';
import { CacheHandlerPluginImpl } from '../plugins/cache-handler';
import { DataFetcherPluginImpl } from '../plugins/data-fetcher';
import { PaginationPluginImpl } from '../plugins/pagination-handler';
import { PasteHandlerPluginImpl } from '../plugins/paste-handler';
import { SearchHandlerPluginImpl } from '../plugins/search-handler';
import type { SelectOption, veArchSelectBlockProps } from '../types/interface';
import { PluginType } from '../types/plugin';

/**
 * Plugin manager Hook
 * Responsible for plugin manager initialization, plugin registration and lifecycle management
 */
export function usePluginManager(
  props: veArchSelectBlockProps,
  initialOptions: SelectOption[],
  limit: number,
  addDebugLog: (action: string, data: any) => void,
  hookTraceId: string,
) {
  const {
    handleParams = (v) => omit(v, ['value', 'search']),
    handleOptions = ({ options }) => options,
    searchKey,
    remoteSearchKey,
    multiSearchKeys = [],
    formatRemoteSearchKey = (v: string) => v,

    isScrollFetching = false,
    allowPasteMultiple = false,
    tokenSeparators = ['\n', ',', ';', '\t', ' ', '|', '，', '；'],
    onPaste,
    beforePasteProcess,
    mode,
    cacheKey,
    dataSourceShare = false,
    isFirstHint = false,
  } = props;
  const pluginManagerRef = useRef<SelectBlockPluginManager>();

  // 🔧 Add early diagnostic logging
  const currentPluginCount = pluginManagerRef.current?.plugins?.size || 0;
  const needsInitialization =
    !pluginManagerRef.current || currentPluginCount === 0;

  logger.debug(
    'UsePluginManager',
    'Hook execution started',
    {
      hasPluginManagerRef: Boolean(pluginManagerRef),
      hasPluginManagerCurrent: Boolean(pluginManagerRef.current),
      currentPluginCount,
      needsInitialization,
    },
    'usePluginManager',
    hookTraceId,
  );

  // 🔧 Synchronously initialize plugin manager - if it doesn't exist or plugins are cleared, need to reinitialize
  if (needsInitialization) {
    // If pluginManager exists but plugins are cleared, destroy old one first
    if (pluginManagerRef.current) {
      logger.warn(
        'UsePluginManager',
        'Empty plugin manager detected, destroying and rebuilding',
        {
          oldPluginCount: pluginManagerRef.current.plugins?.size || 0,
        },
        'usePluginManager',
        hookTraceId,
      );
      pluginManagerRef.current.destroy();
      pluginManagerRef.current = undefined;
    }
    logger.info(
      'UsePluginManager',
      'Preparing to create new plugin manager',
      {},
      'usePluginManager',
      hookTraceId,
    );

    const manager = new SelectBlockPluginManager();

    logger.debug(
      'UsePluginManager',
      'Plugin manager object created',
      {
        hasManager: Boolean(manager),
        managerType: typeof manager,
      },
      'usePluginManager',
      hookTraceId,
    );

    // 🔧 Now use built-in subscription mechanism, no need to manually rewrite setState

    // Set initial state
    manager.setState({
      fetchOptions: initialOptions || [],
      initFetchOptions: initialOptions || [],
      fetching: false,
      loading: false,
      skip: 0,
      searchValue: '',
      canTriggerLoadMore: true,
      mounted: false,
    });

    // Set initial Props
    manager.setProps(props);

    logger.debug(
      'UsePluginManager',
      'Props set, ready to register plugins',
      {
        hasManager: Boolean(manager),
        managerPluginCount: manager.plugins?.size || 0,
      },
      'usePluginManager',
      hookTraceId,
    );

    // Register all plugins
    logger.info(
      'UsePluginManager',
      'Starting plugin registration',
      { limit },
      'usePluginManager',
      hookTraceId,
    );

    try {
      // Register data fetching plugin
      logger.debug(
        'UsePluginManager',
        'Creating DataFetcher plugin',
        {},
        'usePluginManager',
        hookTraceId,
      );
      const dataFetcher = new DataFetcherPluginImpl({
        limit,
        handleParams,
        handleOptions,
      });
      manager.register(dataFetcher);

      // Register search handler plugin
      // 🔧 Reduce debounce delay to 100ms to avoid component re-render during debounce wait causing plugin destruction
      const searchHandler = new SearchHandlerPluginImpl({
        searchKey,
        remoteSearchKey,
        multiSearchKeys,
        formatRemoteSearchKey,
        debounceDelay: 100, // Reduced from 500ms to 100ms
      });
      manager.register(searchHandler);

      // Register pagination plugin
      const pagination = new PaginationPluginImpl({
        limit,
        enabled: isScrollFetching,
      });
      manager.register(pagination);

      // Register paste handler plugin
      const pasteHandler = new PasteHandlerPluginImpl({
        allowPasteMultiple,
        tokenSeparators,
        onPaste,
        beforePasteProcess,
        mode,
      });
      manager.register(pasteHandler);

      // Register cache handler plugin
      const cacheHandler = new CacheHandlerPluginImpl({
        cacheKey,
        dataSourceShare,
        isFirstHint,
        autoRemoveDelay: 5000,
      });
      manager.register(cacheHandler);

      // 🔧 Set reference relationships between plugins
      if (searchHandler && dataFetcher) {
        searchHandler.setDataFetcher(dataFetcher);
      }
      if (searchHandler && cacheHandler) {
        searchHandler.setCacheHandler(cacheHandler);
      }
      if (dataFetcher && cacheHandler) {
        dataFetcher.setCacheHandler(cacheHandler);
      }

      addDebugLog('PLUGIN_MANAGER_INITIALIZED', {
        pluginCount: manager.plugins.size,
        registeredPlugins: Array.from(manager.plugins.keys()),
      });

      logger.info(
        'UsePluginManager',
        'Plugin manager initialization completed',
        {
          pluginCount: manager.plugins.size,
          registeredPlugins: Array.from(manager.plugins.keys()),
        },
        'usePluginManager',
        hookTraceId,
      );
    } catch (error) {
      logger.error(
        'UsePluginManager',
        'Plugin manager initialization failed',
        error as Error,
        { error: String(error) },
        'usePluginManager',
        hookTraceId,
      );
      throw error;
    }

    pluginManagerRef.current = manager;

    logger.info(
      'UsePluginManager',
      'pluginManagerRef.current assigned',
      {
        hasPluginManagerCurrent: Boolean(pluginManagerRef.current),
        finalPluginCount: pluginManagerRef.current?.plugins?.size || 0,
      },
      'usePluginManager',
      hookTraceId,
    );
  } else {
    logger.debug(
      'UsePluginManager',
      'pluginManager already exists, skipping initialization',
      {
        pluginCount: pluginManagerRef.current?.plugins?.size || 0,
        registeredPlugins: pluginManagerRef.current
          ? Array.from(pluginManagerRef.current.plugins.keys())
          : [],
      },
      'usePluginManager',
      hookTraceId,
    );
  }

  // Update plugin manager props
  // 🔧 Fix infinite loop: Completely remove props auto-update logic
  // pluginManager already gets props reference during initialization
  // Subsequent sharing through context, no need for manual synchronization
  // If update needed, should be triggered by specific business logic, not checked on every render

  // Cleanup plugin manager
  useEffect(() => {
    const currentTraceId = hookTraceId;
    logger.info(
      'UsePluginManager',
      'Component mounted - plugin manager activated',
      {
        hasPluginManager: Boolean(pluginManagerRef.current),
        pluginCount: pluginManagerRef.current?.plugins?.size || 0,
        traceId: currentTraceId,
      },
      'useEffect_cleanup',
      currentTraceId,
    );

    return () => {
      logger.warn(
        'UsePluginManager',
        'Component about to unmount - preparing to destroy plugin manager',
        {
          hasPluginManager: Boolean(pluginManagerRef.current),
          pluginCount: pluginManagerRef.current?.plugins?.size || 0,
          traceId: currentTraceId,
        },
        'useEffect_cleanup',
        currentTraceId,
      );

      if (pluginManagerRef.current) {
        pluginManagerRef.current.destroy();
        // 🔧 Clear reference after destruction to avoid mistakenly thinking "already exists" on next render
        pluginManagerRef.current = undefined;
      }
    };
  }, []); // ⚠️ Must be empty dependencies, otherwise will trigger destruction on every render

  // Get references to each plugin - always get from current pluginManagerRef to ensure getting latest plugin instance
  // Cannot use useMemo([]), as that would cache old plugins
  const dataFetcher = pluginManagerRef.current?.getPlugin(
    PluginType.DATA_FETCHER,
  );
  const searchHandler = pluginManagerRef.current?.getPlugin(
    PluginType.SEARCH_HANDLER,
  );
  const paginationHandler = pluginManagerRef.current?.getPlugin(
    PluginType.PAGINATION,
  );
  const pasteHandler = pluginManagerRef.current?.getPlugin(
    PluginType.PASTE_HANDLER,
  );

  // 🔧 Add plugin reference acquisition log (only log warning when plugins are missing)
  if (!dataFetcher || !searchHandler) {
    logger.warn(
      'UsePluginManager',
      'Plugin reference acquisition failed',
      {
        hasPluginManager: Boolean(pluginManagerRef.current),
        hasDataFetcher: Boolean(dataFetcher),
        hasSearchHandler: Boolean(searchHandler),
        hasPaginationHandler: Boolean(paginationHandler),
        hasPasteHandler: Boolean(pasteHandler),
        pluginCount: pluginManagerRef.current?.plugins?.size || 0,
      },
      'usePluginManager',
      hookTraceId,
    );
  }

  return {
    pluginManagerRef,
    dataFetcher: dataFetcher as any,
    searchHandler: searchHandler as any,
    paginationHandler: paginationHandler as any,
    pasteHandler: pasteHandler as any,
  };
}
