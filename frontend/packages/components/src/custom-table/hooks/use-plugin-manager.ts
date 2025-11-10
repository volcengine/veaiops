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

import {
  DEFAULT_FEATURES,
  DEFAULT_PLUGINS,
  FEATURE_PLUGIN_MAP,
  type FeatureFlags,
} from '@/custom-table/constants';
import { logCollector } from '@/custom-table/log-collector';
import {
  createPluginManager,
  initializePlugins,
} from '@/custom-table/plugins/plugin-system';
import type { Plugin } from '@/custom-table/types/plugins/core';
import { devLog } from '@/custom-table/utils/log-utils';
import type { BaseQuery, BaseRecord, PluginContext } from '@veaiops/types';
/**
 * CustomTable plugin management Hook
 */
import { useEffect, useMemo, useState } from 'react';

/**
 * Plugin management Hook
 */
const usePluginManager = <
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(
  props: {
    features?: Partial<FeatureFlags>;
    plugins?: string[];
  },
  context: PluginContext<RecordType, QueryType>,
) => {
  // Plugin ready state
  const [pluginsReady, setPluginsReady] = useState(false);

  // Dynamic plugin combination
  const activePlugins = useMemo(() => {
    if (props.plugins) {
      return props.plugins;
    }

    const features = { ...DEFAULT_FEATURES, ...props.features };
    const activePluginNames: string[] = [];

    // Dynamically combine plugins based on feature flags
    Object.entries(features).forEach(([feature, enabled]) => {
      if (enabled && feature in FEATURE_PLUGIN_MAP) {
        const featureKey = feature;
        activePluginNames.push(
          ...(FEATURE_PLUGIN_MAP as Record<string, readonly string[]>)[
            featureKey
          ],
        );
      }
    });

    return activePluginNames;
  }, [props.features, props.plugins]);

  // Filter default plugins - only keep active plugins
  const filteredPlugins = useMemo(
    () =>
      DEFAULT_PLUGINS.filter((plugin) => activePlugins.includes(plugin.name)),
    [activePlugins],
  );

  // Create plugin manager - ensure singleton pattern
  const pluginManager = useMemo(() => {
    const manager = createPluginManager();
    devLog.log({
      component: 'usePluginManager',
      message: 'Created plugin manager instance',
    });
    return manager;
  }, []);

  // Diagnostic log: Plugin registration counter (log only, does not change logic)
  const registerCounterRef = useMemo(() => {
    return new Map<string, number>();
  }, []);

  // Initialize plugins - optimize dependencies to reduce repeated initialization
  useEffect(() => {
    const initPlugins = async () => {
      try {
        devLog.log({
          component: 'usePluginManager',
          message: 'Initializing plugins:',
          data: {
            count: filteredPlugins.length,
            pluginNames: filteredPlugins.map((p) => p.name),
          },
        });

        // Reset plugin ready state to prevent concurrent initialization
        setPluginsReady(false);

        // Batch register plugins
        await Promise.all(
          filteredPlugins.map(async (plugin) => {
            // Diagnostic log: Count plugin registration times (idempotency check log only)
            const key = plugin.name;
            const prev = registerCounterRef.get(key) || 0;
            registerCounterRef.set(key, prev + 1);
            devLog.log({
              component: 'usePluginManager',
              message: 'Plugin register attempt',
              data: {
                name: key,
                attempt: prev + 1,
                timestamp: Date.now(),
              },
            });

            await pluginManager.register(plugin);
            // Log plugin registration
            const pluginType = (plugin as Plugin & { type?: string }).type;
            logCollector.logPluginRegister({
              pluginName: plugin.name,
              pluginType: pluginType || 'unknown',
            });
            return plugin;
          }),
        );

        // Set plugin context
        filteredPlugins.forEach((plugin) => {
          pluginManager.setPluginContext({
            pluginName: plugin.name,
            context: context as any,
          });
        });

        // Initialize plugins
        const initResult = await initializePlugins(
          pluginManager,
          context as any,
        );
        if (initResult.success) {
          devLog.log({
            component: 'usePluginManager',
            message: 'All plugins initialized successfully',
          });
          // Record plugin initialization
          filteredPlugins.forEach((plugin) => {
            logCollector.logPluginInit({ pluginName: plugin.name });
          });
          setPluginsReady(true);
        } else if (initResult.error) {
          // ✅ Correct: Judge based on return result, error information has been recorded in initializePlugins
          // Some plugins failed to initialize, but still set ready to true (because other plugins may have initialized successfully)
          devLog.warn({
            component: 'usePluginManager',
            message: 'Some plugins failed to initialize',
            data: {
              error: initResult.error.message,
              pluginNames: filteredPlugins.map((p) => p.name),
            },
          });
          setPluginsReady(true); // Allow to continue, because some plugins may have succeeded
        }
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        // ✅ Correct: Extract actual error information
        devLog.error({
          component: 'usePluginManager',
          message: 'Plugin init failed',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
            pluginNames: filteredPlugins.map((p) => p.name),
          },
        });
        setPluginsReady(false);
      }
    };

    // Only re-initialize when necessary
    if (filteredPlugins.length > 0) {
      initPlugins();
    }
  }, [pluginManager, filteredPlugins, registerCounterRef]); // Include registerCounterRef dependency

  // Update plugin context when context changes, and re-run each plugin's setup to inject helpers
  useEffect(() => {
    const rebindContextAndSetup = async () => {
      if (!pluginsReady || filteredPlugins.length === 0) {
        return;
      }

      devLog.log({
        component: 'usePluginManager',
        message: 'Rebind context & setup',
        data: {
          pluginsReady,
          pluginCount: filteredPlugins.length,
          timestamp: Date.now(),
        },
      });

      // 1) Update plugin context, bind latest helpers/state references
      filteredPlugins.forEach((plugin) => {
        pluginManager.setPluginContext({
          pluginName: plugin.name,
          context: context as any,
        });
      });

      // 2) Re-execute each plugin's setup to ensure methods like detectAndSaveColumnWidths are injected into helpers
      for (const plugin of filteredPlugins) {
        try {
          const maybeSetup = (
            plugin as unknown as {
              setup?: (ctx: PluginContext<BaseRecord, BaseQuery>) => unknown;
            }
          ).setup;
          if (typeof maybeSetup === 'function') {
            await maybeSetup(
              context as unknown as PluginContext<BaseRecord, BaseQuery>,
            );
          }
        } catch (error: unknown) {
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          // ✅ Correct: Expose actual error information
          devLog.error({
            component: 'usePluginManager',
            message: 'Plugin setup error',
            data: {
              name: (plugin as any)?.name,
              error: errorObj.message,
              stack: errorObj.stack,
              errorObj,
            },
          });
        }
      }
    };

    rebindContextAndSetup();
  }, [context, pluginsReady, filteredPlugins, pluginManager]);

  return {
    pluginManager,
    activePlugins,
    filteredPlugins,
    pluginsReady,
  };
};

export { usePluginManager };
