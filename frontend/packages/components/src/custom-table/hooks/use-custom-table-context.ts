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
 * CustomTable Context Enhancement Hook
 * Responsible for handling plugin property enhancements and context management
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
import { useMemo } from 'react';

/**
 * Helper function to apply plugin property enhancements
 * @param enabledPlugins List of enabled plugins
 * @param baseContext Base context
 * @returns Enhanced properties
 */
const applyPluginEnhancements = <
  RecordType extends BaseRecord,
  QueryType extends BaseQuery,
>(
  enabledPlugins: Plugin[],
  baseContext: PluginContext<RecordType, QueryType>,
) => {
  let enhancedProps = { ...baseContext.props };

  for (const plugin of enabledPlugins) {
    if (plugin.enhanceProps && typeof plugin.enhanceProps === 'function') {
      try {
        const enhanced = plugin.enhanceProps(enhancedProps, baseContext as any);
        if (enhanced && typeof enhanced === 'object') {
          enhancedProps = { ...enhancedProps, ...enhanced };
        }
      } catch (error) {
        // Plugin property enhancement failed, skip this plugin (silent handling, does not affect other plugins)
      }
    }
  }

  return enhancedProps;
};

/**
 * @name Create enhanced table context
 * @description Apply property enhancements based on plugin system, return final context object
 */
export const useEnhancedTableContext = <
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(
  baseContext: PluginContext<RecordType, QueryType>,
  pluginManager: PluginManager,
): PluginContext<RecordType, QueryType> => {
  // Phase 3: Apply plugin property enhancements (if any)
  const enhancedContext = useMemo(() => {
    // Check if any plugins need property enhancement
    type PluginWithEnabled = Plugin & { enabled?: boolean };
    const enabledPlugins = pluginManager
      .getAllPlugins()
      .filter((p: Plugin): p is PluginWithEnabled => {
        const pluginWithEnabled = p as PluginWithEnabled;
        return Boolean(pluginWithEnabled.enabled);
      });
    const hasPropsEnhancer = enabledPlugins.some(
      (plugin: Plugin) =>
        plugin.enhanceProps && typeof plugin.enhanceProps === 'function',
    );

    if (!hasPropsEnhancer) {
      return baseContext; // No enhancer, return base context directly
    }

    // Safely apply property enhancements
    try {
      // Safely apply property enhancements
      const enhancedProps = applyPluginEnhancements(
        enabledPlugins,
        baseContext,
      );

      // Return new context with enhanced properties
      return {
        ...baseContext,
        props: enhancedProps,
      };
    } catch (error) {
      // Context enhancement failed, fallback to base context (silent handling)
      return baseContext;
    }
  }, [baseContext, pluginManager]);

  return enhancedContext;
};

export { useEnhancedTableContext as useCustomTableContext };
