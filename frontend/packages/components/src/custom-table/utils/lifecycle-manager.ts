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

import type { PluginContext } from '@/custom-table/types/plugins/core/context';
import type {
  CustomTableLifecycleConfig,
  LifecycleCallback,
  LifecycleExecutionContext,
  LifecycleListener,
  LifecycleManagerConfig,
  LifecyclePhase,
  PluginLifecycleConfig,
  PluginSpecificLifecycleConfig,
} from '@/custom-table/types/plugins/lifecycle';
/**
 * Lifecycle manager
 * Responsible for handling the execution and management of plugin lifecycle callbacks
 */
import type { BaseQuery, BaseRecord } from '@veaiops/types';
import { devLog } from './log-utils';

/**
 * Parameters interface for executing lifecycle callbacks
 */
interface ExecuteLifecycleParams<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  phase: LifecyclePhase;
  pluginName: string;
  context: PluginContext<RecordType, QueryType>;
  lifecycleConfig?: CustomTableLifecycleConfig;
}

/**
 * Parameters interface for collecting callbacks to execute
 */
interface CollectCallbacksParams {
  phase: LifecyclePhase;
  pluginName: string;
  userConfig?: CustomTableLifecycleConfig;
}

/**
 * Parameters interface for getting callback functions from configuration
 */
interface GetCallbackFromConfigParams {
  config: PluginLifecycleConfig;
  phase: LifecyclePhase;
}

/**
 * Parameters interface for getting plugin-specific configuration
 */
interface GetPluginConfigParams {
  pluginsConfig: PluginSpecificLifecycleConfig;
  pluginName: string;
}

/**
 * Parameters interface for executing callback list
 */
interface ExecuteCallbacksParams<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  callbacks: LifecycleCallback[];
  context: PluginContext<RecordType, QueryType>;
}

/**
 * Parameters interface for executing callback with timeout
 */
interface ExecuteWithTimeoutParams<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  callback: LifecycleCallback;
  context: PluginContext<RecordType, QueryType>;
  timeout: number;
}

/**
 * Parameters interface for handling lifecycle errors
 */
interface HandleLifecycleErrorParams {
  error: Error;
  phase: LifecyclePhase;
  pluginName: string;
  userConfig?: CustomTableLifecycleConfig;
}

/**
 * Lifecycle manager class
 */
export class LifecycleManager {
  private config: LifecycleManagerConfig;
  private listeners: LifecycleListener[] = [];
  private performanceMetrics: Map<string, number> = new Map();

  constructor(config: LifecycleManagerConfig = {}) {
    this.config = {
      enablePerformanceMonitoring: false,
      timeout: 5000, // Default 5 second timeout
      ...config,
    };

    if (config.listeners) {
      this.listeners = [...config.listeners];
    }
  }

  /**
   * Execute lifecycle callbacks
   */
  async executeLifecycle<
    RecordType extends BaseRecord = BaseRecord,
    QueryType extends BaseQuery = BaseQuery,
  >({
    phase,
    pluginName,
    context,
    lifecycleConfig: userConfig,
  }: ExecuteLifecycleParams<RecordType, QueryType>): Promise<void> {
    const startTime = Date.now();
    const executionContext: LifecycleExecutionContext = {
      phase,
      pluginName,
      startTime,
      timestamp: startTime,
      context: context as unknown as PluginContext<BaseRecord, BaseQuery>,
    };

    try {
      // Trigger listeners
      this.listeners.forEach((listener) => {
        try {
          listener(executionContext);
        } catch (error: unknown) {
          // ✅ Correct: Use devLog to record errors and show actual error information
          // Record error but don't interrupt execution of other listeners
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          devLog.warn({
            component: 'LifecycleManager',
            message: `生命周期监听器执行失败: ${errorObj.message}`,
            data: {
              phase: executionContext.phase,
              pluginName: executionContext.pluginName,
              error: errorObj.message,
              stack: errorObj.stack,
              errorObj,
            },
          });
        }
      });

      // Collect callbacks to execute
      const callbacks = this.collectCallbacks({
        phase,
        pluginName,
        userConfig,
      });

      // Execute callbacks
      await this.executeCallbacks<RecordType, QueryType>({
        callbacks,
        context,
      });

      // Record performance metrics
      if (this.config.enablePerformanceMonitoring) {
        const duration = Date.now() - startTime;
        const key = `${pluginName}-${phase}`;
        this.performanceMetrics.set(key, duration);

        // In debug mode, additional log output can be added here
      }
    } catch (error) {
      // Note: handleLifecycleError expects object parameters, use object destructuring to pass
      this.handleLifecycleError({
        error: error as Error,
        phase,
        pluginName,
        userConfig,
      });
    }
  }

