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

import type React from 'react';
import { useEffect, useState } from 'react';
import type { SelectBlockPluginManager } from '../core/plugin-manager';
import { logger } from '../logger';
import type { SelectOption } from '../types/interface';
import type { SelectBlockState } from '../types/plugin';

/**
 * State subscription Hook
 * Manages state synchronization with PluginManager, avoiding React batch rendering timing issues
 */
export function useStateSubscription(
  pluginManagerRef: React.MutableRefObject<
    SelectBlockPluginManager | undefined
  >,
  initialOptions: SelectOption[],
  hookTraceId: string,
) {
  // 🔧 Use real-time subscription mechanism to get latest state, bypass React batch rendering issues
  const [currentState, setCurrentState] = useState<SelectBlockState>(() => ({
    fetchOptions: initialOptions || [],
    initFetchOptions: initialOptions || [],
    fetching: false,
    loading: false,
    skip: 0,
    searchValue: '',
    canTriggerLoadMore: true,
    mounted: false,
  }));

  // 🔧 Subscribe to PluginManager state changes, sync in real-time
  useEffect(() => {
    if (!pluginManagerRef.current) {
      return () => {};
    }

    // Immediately get current state
    setCurrentState(pluginManagerRef.current.getState());

    // Subscribe to subsequent state changes
    const unsubscribe = pluginManagerRef.current.subscribe((newState) => {
      logger.debug(
        'UseStateSubscription',
        'Received state subscription notification',
        {
          newLoading: newState.loading,
          newFetching: newState.fetching,
          optionsLength: newState.fetchOptions?.length || 0,
        },
        'useStateSubscription',
        hookTraceId,
      );
      setCurrentState(newState);
    });

    // Clean up subscription
    return unsubscribe;
  }, [hookTraceId]);

  return {
    currentState,
  };
}
