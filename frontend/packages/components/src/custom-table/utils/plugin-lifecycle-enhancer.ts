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

/**
 * Plugin lifecycle enhancer
 * Inject user-configured lifecycle callbacks into plugins
 */
import type { PluginLifecycle } from '@/custom-table/plugins';
import type { PluginContext } from '@/custom-table/types/plugins/core/context';
import type { Plugin } from '@/custom-table/types/plugins/core/plugin';
import type {
  CustomTableLifecycleConfig,
  LifecyclePhase,
} from '@/custom-table/types/plugins/lifecycle';
import {
  type LifecycleManager,
  createLifecycleManager,
} from './lifecycle-manager';
import { devLog } from './log-utils';

/**
 * Parameters interface for enhancing plugin lifecycle methods
 */
export interface EnhancePluginLifecycleParams<
  Config = Record<string, unknown>,
> {
  plugin: Plugin<Config>;
  lifecycleConfig?: CustomTableLifecycleConfig;
  lifecycleManager?: LifecycleManager;
}

/**
 * Enhance plugin lifecycle methods
 */
export function enhancePluginLifecycle<Config = Record<string, unknown>>({
  plugin,
  lifecycleConfig,
  lifecycleManager,
}: EnhancePluginLifecycleParams<Config>): Plugin<Config> {
  // If no lifecycle configuration, return original plugin directly
  if (!lifecycleConfig) {
    return plugin;
  }

  const manager = lifecycleManager || createLifecycleManager();

  // Create enhanced plugin
  const enhancedPlugin: Plugin<Config> = {
    ...plugin,
    // Enhance beforeMount
    beforeMount: createEnhancedLifecycleMethod({
      originalMethod: plugin.beforeMount,
      phase: 'beforeMount',
      pluginName: plugin.name,
      manager,
      lifecycleConfig,
    }),
    // Enhance afterMount
    afterMount: createEnhancedLifecycleMethod({
      originalMethod: plugin.afterMount,
      phase: 'afterMount',
      pluginName: plugin.name,
      manager,
      lifecycleConfig,
    }),
    // Enhance beforeUpdate
    beforeUpdate: createEnhancedLifecycleMethod({
      originalMethod: plugin.beforeUpdate,
      phase: 'beforeUpdate',
      pluginName: plugin.name,
      manager,
      lifecycleConfig,
    }),
    // Enhance afterUpdate
    afterUpdate: createEnhancedLifecycleMethod({
      originalMethod: plugin.afterUpdate,
      phase: 'afterUpdate',
      pluginName: plugin.name,
      manager,
      lifecycleConfig,
    }),
    // Enhance beforeUnmount
    beforeUnmount: createEnhancedLifecycleMethod({
      originalMethod: plugin.beforeUnmount,
      phase: 'beforeUnmount',
      pluginName: plugin.name,
      manager,
      lifecycleConfig,
    }),
    // Enhance uninstall method
    uninstall: createEnhancedLifecycleMethod({
      originalMethod: plugin.uninstall,
      phase: 'uninstall',
      pluginName: plugin.name,
      manager,
      lifecycleConfig,
    }),
  };

  return enhancedPlugin;
}

/**
 * Parameters interface for creating enhanced lifecycle method
 */
interface CreateEnhancedLifecycleMethodParams {
  originalMethod: ((context: PluginContext) => void) | undefined;
  phase: LifecyclePhase;
  pluginName: string;
  manager: LifecycleManager;
  lifecycleConfig: CustomTableLifecycleConfig;
}

/**
 * Create enhanced lifecycle method
 */
