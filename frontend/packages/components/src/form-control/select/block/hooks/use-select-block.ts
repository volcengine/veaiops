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

import { logger } from '../logger';
import type { veArchSelectBlockProps } from '../types/interface';

// Import sub-hooks
import { useBaseConfig } from './use-base-config';
import { useDebugEffects } from './use-debug-effects';
import { useDebugLogging } from './use-debug-logging';
import { useDefaultValueEffects } from './use-default-value-effects';
import { useEventHandlers } from './use-event-handlers';
import { useFetchEffects } from './use-fetch-effects';
import { useOptionsProcessing } from './use-options-processing';
import { usePluginManager } from './use-plugin-manager';
import { useReturnValue } from './use-return-value';
import { useStateSubscription } from './use-state-subscription';

/**
 * SelectBlock main Hook, integrates all plugin functionality
 * Highly modular version: Each functional module is split into specialized sub-hooks, improving maintainability and readability
 */
export function useSelectBlock(props: veArchSelectBlockProps) {
  // === 1. Base configuration processing ===
  const {
    hookTraceId,
    initialOptions,
    limit,
    renderCountRef,
    isDebouncedFetch,
    defaultActiveFirstOption,
    value,
    onChange,
    dataSource,
    dataSourceShare,
    isFirstHint,
    dependency,
  } = useBaseConfig(props);

  // Get remoteSearchKey from props
  const { remoteSearchKey } = props;

  // === 2. Debug logging system ===
  const { debugLogs, consoleDebugLogs, addDebugLog } =
    useDebugLogging(hookTraceId);

  // === 3. Plugin manager ===
  const {
    pluginManagerRef,
    dataFetcher,
    searchHandler,
    paginationHandler,
    pasteHandler,
  } = usePluginManager(props, initialOptions, limit, addDebugLog, hookTraceId);

  // === 4. State subscription ===
  const { currentState } = useStateSubscription(
    pluginManagerRef,
    initialOptions,
    hookTraceId,
  );

  // === 5. Options processing ===
  const {
    finalOptions,
    finalDefaultValue,
    finalValue,
    shouldFetchOptionsWithDefaultValue,
    shouldFetchDueToValueEmpty,
    _canFetch,
  } = useOptionsProcessing(props, currentState, dataFetcher);

  // === 6. Event handlers ===
  addDebugLog('BEFORE_EVENT_HANDLERS', {
    _canFetch,
    _canFetchType: typeof _canFetch,
    shouldFetchOptionsWithDefaultValue,
    dataSource: dataSource ? 'exists' : 'missing',
  });

  const {
    onSearch,
    handlePaste,
    handleVisibleChange,
    handleClear,
    popupScrollHandler,
    _fetchOptions,
  } = useEventHandlers(
    props,
    currentState,
    searchHandler,
    pasteHandler,
    paginationHandler,
    dataFetcher,
    _canFetch,
    shouldFetchOptionsWithDefaultValue,
    addDebugLog,
    pluginManagerRef,
  );

  addDebugLog('AFTER_EVENT_HANDLERS', {
    _canFetch,
    _canFetchType: typeof _canFetch,
  });

  // === 7. Debug side effects processing ===
  useDebugEffects({
    currentState,
    renderCountRef,
    props,
    value,
    debugLogs,
    consoleDebugLogs,
    addDebugLog,
  });

  // === 8. Data fetching side effects processing ===
  useFetchEffects({
    shouldFetchOptionsWithDefaultValue,
    shouldFetchDueToValueEmpty,
    _fetchOptions,
    _canFetch,
    currentState,
    dataSource,
    dataSourceShare,
    isFirstHint,
    dependency,
    value,
    dataFetcher,
    searchHandler,
    initialOptions,
    pluginManagerRef,
    addDebugLog,
    remoteSearchKey,
  });

  // === 9. Default value side effects processing ===
  // 🔧 Full-chain tracking point 3: Before calling useDefaultValueEffects
  logger.info(
    'UseSelectBlock',
    '🟡 [Full Trace-3] Preparing to call useDefaultValueEffects',
    {
      defaultActiveFirstOption,
      finalDefaultValue,
      value,
      mode: props.mode,
      hasOnChange: Boolean(onChange),
      willPass: {
        defaultActiveFirstOption,
        finalDefaultValue,
        value,
        mode: props.mode,
      },
    },
    'useSelectBlock',
  );

  useDefaultValueEffects({
    defaultActiveFirstOption,
    finalDefaultValue,
    onChange: onChange as
      | ((value: unknown, option?: unknown) => void)
      | undefined,
    value, // 🔧 Pass current value to prevent overwriting selected values
    mode: props.mode, // 🔧 Pass mode to determine empty value in multiple selection mode
  });

  // === 10. Return final result ===
  return useReturnValue({
    currentState,
    finalOptions,
    finalDefaultValue,
    finalValue,
    onSearch,
    handlePaste,
    handleVisibleChange,
    handleClear,
    popupScrollHandler,
    isDebouncedFetch,
  });
}
