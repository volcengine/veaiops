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
  FilterPlugin,
  FilterPluginHooks,
  PluginConfig,
} from '@veaiops/types';
import { filterPluginRegistry } from '../registry';

/**
 * Plugin extension manager
 * Provides dynamic configuration, hot loading, and extension functionality for plugins
 */
export class PluginExtensionManager {
  private hooks: Map<string, FilterPluginHooks> = new Map();
  private globalConfigs: Map<string, PluginConfig> = new Map();

  /**
   * Register plugin hooks
   */
  registerHooks({
    pluginType,
    hooks,
  }: {
    pluginType: string;
    hooks: FilterPluginHooks;
  }): void {
    this.hooks.set(pluginType, hooks);
  }

  /**
   * Get plugin hooks
   */
  getHooks(pluginType: string): FilterPluginHooks | undefined {
    return this.hooks.get(pluginType);
  }

  /**
   * Set plugin global configuration
   */
  setGlobalConfig({
    pluginType,
    config,
  }: {
    pluginType: string;
    config: PluginConfig;
  }): void {
    this.globalConfigs.set(pluginType, config);
  }

  /**
   * Get plugin global configuration
   */
  getGlobalConfig(pluginType: string): PluginConfig | undefined {
    return this.globalConfigs.get(pluginType);
  }

  /**
   * Merge configuration (global config + instance config)
   */
  mergeConfig(
    pluginType: string,
    instanceConfig: PluginConfig = {},
  ): PluginConfig {
    const globalConfig = this.globalConfigs.get(pluginType) || {};
    return { ...globalConfig, ...instanceConfig };
  }

  /**
   * Create enhanced version of plugin
   */
  enhancePlugin(
    plugin: FilterPlugin,
    overrides: Partial<FilterPlugin> = {},
  ): FilterPlugin {
    const hooks = this.getHooks(plugin.type);

    return {
      ...plugin,
      ...overrides,
      render: (props) => {
        let enhancedProps = props;

        // Apply beforeRender hook
        if (hooks?.beforeRender) {
          enhancedProps = hooks.beforeRender(props);
        }

        // Merge global configuration
        const mergedConfig = this.mergeConfig(
          plugin.type,
          enhancedProps.componentProps as PluginConfig,
        );
        enhancedProps = {
          ...enhancedProps,
          componentProps: mergedConfig,
        };

        // Render component
        let element = plugin.render(enhancedProps);

        // Apply afterRender hook
        if (hooks?.afterRender) {
          element = hooks.afterRender(element, enhancedProps);
        }

        return element;
      },
      validateConfig: (config) => {
        // First use plugin's own validation
        if (plugin.validateConfig && !plugin.validateConfig(config)) {
          return false;
        }

        // Then use hook validation
        if (hooks?.validateConfig) {
          const result = hooks.validateConfig(config);
          return typeof result === 'boolean' ? result : false;
        }

        return true;
      },
    };
  }

  /**
   * Batch enhance plugins and re-register
   */
  enhanceAndRegisterPlugins(
    plugins: FilterPlugin[],
    overrides: Record<string, Partial<FilterPlugin>> = {},
  ): void {
    plugins.forEach((plugin) => {
      const enhanced = this.enhancePlugin(plugin, overrides[plugin.type]);
      filterPluginRegistry.register(enhanced, { override: true });
    });
  }

  /**
   * Dynamically create plugin
   */
  createDynamicPlugin(config: {
    type: string;
    name: string;
    render: FilterPlugin['render'];
    validateConfig?: FilterPlugin['validateConfig'];
    defaultConfig?: PluginConfig;
    hooks?: FilterPluginHooks;
  }): FilterPlugin {
    const plugin: FilterPlugin = {
      type: config.type,
      name: config.name,
      render: config.render,
      validateConfig: config.validateConfig,
      defaultConfig: config.defaultConfig,
      version: '1.0.0-dynamic',
      description: `Dynamically created ${config.name} plugin`,
    };

    // Register hooks
    if (config.hooks) {
      this.registerHooks({ pluginType: config.type, hooks: config.hooks });
    }

    return plugin;
  }

  /**
   * Get all registered hooks
   */
  getAllHooks(): Record<string, FilterPluginHooks> {
    return Object.fromEntries(this.hooks.entries());
  }

  /**
   * Get all global configurations
   */
  getAllGlobalConfigs(): Record<string, PluginConfig> {
    return Object.fromEntries(this.globalConfigs.entries());
  }

  /**
   * Clear all extension data
   */
  clear(): void {
    this.hooks.clear();
    this.globalConfigs.clear();
  }

  /**
   * Get extension statistics
   */
  getStats(): {
    hooksCount: number;
    configsCount: number;
    plugins: string[];
    hooks: string[];
    configs: string[];
  } {
    return {
      hooksCount: this.hooks.size,
      configsCount: this.globalConfigs.size,
      plugins: Array.from(
        new Set([...this.hooks.keys(), ...this.globalConfigs.keys()]),
      ),
      hooks: Array.from(this.hooks.keys()),
      configs: Array.from(this.globalConfigs.keys()),
    };
  }
}

// Export singleton instance
export const pluginExtensionManager = new PluginExtensionManager();
