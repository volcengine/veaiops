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

import { type MutableRefObject, useEffect } from 'react';
import type { veArchSelectBlockProps } from '../types/interface';
import type { SelectBlockState } from '../types/plugin';

/**
 * Debug side effects Hook
 * Responsible for state change monitoring, global debug method exposure and other debug-related side effects
 */
export function useDebugEffects({
  currentState,
  renderCountRef,
  props,
  value,
  debugLogs,
  consoleDebugLogs,
  addDebugLog,
}: {
  currentState: SelectBlockState;
  renderCountRef: MutableRefObject<number>;
  props: veArchSelectBlockProps;
  value: unknown;
  debugLogs: Array<Record<string, unknown>>;
  consoleDebugLogs: Array<Record<string, unknown>>;
  addDebugLog: (action: string, data: Record<string, unknown>) => void;
}) {
  // === Render start logging ===
  addDebugLog('HOOK_RENDER_START', {
    renderCount: renderCountRef.current,
    propsHash: JSON.stringify(props).slice(0, 100),
    value,
    currentState: {
      ...currentState,
      fetchOptions: `[${currentState.fetchOptions?.length || 0} items]`,
    },
  });

  // === State change monitoring ===
  useEffect(() => {
    addDebugLog('STATE_CHANGE', {
      currentState: {
        ...currentState,
        fetchOptions: `[${currentState.fetchOptions?.length || 0} items]`,
      },
      loading: currentState.loading,
    });
  }, [
    currentState.loading,
    currentState.fetching,
    currentState.fetchOptions?.length,
    addDebugLog,
    currentState,
  ]);

  // === Global debug method exposure ===
  useEffect(() => {
    const exportMethodName = `getSelectBlockDebugLogs`;
    Reflect.set(window, exportMethodName, () => debugLogs);

    const consoleExportMethodName = `getSelectBlockConsoleDebugLogs`;
    Reflect.set(window, consoleExportMethodName, () => consoleDebugLogs);

    return () => {
      Reflect.deleteProperty(window, exportMethodName);
      Reflect.deleteProperty(window, consoleExportMethodName);
    };
  }, [debugLogs, consoleDebugLogs]);
}
