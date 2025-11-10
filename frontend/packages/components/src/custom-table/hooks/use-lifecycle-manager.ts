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

import type {
  PluginContext,
  UseLifecycleManagerProps,
  UseLifecycleManagerResult,
} from '@/custom-table/types';
import type {
  CustomTableLifecycleConfig,
  LifecycleListener,
  LifecyclePhase,
} from '@/custom-table/types/plugins/lifecycle';
import {
  type LifecycleManager,
  createLifecycleManager,
  mergeLifecycleConfigs,
} from '@/custom-table/utils';
/**
 * Lifecycle manager Hook
 * Provides plugin lifecycle management capability
 */
import { useCallback, useEffect, useRef } from 'react';

// Types have been migrated to ../types/hooks/lifecycle.ts

/**
 * Use lifecycle manager
 */
export const useLifecycleManager = ({
  lifecycleConfig,
  managerConfig,
  globalCallbacks,
  onLifecycleError,
}: UseLifecycleManagerProps = {}): UseLifecycleManagerResult => {
  const managerRef = useRef<LifecycleManager | null>(null);
  const configRef = useRef<CustomTableLifecycleConfig | undefined>(undefined);

  // Initialize manager
  if (!managerRef.current) {
    managerRef.current = createLifecycleManager(managerConfig);
  }

  // Merge configuration
  const mergedConfig = mergeLifecycleConfigs(
    lifecycleConfig,
    globalCallbacks
      ? ({
          global: globalCallbacks,
          errorHandling: lifecycleConfig?.errorHandling || 'warn',
          debug: lifecycleConfig?.debug || false,
        } as any)
      : undefined,
  );

  configRef.current = mergedConfig;

  // Execute lifecycle
  const executeLifecycle = useCallback(
    async (
      phase: LifecyclePhase,
      pluginName: string,
      context: PluginContext,
    ) => {
      try {
        await managerRef.current?.executeLifecycle({
          phase,
          pluginName,
          context: context as any,
          lifecycleConfig: configRef.current,
        });
      } catch (error: unknown) {
        if (onLifecycleError) {
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          onLifecycleError(errorObj);
        }
      }
    },
    [onLifecycleError],
  );

  // Add listener
  const addListener = useCallback((listener: LifecycleListener) => {
    managerRef.current?.addListener(listener);
  }, []);

  // Remove listener
  const removeListener = useCallback((listener: LifecycleListener) => {
    managerRef.current?.removeListener(listener);
  }, []);

  // Get performance metrics
  const getPerformanceMetrics = useCallback(
    () => managerRef.current?.getPerformanceMetrics() || new Map(),
    [],
  );

  // Clear performance metrics
  const clearPerformanceMetrics = useCallback(() => {
    managerRef.current?.clearPerformanceMetrics();
  }, []);

  // Cleanup
  useEffect(
    () => () => {
      managerRef.current?.destroy();
    },
    [],
  );

  return {
    executeLifecycle: executeLifecycle as any,
    addListener,
    removeListener,
    getPerformanceMetrics: getPerformanceMetrics as any,
    clearPerformanceMetrics,
  };
};

/**
 * Create lifecycle context Hook
 */
export const useLifecycleContext = () => {
  const executeLifecycleRef = useRef<
    UseLifecycleManagerResult['executeLifecycle'] | null
  >(null);

  const setExecuteLifecycle = useCallback(
    (executeLifecycle: UseLifecycleManagerResult['executeLifecycle']) => {
      executeLifecycleRef.current = executeLifecycle;
    },
    [],
  );

  const triggerLifecycle = useCallback(
    async (
      phase: LifecyclePhase,
      pluginName: string,
      context: PluginContext,
    ) => {
      if (executeLifecycleRef.current) {
        await executeLifecycleRef.current(phase, pluginName, context as any);
      }
    },
    [],
  );

  return {
    setExecuteLifecycle,
    triggerLifecycle,
  };
};
