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
 * Plugin utility functions module
 * Provides utility functions for the plugin system
 *
 * @date 2025-12-19
 */
import type {
  BaseQuery,
  BaseRecord,
  Plugin,
  PluginContext,
  PluginManager,
} from '@/custom-table/types';
import { devLog } from '@/custom-table/utils';
import type React from 'react';

/**
 * @name Initialize all plugins
 *
 * @returns Returns result object with format { success: boolean; error?: Error }
 */
export async function initializePlugins(
  pluginManager: PluginManager,
  context: PluginContext,
): Promise<{ success: boolean; error?: Error }> {
  try {
    // Set context for all plugins
    const plugins = pluginManager.getAllPlugins();
    plugins.forEach((plugin: Plugin) => {
      pluginManager.setPluginContext?.({ pluginName: plugin.name, context });
    });

    // Execute install and setup for each plugin in sequence, ensuring helpers/state are injected
    type PluginWithInstallSetup = Plugin & {
      install?: (context: PluginContext) => Promise<void>;
      setup?: (context: PluginContext) => Promise<void>;
    };

    let lastError: Error | undefined;

    for (const plugin of plugins) {
      try {
        const pluginWithMethods = plugin;
        if (typeof pluginWithMethods.install === 'function') {
          await pluginWithMethods.install(context);
        }
        if (typeof pluginWithMethods.setup === 'function') {
          await pluginWithMethods.setup(context);
        }
      } catch (error: unknown) {
        // ✅ Correct: Single plugin initialization failure should not block other plugins, but record error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        // Note: Only log here, don't throw error, because single plugin failure should not block other plugins
        devLog.warn({
          component: 'PluginUtils',
          message: `Plugin "${plugin.name}" initialization failed: ${errorObj.message}`,
          data: {
            pluginName: plugin.name,
            error: errorObj.message,
            stack: errorObj.stack,
          },
        });
        lastError = errorObj;
      }
    }

    // Execute initialization lifecycle (compatible with legacy onMount hook)
    // Note: executeHook may return result object or void, here we handle both cases
    try {
      // Note: executeHook's actual implementation returns result object, but interface is defined as void
      // Use type assertion to handle both cases, actual runtime returns result object
      const hookResult = await pluginManager.executeHook?.({
        lifecycle: 'onMount',
        context,
      });
      const result = hookResult as
        | { success: boolean; error?: Error }
        | void
        | undefined;
      // If result object is returned, check if successful
      if (result && typeof result === 'object' && 'success' in result) {
        if (!result.success && result.error) {
          devLog.error({
            component: 'PluginUtils',
            message: `onMount hook execution failed: ${result.error.message}`,
            data: {
              error: result.error.message,
              stack: result.error.stack,
              errorObj: result.error,
            },
          });
          lastError = result.error;
        }
      }
    } catch (error: unknown) {
      // ✅ Correct: Handle legacy version that may throw errors
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      devLog.error({
        component: 'PluginUtils',
        message: `onMount hook execution failed: ${errorObj.message}`,
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
      });
      lastError = errorObj;
    }

    // If any errors occurred, return failure result, but don't block entire initialization flow
    if (lastError) {
      return { success: false, error: lastError };
    }

    return { success: true };
  } catch (error: unknown) {
    // ✅ Correct: Record error and return failure result
    const errorObj = error instanceof Error ? error : new Error(String(error));
    devLog.error({
      component: 'PluginUtils',
      message: `Plugin initialization failed: ${errorObj.message}`,
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
      },
    });
    return { success: false, error: errorObj };
  }
}

/**
 * @name Cleanup all plugins
 *
 * @returns Returns result object with format { success: boolean; error?: Error }
 */
export async function cleanupPlugins(
  pluginManager: PluginManager,
  context: PluginContext,
): Promise<{ success: boolean; error?: Error }> {
  try {
    // Note: executeHook's actual implementation returns result object, but interface is defined as void
    // Use type assertion to handle both cases, actual runtime returns result object
    const hookResult = await pluginManager.executeHook?.({
      lifecycle: 'onDestroy',
      context,
    });
    const result = hookResult as
      | { success: boolean; error?: Error }
      | void
      | undefined;
    // If result object is returned, return directly; otherwise return success
    if (result && typeof result === 'object' && 'success' in result) {
      if (!result.success && result.error) {
        devLog.error({
          component: 'PluginUtils',
          message: `Plugin cleanup failed: ${result.error.message}`,
          data: {
            error: result.error.message,
            stack: result.error.stack,
            errorObj: result.error,
          },
        });
      }
      return result;
    }
    return { success: true };
  } catch (error: unknown) {
    // ✅ Correct: Handle legacy version that may throw errors
    const errorObj = error instanceof Error ? error : new Error(String(error));
    devLog.error({
      component: 'PluginUtils',
      message: `Plugin cleanup failed: ${errorObj.message}`,
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
      },
    });
    return { success: false, error: errorObj };
  }
}

/**
 * @name Enhance props
 */