function createEnhancedLifecycleMethod({
  originalMethod,
  phase,
  pluginName,
  manager,
  lifecycleConfig,
}: CreateEnhancedLifecycleMethodParams): (
  context: PluginContext,
) => Promise<void> {
  return async (context: PluginContext): Promise<void> => {
    try {
      // 1. Execute user-configured pre-callbacks
      await manager.executeLifecycle({
        phase,
        pluginName,
        context,
        lifecycleConfig,
      });

      // 2. Execute original plugin lifecycle method
      if (originalMethod) {
        await Promise.resolve(originalMethod(context));
      }
    } catch (error: unknown) {
      // Decide whether to re-throw error based on error handling strategy
      const errorHandling = lifecycleConfig.errorHandling || 'warn';
      if (errorHandling === 'throw') {
        throw error;
      }
      // ✅ Correct: Use devLog to record errors and show actual error information
      // If error handling strategy is not 'throw', record error log (not shown to user interface)
      // Note: This is internal error handling for plugin lifecycle enhancer, errors are already handled within plugin
      // Here only log, don't show error message to user
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      devLog.warn({
        component: 'PluginLifecycleEnhancer',
        message: `Plugin "${pluginName}" lifecycle method "${phase}" failed: ${errorObj.message}`,
        data: {
          pluginName,
          phase,
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
      });
    }
  };
}

/**
 * Parameters interface for batch enhancing plugin list
 */
export interface EnhancePluginsLifecycleParams<
  Config = Record<string, unknown>,
> {
  plugins: Plugin<Config>[];
  lifecycleConfig?: CustomTableLifecycleConfig;
  lifecycleManager?: LifecycleManager;
}

/**
 * Batch enhance plugin list
 */
export function enhancePluginsLifecycle<Config = Record<string, unknown>>({
  plugins,
  lifecycleConfig,
  lifecycleManager,
}: EnhancePluginsLifecycleParams<Config>): Plugin<Config>[] {
  if (!lifecycleConfig) {
    return plugins;
  }

  const manager = lifecycleManager || createLifecycleManager();

  return plugins.map((plugin) =>
    enhancePluginLifecycle({
      plugin,
      lifecycleConfig,
      lifecycleManager: manager,
    }),
  );
}

/**
 * Parameters interface for adding lifecycle trigger to plugin context
 */
export interface AddLifecycleTriggerToContextParams {
  context: PluginContext;
  lifecycleManager: LifecycleManager;
  lifecycleConfig?: CustomTableLifecycleConfig;
}

/**
 * Add lifecycle trigger to plugin context
 */
export function addLifecycleTriggerToContext({
  context,
  lifecycleManager,
  lifecycleConfig,
}: AddLifecycleTriggerToContextParams): PluginContext {
  const enhancedContext = { ...context };

  // Add lifecycle trigger to helpers
  if (!enhancedContext.helpers.lifecycle) {
    enhancedContext.helpers.lifecycle = {
      trigger: async ({
        phase,
        pluginName,
      }: {
        phase: PluginLifecycle;
        pluginName: string;
      }) => {
        if (lifecycleConfig) {
          await lifecycleManager.executeLifecycle({
            phase,
            pluginName,
            context: enhancedContext,
            lifecycleConfig,
          });
        }
      },
      addListener: (listener: (phase: string, ...args: unknown[]) => void) => {
        lifecycleManager.addListener(listener as any);
      },
      removeListener: (
        listener: (phase: string, ...args: unknown[]) => void,
      ) => {
        lifecycleManager.removeListener(listener as any);
      },
      getMetrics: () => {
        const metrics = lifecycleManager.getPerformanceMetrics();
        const result: Record<string, unknown> = {};
        metrics.forEach((value, key) => {
          result[key] = value;
        });
        return result;
      },
    };
  }

  return enhancedContext;
}

/**
 * Check if plugin supports lifecycle
 */
export function hasLifecycleSupport(plugin: Plugin): boolean {
  return Boolean(
    plugin.beforeMount ||
      plugin.afterMount ||
      plugin.beforeUpdate ||
      plugin.afterUpdate ||
      plugin.beforeUnmount ||
      plugin.uninstall,
  );
}

/**
 * Get lifecycle phases supported by plugin
 */
export function getPluginLifecyclePhases(plugin: Plugin): LifecyclePhase[] {
  const phases: LifecyclePhase[] = [];

  if (plugin.beforeMount) {
    phases.push('beforeMount');
  }
  if (plugin.afterMount) {
    phases.push('afterMount');
  }
  if (plugin.beforeUpdate) {
    phases.push('beforeUpdate');
  }
  if (plugin.afterUpdate) {
    phases.push('afterUpdate');
  }
  if (plugin.beforeUnmount) {
    phases.push('beforeUnmount');
  }
  if (plugin.uninstall) {
    phases.push('uninstall');
  }

  return phases;
}