  /**
   * Collect callbacks to execute
   */
  private collectCallbacks({
    phase,
    pluginName,
    userConfig,
  }: {
    phase: LifecyclePhase;
    pluginName: string;
    userConfig?: CustomTableLifecycleConfig;
  }): LifecycleCallback[] {
    const callbacks: LifecycleCallback[] = [];

    if (!userConfig) {
      return callbacks;
    }

    // Global configuration callbacks
    if (userConfig.global) {
      const globalCallback = this.getCallbackFromConfig({
        config: userConfig.global,
        phase,
      });
      if (globalCallback) {
        callbacks.push(globalCallback);
      }
    }

    // Plugin-specific configuration callbacks
    if (userConfig.plugins) {
      const pluginConfig = this.getPluginConfig({
        pluginsConfig: userConfig.plugins,
        pluginName,
      });
      if (pluginConfig) {
        const pluginCallback = this.getCallbackFromConfig({
          config: pluginConfig,
          phase,
        });
        if (pluginCallback) {
          callbacks.push(pluginCallback);
        }
      }
    }

    return callbacks;
  }

  /**
   * Get callback function from configuration
   */
  private getCallbackFromConfig({
    config,
    phase,
  }: {
    config: PluginLifecycleConfig;
    phase: LifecyclePhase;
  }): LifecycleCallback | undefined {
    switch (phase) {
      case 'beforeMount':
        return config.beforeMount;
      case 'afterMount':
        return config.afterMount;
      case 'beforeUpdate':
        return config.beforeUpdate;
      case 'afterUpdate':
        return config.afterUpdate;
      case 'beforeUnmount':
        return config.beforeUnmount;
      case 'uninstall':
        return config.onUninstall;
      default:
        return undefined;
    }
  }

  /**
   * Get plugin-specific configuration
   */
  private getPluginConfig({
    pluginsConfig,
    pluginName,
  }: {
    pluginsConfig: PluginSpecificLifecycleConfig;
    pluginName: string;
  }): PluginLifecycleConfig | undefined {
    // Map plugin name to configuration key
    const configKey = this.mapPluginNameToConfigKey(pluginName);
    return configKey ? pluginsConfig[configKey] : undefined;
  }

  /**
   * Map plugin name to configuration key
   */
  private mapPluginNameToConfigKey(
    pluginName: string,
  ): keyof PluginSpecificLifecycleConfig | undefined {
    const mapping: Record<string, keyof PluginSpecificLifecycleConfig> = {
      'data-source': 'dataSource',
      'table-alert': 'tableAlert',
      'table-columns': 'tableColumns',
      'table-filter': 'tableFilter',
      'table-pagination': 'tablePagination',
      'table-sorting': 'tableSorting',
      'query-sync': 'querySync',
    };

    return mapping[pluginName];
  }

  /**
   * Execute callback list
   */
  private async executeCallbacks<
    RecordType extends BaseRecord = BaseRecord,
    QueryType extends BaseQuery = BaseQuery,
  >({
    callbacks,
    context,
  }: ExecuteCallbacksParams<RecordType, QueryType>): Promise<void> {
    const promises = callbacks.map((callback) =>
      this.executeWithTimeout({
        callback,
        context,
        timeout: this.config.timeout || 5000,
      }),
    );

    await Promise.allSettled(promises);
  }