export function enhanceProps(
  pluginManager: PluginManager,
  props: Record<string, unknown>,
  context: PluginContext,
): Record<string, unknown> {
  const enabledPlugins = pluginManager.getAllPlugins();
  let enhancedProps = { ...props };

  enabledPlugins.forEach((plugin: Plugin) => {
    if (plugin.enhanceProps && typeof plugin.enhanceProps === 'function') {
      try {
        const enhanced = plugin.enhanceProps(enhancedProps, context);
        if (enhanced && typeof enhanced === 'object') {
          enhancedProps = { ...enhancedProps, ...enhanced };
        }
      } catch (error: unknown) {
        // ✅ Correct: Record error but don't interrupt props enhancement flow
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        devLog.warn({
          component: 'PluginUtils',
          message: `Plugin "${plugin.name}" enhanceProps failed: ${errorObj.message}`,
          data: {
            pluginName: plugin.name,
            error: errorObj.message,
            stack: errorObj.stack,
          },
        });
      }
    }
  });

  return enhancedProps;
}

/**
 * @name Wrap component with plugins
 */
/**
 * wrapWithPlugins parameter interface
 */
interface WrapWithPluginsParams<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  pluginManager: PluginManager;
  content: React.ReactNode;
  context: PluginContext<RecordType, QueryType>;
}

export function wrapWithPlugins<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>({
  pluginManager,
  content,
  context,
}: WrapWithPluginsParams<RecordType, QueryType>): React.ReactNode {
  const enabledPlugins = pluginManager.getAllPlugins().filter(
    (plugin: Plugin) =>
      (
        plugin as unknown as {
          wrapComponent?: (
            node: React.ReactNode,
            ctx: PluginContext,
          ) => React.ReactNode;
        }
      ).wrapComponent &&
      typeof (
        plugin as unknown as {
          wrapComponent?: (
            node: React.ReactNode,
            ctx: PluginContext,
          ) => React.ReactNode;
        }
      ).wrapComponent === 'function',
  );

  let wrappedContent = content;

  enabledPlugins.forEach((plugin: Plugin) => {
    try {
      const wrap = (
        plugin as unknown as {
          wrapComponent?: (
            node: React.ReactNode,
            ctx: PluginContext,
          ) => React.ReactNode;
        }
      ).wrapComponent;
      if (wrap) {
        // Widen generic PluginContext<RecordType, QueryType> to base PluginContext for plugin wrappers
        wrappedContent = wrap(
          wrappedContent,
          context as unknown as PluginContext,
        );
      }
    } catch (error: unknown) {
      // ✅ Correct: Record error but don't interrupt component wrapping flow
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      devLog.warn({
        component: 'PluginUtils',
        message: `Plugin "${plugin.name}" wrapComponent failed: ${errorObj.message}`,
        data: {
          pluginName: plugin.name,
          error: errorObj.message,
          stack: errorObj.stack,
        },
      });
    }
  });

  return wrappedContent;
}

/**
 * @name Validate plugin configuration
 */
export function validatePluginConfig(plugin: unknown): boolean {
  if (!plugin || typeof plugin !== 'object') {
    return false;
  }

  const p = plugin as {
    name?: unknown;
    version?: unknown;
    dependencies?: unknown;
    conflicts?: unknown;
    priority?: unknown;
  };
  if (!p.name || typeof p.name !== 'string') {
    return false;
  }

  if (!p.version || typeof p.version !== 'string') {
    return false;
  }

  if (p.dependencies && !Array.isArray(p.dependencies)) {
    return false;
  }

  if (p.conflicts && !Array.isArray(p.conflicts)) {
    return false;
  }

  if (
    p.priority &&
    !['critical', 'high', 'medium', 'low'].includes(p.priority as string)
  ) {
    return false;
  }

  return true;
}

/**
 * @name Sort plugins
 */
export function sortPluginsByPriority<T extends { priority?: string }>(
  plugins: T[],
): T[] {
  const priorityMap = { critical: -1, high: 0, medium: 1, low: 2 };

  return [...plugins].sort((a, b) => {
    const aPriority =
      priorityMap[(a.priority as keyof typeof priorityMap) || 'low'] ?? 3;
    const bPriority =
      priorityMap[(b.priority as keyof typeof priorityMap) || 'low'] ?? 3;
    return aPriority - bPriority;
  });
}

/**
 * @name Check plugin dependencies
 */
export function checkPluginDependencies(
  plugin: { dependencies?: string[] },
  registeredPlugins: { name: string }[],
): { isValid: boolean; missingDeps: string[] } {
  if (!plugin.dependencies || plugin.dependencies.length === 0) {
    return { isValid: true, missingDeps: [] };
  }

  const registeredNames = registeredPlugins.map((p) => p.name);
  const missingDeps = plugin.dependencies.filter(
    (dep: string) => !registeredNames.includes(dep),
  );

  return {
    isValid: missingDeps.length === 0,
    missingDeps,
  };
}

/**
 * @name Check plugin conflicts
 */
export function checkPluginConflicts(
  plugin: { conflicts?: string[] },
  registeredPlugins: { name: string }[],
): { hasConflicts: boolean; conflicts: string[] } {
  if (!plugin.conflicts || plugin.conflicts.length === 0) {
    return { hasConflicts: false, conflicts: [] };
  }

  const registeredNames = registeredPlugins.map((p) => p.name);
  const conflicts = plugin.conflicts.filter((conf: string) =>
    registeredNames.includes(conf),
  );

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}
