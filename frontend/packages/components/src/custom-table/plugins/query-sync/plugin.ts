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
  Plugin,
  PluginContext,
  QuerySyncConfig,
} from '@/custom-table/types';
/**
 * Query Parameter Sync Plugin
 *
 * Synchronizes table query parameters with URL search parameters
 */
import { PluginPriorityEnum } from '@/custom-table/types/core/enums';
import { devLog } from '@/custom-table/utils';
import { useQueryFormat, useQuerySync, useUrlSyncState } from './hooks';
import { createQuerySyncUtils } from './utils/index';

/**
 * Query Sync Plugin Configuration
 */
export interface QuerySyncPluginConfig extends QuerySyncConfig {
  /** Plugin priority */
  priority?: PluginPriorityEnum;
  /** Whether the plugin is enabled */
  enabled?: boolean;
  /** Debug mode */
  debug?: boolean;
}

/**
 * Query Parameter Sync Plugin Implementation
 */
const QuerySyncPlugin: Plugin<QuerySyncPluginConfig> = {
  name: 'query-sync',
  version: '1.0.0',
  description: 'Synchronizes query parameters with URL search parameters',
  priority: PluginPriorityEnum.HIGH,
  enabled: true,

  // Default configuration
  config: {
    syncQueryOnSearchParams: false,
    authQueryPrefixOnSearchParams: {},
    querySearchParamsFormat: {},
    queryFormat: {},
    useActiveKeyHook: false,
    enabled: true,
    debug: false,
  },

  /**
   * Plugin installation
   */
  async install(context: PluginContext) {
    const config = this.config as QuerySyncPluginConfig;

    if (config.debug) {
      devLog.log({
        component: 'QuerySyncPlugin',
        message: 'Installing plugin with config:',
        data: config,
      });
    }

    // Validate configuration
    if (config.syncQueryOnSearchParams && !context.helpers.setQuery) {
      throw new Error('QuerySyncPlugin requires setQuery helper in context');
    }

    // Extend context, add query synchronization related functionality
    context.plugins = context.plugins || {};
    context.plugins.querySync = {
      config,
      hooks: {
        useQuerySync,
        useQueryFormat,
        useUrlSyncState,
      },
      utils: createQuerySyncUtils,
    };
  },

  /**
   * Plugin setup
   */
  async setup(context: PluginContext) {
    const config = this.config as QuerySyncPluginConfig;

    if (!config.enabled || !config.syncQueryOnSearchParams) {
      return;
    }

    if (config.debug) {
      devLog.log({
        component: 'QuerySyncPlugin',
        message: 'Setting up query sync functionality',
      });
    }
    const querySync = context.plugins?.querySync;
    if (
      querySync &&
      context.state.query &&
      typeof context.helpers.setQuery === 'function'
    ) {
      // Initialization logic can be executed here
      // Specific synchronization logic will be handled in hooks
      if (config.debug) {
        devLog.log({
          component: 'QuerySyncPlugin',
          message: 'Query sync initialized successfully',
        });
      }
    }
  },

  /**
   * Before component mount
   */
  async beforeMount(_context: PluginContext) {
    const config = this.config as QuerySyncPluginConfig;

    if (!config.enabled || !config.syncQueryOnSearchParams) {
      return;
    }

    if (config.debug) {
      devLog.log({
        component: 'QuerySyncPlugin',
        message: 'Before mount - preparing query sync',
      });
    }
  },

  /**
   * After component mount
   */
  async afterMount(_context: PluginContext) {
    const config = this.config as QuerySyncPluginConfig;

    if (!config.enabled || !config.syncQueryOnSearchParams) {
      return;
    }

    if (config.debug) {
      devLog.log({
        component: 'QuerySyncPlugin',
        message: 'After mount - query sync is active',
      });
    }
  },

  /**
   * Before update
   */
  async beforeUpdate(context: PluginContext) {
    const config = this.config as QuerySyncPluginConfig;

    if (config.debug && config.enabled && config.syncQueryOnSearchParams) {
      devLog.log({
        component: 'QuerySyncPlugin',
        message: 'Before update - query state:',
        data: context.state.query,
      });
    }
  },

  /**
   * After update
   */
  async afterUpdate(_context: PluginContext) {
    const config = this.config as QuerySyncPluginConfig;

    if (config.debug && config.enabled && config.syncQueryOnSearchParams) {
      devLog.log({
        component: 'QuerySyncPlugin',
        message: 'After update - query synced',
      });
    }
  },

  /**
   * Plugin uninstallation
   */
  async uninstall(context: PluginContext) {
    const config = this.config as QuerySyncPluginConfig;

    if (config.debug) {
      devLog.log({
        component: 'QuerySyncPlugin',
        message: 'Uninstalling plugin',
      });
    }

    // Clean up plugin-related context
    if (context.plugins?.querySync) {
      delete context.plugins.querySync;
    }
  },

  /**
   * Plugin activation
   */
  async activate(_context: PluginContext) {
    const config = this.config as QuerySyncPluginConfig;

    if (config.debug) {
      devLog.log({
        component: 'QuerySyncPlugin',
        message: 'Plugin activated',
      });
    }

    // Activation logic can be executed here
  },

  /**
   * Plugin deactivation
   */
  async deactivate(_context: PluginContext) {
    const config = this.config as QuerySyncPluginConfig;

    if (config.debug) {
      devLog.log({
        component: 'QuerySyncPlugin',
        message: 'Plugin deactivated',
      });
    }

    // Cleanup logic after deactivation can be executed here
  },
};

/**
 * Create query parameter sync plugin instance
 */
export const createQuerySyncPlugin = (
  config: Partial<QuerySyncPluginConfig> = {},
): Plugin<QuerySyncPluginConfig> => ({
  ...QuerySyncPlugin,
  config: {
    ...QuerySyncPlugin.config,
    ...config,
  },
});

export { QuerySyncPlugin };