  /**
   * Execute callback with timeout
   */
  private async executeWithTimeout<
    RecordType extends BaseRecord = BaseRecord,
    QueryType extends BaseQuery = BaseQuery,
  >({
    callback,
    context,
    timeout,
  }: {
    callback: LifecycleCallback;
    context: PluginContext<RecordType, QueryType>;
    timeout: number;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Lifecycle callback timeout after ${timeout}ms`));
      }, timeout);

      Promise.resolve(
        callback(context as unknown as PluginContext<BaseRecord, BaseQuery>),
      )
        .then(() => {
          clearTimeout(timeoutId);
          resolve();
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error instanceof Error ? error : new Error(String(error)));
        });
    });
  }

  /**
   * Handle lifecycle errors
   */
  private handleLifecycleError({
    error,
    phase,
    pluginName,
    userConfig,
  }: {
    error: Error;
    phase: LifecyclePhase;
    pluginName: string;
    userConfig?: CustomTableLifecycleConfig;
  }): void {
    const errorHandling = userConfig?.errorHandling || 'warn';

    switch (errorHandling) {
      case 'ignore':
        // ✅ Correct: Use devLog to record error and pass through actual error info
        // Silently ignore error but still log for debugging
        devLog.warn({
          component: 'LifecycleManager',
          message: `忽略生命周期错误 (${pluginName}/${phase}): ${error.message}`,
          data: {
            pluginName,
            phase,
            error: error.message,
            stack: error.stack,
            errorObj: error,
          },
        });
        break;
      case 'warn':
        // ✅ Correct: Use devLog to record error and pass through actual error info
        devLog.warn({
          component: 'LifecycleManager',
          message: `生命周期执行警告 (${pluginName}/${phase}): ${error.message}`,
          data: {
            pluginName,
            phase,
            error: error.message,
            stack: error.stack,
            errorObj: error,
          },
        });
        break;
      case 'throw':
        throw error;
      default:
        // ✅ Correct: Use devLog to record error and pass through actual error info
        // Default behavior: log warning
        devLog.warn({
          component: 'LifecycleManager',
          message: `生命周期执行警告 (${pluginName}/${phase}): ${error.message}`,
          data: {
            pluginName,
            phase,
            error: error.message,
            stack: error.stack,
            errorObj: error,
          },
        });
    }
  }

  /**
   * Add lifecycle listener
   */
  addListener(listener: LifecycleListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remove lifecycle listener
   */
  removeListener(listener: LifecycleListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): Map<string, number> {
    return new Map(this.performanceMetrics);
  }

  /**
   * Clear performance metrics
   */
  clearPerformanceMetrics(): void {
    this.performanceMetrics.clear();
  }

  /**
   * Destroy manager
   */
  destroy(): void {
    this.listeners.length = 0;
    this.performanceMetrics.clear();
  }
}

/**
 * Create default lifecycle manager instance
 */
export function createLifecycleManager(
  config?: LifecycleManagerConfig,
): LifecycleManager {
  return new LifecycleManager(config);
}

/**
 * Merge lifecycle configurations
 */
export function mergeLifecycleConfigs(
  ...configs: (CustomTableLifecycleConfig | undefined)[]
): CustomTableLifecycleConfig {
  const merged: CustomTableLifecycleConfig = {
    global: {},
    plugins: {},
    debug: false,
    errorHandling: 'warn',
  };

  configs.forEach((config) => {
    if (!config) {
      return;
    }

    // Merge global configuration
    if (config.global) {
      merged.global = { ...merged.global, ...config.global };
    }

    // Merge plugin configuration
    if (config.plugins) {
      merged.plugins = { ...merged.plugins, ...config.plugins };
    }

    // Merge other options
    if (config.debug !== undefined) {
      merged.debug = config.debug;
    }

    if (config.errorHandling) {
      merged.errorHandling = config.errorHandling;
    }
  });

  return merged;
}
