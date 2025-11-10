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
  EventHandler,
  FilterEventBus,
  FilterPlugin,
  FilterPluginContext,
  PluginRegistryOptions,
} from '@veaiops/types';

// Simple event bus implementation
class EventBus implements FilterEventBus {
  private events: Map<string, EventHandler[]> = new Map();

  emit(event: string, ...args: unknown[]): void {
    const handlers = this.events.get(event) || [];
    handlers.forEach((handler) => handler(...args));
  }

  on({
    event,
    handler,
  }: {
    event: string;
    handler: EventHandler;
  }): void {
    const handlers = this.events.get(event) || [];
    handlers.push(handler);
    this.events.set(event, handlers);
  }

  off({
    event,
    handler,
  }: {
    event: string;
    handler: EventHandler;
  }): void {
    const handlers = this.events.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      this.events.set(event, handlers);
    }
  }
}

// Plugin registry
class FilterPluginRegistry {
  private plugins: Map<string, FilterPlugin> = new Map();
  private eventBus: FilterEventBus = new EventBus();
  private globalContext: FilterPluginContext = {
    eventBus: this.eventBus,
  };

  /**
   * Register plugin
   */
  register(plugin: FilterPlugin, options: PluginRegistryOptions = {}): void {
    const { override = false } = options;

    if (this.plugins.has(plugin.type) && !override) {
      return;
    }

    // Validate plugin dependencies
    if (plugin.dependencies) {
      const missingDeps = plugin.dependencies.filter(
        (dep) => !this.plugins.has(dep),
      );
      if (missingDeps.length > 0) {
        throw new Error(
          `Plugin "${plugin.type}" missing dependencies: ${missingDeps.join(
            ', ',
          )}`,
        );
      }
    }

    this.plugins.set(plugin.type, plugin);
    this.eventBus.emit('plugin:registered', plugin);
  }

  /**
   * Unregister plugin
   */
  unregister(type: string): boolean {
    const plugin = this.plugins.get(type);
    if (plugin) {
      this.plugins.delete(type);
      this.eventBus.emit('plugin:unregistered', plugin);

      return true;
    }
    return false;
  }

  /**
   * Get plugin
   */
  get(type: string): FilterPlugin | undefined {
    return this.plugins.get(type);
  }

  /**
   * Check if plugin exists
   */
  has(type: string): boolean {
    return this.plugins.has(type);
  }

  /**
   * Get all registered plugins
   */
  getAll(): FilterPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin type list
   */
  getTypes(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Batch register plugins
   */
  registerBatch(
    plugins: FilterPlugin[],
    options: PluginRegistryOptions = {},
  ): void {
    plugins.forEach((plugin) => this.register(plugin, options));
  }

  /**
   * Set global context
   */
  setGlobalContext(context: Partial<FilterPluginContext>): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  /**
   * Get global context
   */
  getGlobalContext(): FilterPluginContext {
    return this.globalContext;
  }

  /**
   * Get event bus
   */
  getEventBus(): FilterEventBus {
    return this.eventBus;
  }

  /**
   * Clear all plugins
   */
  clear(): void {
    this.plugins.clear();
    this.eventBus.emit('registry:cleared');
  }

  /**
   * Get plugin statistics
   */
  getStats(): {
    total: number;
    types: string[];
    plugins: { type: string; name: string; version?: string }[];
  } {
    const plugins = this.getAll();
    return {
      total: plugins.length,
      types: this.getTypes(),
      plugins: plugins.map((p) => ({
        type: p.type,
        name: p.name,
        version: p.version,
      })),
    };
  }
}

// Export singleton instance
export const filterPluginRegistry = new FilterPluginRegistry();

// Export class for custom use
export { FilterPluginRegistry };
