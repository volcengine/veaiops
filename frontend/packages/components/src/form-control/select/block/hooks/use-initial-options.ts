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

import { useEffect } from 'react';
import type React from 'react';
import type { SelectBlockState } from '../../types/plugin';

interface UseInitialOptionsParams {
  currentState: SelectBlockState | undefined;
  dataSource: unknown;
  initialOptions: unknown;
  dependency: unknown;
  pluginManagerRef: React.MutableRefObject<any>;
  addDebugLog: (action: string, data: Record<string, unknown>) => void;
}

export const useInitialOptions = ({
  currentState,
  dataSource,
  initialOptions,
  dependency,
  pluginManagerRef,
  addDebugLog,
}: UseInitialOptionsParams) => {
  useEffect(() => {
    const hasInitialOptions = Boolean(
      initialOptions &&
        Array.isArray(initialOptions) &&
        initialOptions.length > 0,
    );

    const shouldHandleInitialOptions = Boolean(
      !currentState?.searchValue && !dataSource && hasInitialOptions,
    );

    if (!shouldHandleInitialOptions) {
      return;
    }

    addDebugLog('TRIGGERING_RERENDER_FOR_INITIAL_OPTIONS', {
      reason: 'dependency change with initialOptions but no dataSource',
    });

    pluginManagerRef.current?.setState({
      stateVersion:
        (pluginManagerRef.current?.getState()?.stateVersion || 0) + 1,
    });
  }, [
    currentState?.searchValue,
    dataSource,
    initialOptions,
    dependency,
    pluginManagerRef,
    addDebugLog,
  ]);
};

