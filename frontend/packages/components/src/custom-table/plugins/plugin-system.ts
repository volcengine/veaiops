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
 * CustomTable Plugin System Implementation - Modular Refactored Version
 *
 * Provides a high-performance, extensible plugin management system based on modular architecture
 *
 * @date 2025-12-19
 */
import type {
  Plugin,
  PluginContext,
  PluginLifecycle,
  PluginManager,
} from '@/custom-table/types/plugins/core';
import {
  PluginEventSystem,
  PluginExecutor,
  PluginLifecycleManager,
  PluginPerformanceMonitor,
  PluginRegistry,
  validatePluginConfig,
} from './core';

/**
 * Create plugin manager
 */
export function createPluginManager(): PluginManager {
  // Create core modules
  const registry = new PluginRegistry();
  const lifecycleManager = new PluginLifecycleManager(registry);
  const executor = new PluginExecutor(registry);
  const performanceMonitor = new PluginPerformanceMonitor(registry);
  const eventSystem = new PluginEventSystem();

  return {
    // Plugin registration management
    register: async <Config = Record<string, unknown>>(
      plugin: Plugin<Config>,
    ): Promise<void> => {
      if (!validatePluginConfig(plugin)) {
        throw new Error(`Invalid plugin configuration for "${plugin.name}"`);
      }
      const result = await registry.register(
        plugin as Plugin<Record<string, unknown>>,
      );
      if (!result.success && result.error) {
        throw result.error;
      }
    },
    unregister: async (pluginName: string): Promise<void> => {
      registry.unregister(pluginName);
    },

    // Plugin query
    getPlugin: (pluginName: string) => registry.getPlugin(pluginName),
    getPlugins: () => registry.getPlugins(),
    getAllPlugins: () => registry.getPlugins(),
    getEnabledPlugins: () => registry.getEnabledPlugins(),
    isEnabled: (pluginName: string) => registry.isEnabled(pluginName),

    // Plugin lifecycle management
    enable: async (pluginName: string): Promise<void> => {
      const result = await lifecycleManager.enablePlugin(pluginName);
      if (!result.success && result.error) {
        throw result.error;
      }
    },
    disable: async (pluginName: string): Promise<void> => {
      const result = await lifecycleManager.disablePlugin(pluginName);
      if (!result.success && result.error) {
        throw result.error;
      }
    },
    executeHook: async ({
      lifecycle,
      context,
    }: {
      lifecycle: PluginLifecycle;
      context: any;
    }): Promise<void> => {
      const result = await lifecycleManager.executeHook({ lifecycle, context });
      if (!result.success && result.error) {
        throw result.error;
      }
    },

    // Plugin execution
    use: <T>({
      pluginName,
      method,
      args = [],
    }: { pluginName: string; method: string; args?: unknown[] }): T =>
      executor.use<T>({ pluginName, method, args }) as T,
    render: ({
      pluginName,
      renderer,
      args = [],
    }: { pluginName: string; renderer: string; args?: unknown[] }) =>
      executor.render({ pluginName, renderer, args }),

    // Performance monitoring
    getMetrics: () => performanceMonitor.getPerformanceMetrics(),

    // Event system
    emit: (event: string, ...args: unknown[]) =>
      eventSystem.emit(event, ...args),
    on: (event: string, listener: (...args: unknown[]) => void) =>
      eventSystem.on({ event, listener }),

    // Context management
    setPluginContext: ({
      pluginName,
      context,
    }: { pluginName: string; context: PluginContext }) =>
      registry.setPluginContext({ pluginName, context }),

    // Add missing properties and methods
    plugins: new Map(),
    metrics: performanceMonitor.getPerformanceMetrics(),
    isPluginEnabled: (pluginName: string) => registry.isEnabled(pluginName),
    isPluginInstalled: (pluginName: string) =>
      Boolean(registry.getPlugin(pluginName)),
    getActivePlugins: () => registry.getEnabledPlugins(),
    setup: async (_context: PluginContext) => {
      // Initialization setup
    },
  };
}

// Re-export utility functions for backward compatibility
export {
  cleanupPlugins,
  enhanceProps,
  initializePlugins,
  wrapWithPlugins,
} from './core';
