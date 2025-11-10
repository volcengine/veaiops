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

import type { Plugin, PluginContext, PluginStatus } from '@/custom-table/types';
/**
 * Plugin registration management module
 * Responsible for plugin registration, unregistration, and querying
 *
 * @date 2025-12-19
 */
import {
  PluginPriorityEnum,
  PluginStatusEnum,
} from '@/custom-table/types/core/enums';
import { devLog } from '@/custom-table/utils';

/**
 * @name Plugin instance information
 */
export interface PluginInstance {
  plugin: Plugin;
  context: PluginContext;
  status: PluginStatus;
  error?: Error;
  performance: {
    installTime: number;
    setupTime: number;
    renderTime: number;
    lastExecutionTime: number;
  };
}

/**
 * @name Plugin registry manager
 */
export class PluginRegistry {
  private plugins: Plugin[] = [];
  private pluginInstances: Map<string, PluginInstance> = new Map();

  /**
   * @name Register plugin
   *
   * @returns Returns result object with format { success: boolean; error?: Error }
   */
  async register(plugin: Plugin): Promise<{ success: boolean; error?: Error }> {
    try {
      // Check if plugin name already exists
      if (this.plugins.some((p) => p.name === plugin.name)) {
        devLog.log({
          component: 'PluginRegistry',
          message: `Plugin "${plugin.name}" is already registered, skipping.`,
        });
        return {
          success: false,
          error: new Error(`Plugin "${plugin.name}" is already registered`),
        };
      }

      // Check dependencies
      if (plugin.dependencies?.length) {
        const missingDeps = plugin.dependencies.filter(
          (dep: string) => !this.plugins.some((p) => p.name === dep),
        );

        if (missingDeps.length) {
          return {
            success: false,
            error: new Error(`Missing dependencies: ${missingDeps.join(', ')}`),
          };
        }
      }

      // Check conflicts
      if (plugin.conflicts?.length) {
        const conflicting = plugin.conflicts.filter((conf: string) =>
          this.plugins.some((p) => p.name === conf),
        );

        if (conflicting.length) {
          return {
            success: false,
            error: new Error(
              `Conflicts with plugins: ${conflicting.join(', ')}`,
            ),
          };
        }
      }

      // Record installation time
      const installStartTime = performance.now();

      // Add to plugin list
      this.plugins.push(plugin);

      // Record installation end time and create instance
      const installEndTime = performance.now();
      const installTime = installEndTime - installStartTime;

      this.pluginInstances.set(plugin.name, {
        plugin,
        context: {} as PluginContext, // Initialize as empty, set later
        status: PluginStatusEnum.INSTALLED,
        performance: {
          installTime,
          setupTime: 0,
          renderTime: 0,
          lastExecutionTime: 0,
        },
      });

      // Sort by priority
      const priorityMap = {
        [PluginPriorityEnum.CRITICAL]: -1,
        [PluginPriorityEnum.HIGH]: 0,
        [PluginPriorityEnum.MEDIUM]: 1,
        [PluginPriorityEnum.LOW]: 2,
      } as const;
      this.plugins.sort((a, b) => {
        const aPriority =
          priorityMap[a.priority as keyof typeof priorityMap] || 3;
        const bPriority =
          priorityMap[b.priority as keyof typeof priorityMap] || 3;
        return aPriority - bPriority;
      });

      return { success: true };
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      return { success: false, error: errorObj };
    }
  }

  /**
   * @name Unregister plugin
   *
   * @returns Returns result object with format { success: boolean; error?: Error }
   */
  async unregister(
    pluginName: string,
  ): Promise<{ success: boolean; error?: Error }> {
    const plugin = this.getPlugin(pluginName);
    if (!plugin) {
      return {
        success: false,
        error: new Error(`Plugin "${pluginName}" does not exist`),
      };
    }

    const instance = this.pluginInstances.get(pluginName);
    let uninstallError: Error | undefined;

    if (instance && plugin.uninstall) {
      try {
        await plugin.uninstall(instance.context);
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        // ✅ Correct: Use devLog to record errors and expose actual error information
        devLog.error({
          component: 'PluginRegistry',
          message: `Plugin "${pluginName}" uninstallation failed`,
          data: {
            pluginName,
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
        });
        uninstallError = errorObj;
      }
    }

    // Remove from list
    const index = this.plugins.findIndex((p) => p.name === pluginName);
    if (index > -1) {
      this.plugins.splice(index, 1);
    }

    // Remove instance
    this.pluginInstances.delete(pluginName);

    // If uninstallation process has errors, return error info, but plugin has been successfully removed from registry
    if (uninstallError) {
      return { success: false, error: uninstallError };
    }

    return { success: true };
  }

  /**
   * @name Get specified plugin
   */
  getPlugin(pluginName: string): Plugin | undefined {
    return this.plugins.find((p) => p.name === pluginName);
  }

  /**
   * @name Get all plugins
   */
  getPlugins(): Plugin[] {
    return [...this.plugins];
  }

  /**
   * @name Get enabled plugins
   */
  getEnabledPlugins(): Plugin[] {
    return this.plugins.filter((p) => p.enabled);
  }

  /**
   * @name Get plugin instance
   */
  getInstance(pluginName: string): PluginInstance | undefined {
    return this.pluginInstances.get(pluginName);
  }

  /**
   * @name Check if plugin is enabled
   */
  isEnabled(pluginName: string): boolean {
    const plugin = this.getPlugin(pluginName);
    return plugin ? (plugin.enabled ?? false) : false;
  }

  /**
   * @name Set plugin context
   */
  setPluginContext({
    pluginName,
    context,
  }: { pluginName: string; context: PluginContext }): void {
    const instance = this.pluginInstances.get(pluginName);
    if (instance) {
      instance.context = context;
    }
  }

  /**
   * @name Update plugin status
   */
  updatePluginStatus({
    pluginName,
    status,
  }: { pluginName: string; status: PluginStatus }): void {
    const instance = this.pluginInstances.get(pluginName);
    if (instance) {
      instance.status = status;
    }
  }

  /**
   * @name Clear all plugins
   */
  clear(): void {
    this.plugins = [];
    this.pluginInstances.clear();
  }
}
