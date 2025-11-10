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
import type React from 'react';
import { useEffect, useRef } from 'react';
import { logger } from '../logger';
import type { DataFetcherPluginImpl } from '../plugins/data-fetcher';
import type { SearchHandlerPluginImpl } from '../plugins/search-handler';
import type { SelectBlockState } from '../types/plugin';
import { useBasicFetch } from './use-basic-fetch';
import { useDependencyFetch } from './use-dependency-fetch';
import { useInitialOptions } from './use-initial-options';
import { useSharedDatasource } from './use-shared-datasource';

/**
 * Data fetching side effects Hook
 * Responsible for handling automatic option fetching, main data fetching and other side effect logic
 */
export function useFetchEffects(props: {
  shouldFetchOptionsWithDefaultValue: boolean;
  shouldFetchDueToValueEmpty: boolean;
  _fetchOptions: () => void;
  _canFetch: boolean;
  currentState: SelectBlockState;
  dataSource: unknown;
  dataSourceShare: boolean;
  isFirstHint: boolean;
  dependency: unknown;
  value: unknown;
  dataFetcher: DataFetcherPluginImpl | undefined;
  searchHandler: SearchHandlerPluginImpl | undefined;
  initialOptions: unknown;
  pluginManagerRef: React.MutableRefObject<any>;
  addDebugLog: (action: string, data: Record<string, unknown>) => void;
  remoteSearchKey?: string;
}) {
  const {
    shouldFetchDueToValueEmpty,
    _fetchOptions,
    _canFetch,
    currentState,
    dataSource,
    dataSourceShare,
    isFirstHint,
    dependency,
    initialOptions,
    pluginManagerRef,
    addDebugLog,
    dataFetcher,
    searchHandler,
    value,
    remoteSearchKey,
  } = props;

  // 🔧 Create unique component instance ID (only created on first render)
  const instanceIdRef = useRef(
    `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  );

  // 🔧 Debug: Confirm Hook is called
  utilLogger.info({
    message: '🎯 Hook called',
    data: {
      instanceId: instanceIdRef.current,
      dependency,
      hasDataSource: Boolean(dataSource),
      dataSourceType: typeof dataSource,
      _canFetch,
    },
    source: 'SelectBlock',
    component: 'UseFetchEffects',
  });

  const searchValueRef = useRef(currentState?.searchValue);
  useEffect(() => {
    searchValueRef.current = currentState?.searchValue;
  }, [currentState?.searchValue]);

  const isDependencyFetchingRef = useRef(false);

  const shouldFetchBasic = Boolean(
    currentState && !currentState.searchValue && _canFetch && dataSource,
  );

  useBasicFetch({
    shouldFetchBasic,
    shouldFetchDueToValueEmpty,
    _fetchOptions,
    _canFetch,
    currentState,
    dataSource,
    dataSourceShare,
    dependency,
    isDependencyFetchingRef,
    addDebugLog,
  });

  useSharedDatasource({
    dataSourceShare,
    currentState,
    _canFetch,
    dataSource,
    shouldFetchDueToValueEmpty,
    isFirstHint,
    _fetchOptions,
    addDebugLog,
  });

  useInitialOptions({
    currentState,
    dataSource,
    initialOptions,
    dependency,
    pluginManagerRef,
    addDebugLog,
  });

  useDependencyFetch({
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
  });
}
