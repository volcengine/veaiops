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

import { PluginStatusEnum } from '@/custom-table/types/core/enums';
import { devLog } from '@/custom-table/utils';
/**
 * Plugin executor module
 * Responsible for plugin method invocation and rendering
 *
 * @date 2025-12-19
 */
import type { ReactNode } from 'react';
import type { PluginRegistry } from './plugin-registry';

/**
 * @name Plugin executor
 */
export interface PluginExecutorUseParams {
  pluginName: string;
  method: string;
  args?: unknown[];
}

export interface PluginExecutorRenderParams {
  pluginName: string;
  renderer: string;
  args?: unknown[];
}

export interface PluginExecutorUseBatchParams {
  method: string;
  args?: unknown[];
}

export interface PluginExecutorRenderBatchParams {
  renderer: string;
  args?: unknown[];
}

export class PluginExecutor {
  constructor(private registry: PluginRegistry) {}

  /**
   * @name Invoke plugin method
   */
  use<T>({
    pluginName,
    method,
    args = [],
  }: PluginExecutorUseParams): T | undefined {
    const plugin = this.registry.getPlugin(pluginName);
    if (!plugin) {
      devLog.log({
        component: 'PluginExecutor',
        message: `Plugin "${pluginName}" is not registered yet, method: ${method}`,
        data: {},
      });
      return undefined;
    }

    const hookFn = plugin.hooks?.[method];
    if (typeof hookFn !== 'function') {
      return undefined;
    }

    try {
      const startTime = performance.now();
      const result = hookFn(...args) as T | undefined;
      const endTime = performance.now();

      // Update performance metrics
      const instance = this.registry.getInstance(pluginName);
      if (instance) {
        instance.performance.lastExecutionTime = endTime - startTime;
      }

      return result;
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const instance = this.registry.getInstance(pluginName);
      if (instance) {
        instance.error = errorObj;
        this.registry.updatePluginStatus({
          pluginName,
          status: PluginStatusEnum.ERROR,
        });
      }
      // ✅ Correct: Use devLog to record errors and expose actual error information
      devLog.error({
        component: 'PluginExecutor',
        message: `Plugin method invocation failed`,
        data: {
          pluginName,
          method,
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
      });

      return undefined;
    }
  }

  /**
   * @name Render plugin component
   */
  render({
    pluginName,
    renderer,
    args = [],
  }: PluginExecutorRenderParams): ReactNode {
    const plugin = this.registry.getPlugin(pluginName);
    if (!plugin) {
      devLog.log({
        component: 'PluginExecutor',
        message: `Plugin "${pluginName}" is not registered yet, renderer: ${renderer}`,
        data: {},
      });
      return null;
    }

    const renderFn = plugin.render?.[renderer];
    if (typeof renderFn !== 'function') {
      return null;
    }

    try {
      const startTime = performance.now();
      const result = (renderFn as any)(...args);
      const endTime = performance.now();

      // Update performance metrics
      const instance = this.registry.getInstance(pluginName);
      if (instance) {
        instance.performance.renderTime = endTime - startTime;
      }

      return result;
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const instance = this.registry.getInstance(pluginName);
      if (instance) {
        instance.error = errorObj;
        this.registry.updatePluginStatus({
          pluginName,
          status: PluginStatusEnum.ERROR,
        });
      }
      // ✅ Correct: Use devLog to record errors and expose actual error information
      devLog.error({
        component: 'PluginExecutor',
        message: `Plugin rendering failed`,
        data: {
          pluginName,
          renderer,
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
      });

      return null;
    }
  }

  /**
   * @name Batch invoke plugin methods
   */
  useBatch<T>({ method, args = [] }: PluginExecutorUseBatchParams): T[] {
    const enabledPlugins = this.registry.getEnabledPlugins();
    const results: T[] = [];

    for (const plugin of enabledPlugins) {
      const result = this.use<T>({ pluginName: plugin.name, method, args });
      if (result !== undefined) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * @name Batch render plugin components
   */
  renderBatch({
    renderer,
    args = [],
  }: PluginExecutorRenderBatchParams): ReactNode[] {
    const enabledPlugins = this.registry.getEnabledPlugins();
    const results: ReactNode[] = [];

    for (const plugin of enabledPlugins) {
      const result = this.render({ pluginName: plugin.name, renderer, args });
      if (result !== null) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * @name Check if plugin supports specified method
   */
  hasMethod({
    pluginName,
    method,
  }: {
    pluginName: string;
    method: string;
  }): boolean {
    const plugin = this.registry.getPlugin(pluginName);
    return Boolean(plugin?.hooks?.[method]);
  }

  /**
   * @name Check if plugin supports specified renderer
   */
  hasRenderer({
    pluginName,
    renderer,
  }: {
    pluginName: string;
    renderer: string;
  }): boolean {
    const plugin = this.registry.getPlugin(pluginName);
    return Boolean(plugin?.render?.[renderer]);
  }
}
