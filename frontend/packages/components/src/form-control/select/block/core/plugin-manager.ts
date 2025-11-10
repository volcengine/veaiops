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

import { sessionStore } from '../cache-store';
import { logger } from '../logger';
import type { veArchSelectBlockProps } from '../types/interface';
import type {
  Plugin,
  PluginContext,
  PluginManager,
  PluginUtils,
  SelectBlockState,
} from '../types/plugin';
import { ensureArray, removeUndefinedValues, splitPastedText } from '../util';

// 🔧 State subscriber type definition
type StateSubscriber = (newState: SelectBlockState) => void;

/**
 * Plugin manager implementation
 */
export class SelectBlockPluginManager implements PluginManager {
  plugins: Map<string, Plugin> = new Map();

  context: PluginContext;

  private managerTraceId: string;

  // 🔧 State subscriber list
  private stateSubscribers: StateSubscriber[] = [];

  constructor() {
    this.managerTraceId = logger.generateTraceId();

    logger.info(
      'PluginManager',
      'Plugin manager initialization started',
      {},
      'constructor',
      this.managerTraceId,
    );

    // Initialize plugin context
    this.context = {
      props: {},
      state: {
        fetchOptions: [],
        initFetchOptions: [],
        fetching: false,
        loading: false,
        skip: 0,
        searchValue: '',
        canTriggerLoadMore: true,
        mounted: false,
      },
      setState: this.setState.bind(this),
      utils: this.createUtils(),
      getPlugin: this.getPlugin.bind(this),
    };

    logger.debug(
      'PluginManager',
      'Plugin context initialization completed',
      {
        initialState: this.context.state,
      },
      'constructor',
      this.managerTraceId,
    );

    logger.info(
      'PluginManager',
      'Plugin manager initialization completed',
      {
        contextReady: true,
      },
      'constructor',
      this.managerTraceId,
    );
  }

  /**
   * Create plugin utility functions
   */
  private createUtils(): PluginUtils {
    return {
      ensureArray,
      removeUndefinedValues,
      splitPastedText,
      sessionStore: {
        get: sessionStore.get.bind(sessionStore),
        set: sessionStore.set.bind(sessionStore),
        remove: sessionStore.remove.bind(sessionStore),
      },
    };
  }

  /**
   * Update state
   */
  setState(newState: Partial<SelectBlockState>): void {
    const oldState = { ...this.context.state };
    this.context.state = {
      ...this.context.state,
      ...newState,
    };
    // 🔧 Immediately notify all subscribers of state changes
    this.notifyStateSubscribers(this.context.state);

    logger.debug(
      'PluginManager',
      'State updated',
      {
        oldState: {
          ...oldState,
          fetchOptions: `[${oldState.fetchOptions?.length || 0} items]`,
        },
        newState: {
          ...newState,
          fetchOptions: newState.fetchOptions
            ? `[${newState.fetchOptions.length} items]`
            : undefined,
        },
        finalState: {
          ...this.context.state,
          fetchOptions: `[${this.context.state.fetchOptions?.length || 0} items]`,
        },
        subscribersCount: this.stateSubscribers.length,
      },
      'setState',
      this.managerTraceId,
    );
  }

  /**
   * Update Props
   */
  setProps(props: veArchSelectBlockProps): void {
    logger.debug(
      'PluginManager',
      'Props updated',
      {
        newPropsKeys: Object.keys(props),
        hasDataSource: Boolean(props.dataSource),
        mode: props.mode,
      },
      'setProps',
      this.managerTraceId,
    );

    this.context.props = props;
  }

  /**
   * Register plugin
   */
  register<T extends Plugin>(plugin: T): void {
    if (this.plugins.has(plugin.name)) {
      logger.warn(
        'PluginManager',
        `Plugin already exists, skipping registration: ${plugin.name}`,
        {
          pluginName: plugin.name,
        },
        'register',
        this.managerTraceId,
      );
      return;
    }

    logger.info(
      'PluginManager',
      `Starting plugin registration: ${plugin.name}`,
      {
        pluginName: plugin.name,
        hasInit: Boolean(plugin.init),
      },
      'register',
      this.managerTraceId,
    );

    this.plugins.set(plugin.name, plugin);

    // If plugin has init method, call it
    if (plugin.init) {
      try {
        plugin.init(this.context);
        logger.info(
          'PluginManager',
          `Plugin initialization successful: ${plugin.name}`,
          {
            pluginName: plugin.name,
          },
          'register',
          this.managerTraceId,
        );
      } catch (error) {
        logger.error(
          'PluginManager',
          `Plugin initialization failed: ${plugin.name}`,
          error as Error,
          {
            pluginName: plugin.name,
          },
          'register',
          this.managerTraceId,
        );
      }
    }

    logger.info(
      'PluginManager',
      `Plugin registration completed: ${plugin.name}`,
      {
        pluginName: plugin.name,
        totalPlugins: this.plugins.size,
      },
      'register',
      this.managerTraceId,
    );
  }

  /**
   * Unregister plugin
   */
  unregister(pluginName: string): void {
    logger.info(
      'PluginManager',
      `Starting plugin unregistration: ${pluginName}`,
      {
        pluginName,
        exists: this.plugins.has(pluginName),
      },
      'unregister',
      this.managerTraceId,
    );

    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      // Call plugin's destroy method
      if (plugin.destroy) {
        try {
          plugin.destroy();
          logger.info(
            'PluginManager',
            `Plugin destruction completed: ${pluginName}`,
            {
              pluginName,
            },
            'unregister',
            this.managerTraceId,
          );
        } catch (error) {
          logger.error(
            'PluginManager',
            `Plugin destruction failed: ${pluginName}`,
            error as Error,
            {
              pluginName,
            },
            'unregister',
            this.managerTraceId,
          );
        }
      }
      this.plugins.delete(pluginName);

      logger.info(
        'PluginManager',
        `Plugin unregistration completed: ${pluginName}`,
        {
          pluginName,
          remainingPlugins: this.plugins.size,
        },
        'unregister',
        this.managerTraceId,
      );
    } else {
      logger.warn(
        'PluginManager',
        `Plugin does not exist, cannot unregister: ${pluginName}`,
        {
          pluginName,
        },
        'unregister',
        this.managerTraceId,
      );
    }
  }

  /**
   * Get plugin
   */
  getPlugin<T extends Plugin>(pluginName: string): T | undefined {
    const plugin = this.plugins.get(pluginName) as T | undefined;
    logger.debug(
      'PluginManager',
      `Getting plugin: ${pluginName}`,
      {
        pluginName,
        found: Boolean(plugin),
      },
      'getPlugin',
      this.managerTraceId,
    );
    return plugin;
  }

  /**
   * Initialize all plugins
   */
  async init(): Promise<void> {
    logger.info(
      'PluginManager',
      'Starting initialization of all plugins',
      {
        pluginCount: this.plugins.size,
      },
      'init',
      this.managerTraceId,
    );

    const initPromises = Array.from(this.plugins.values())
      .filter((plugin) => plugin.init)
      .map((plugin) => {
        logger.debug(
          'PluginManager',
          `Initializing plugin: ${plugin.name}`,
          {
            pluginName: plugin.name,
          },
          'init',
          this.managerTraceId,
        );
        // Ensure all init results are Promises (plugin.init may return void | Promise<void>)
        const initResult = plugin.init!(this.context);
        return initResult instanceof Promise
          ? initResult
          : Promise.resolve(initResult);
      });

    try {
      await Promise.all(initPromises);
      logger.info(
        'PluginManager',
        'All plugins initialized',
        {
          initializedCount: initPromises.length,
        },
        'init',
        this.managerTraceId,
      );
    } catch (error) {
      logger.error(
        'PluginManager',
        'Plugin initialization failed',
        error as Error,
        {
          pluginCount: initPromises.length,
        },
        'init',
        this.managerTraceId,
      );
      throw error;
    }
  }

  // 🔧 State subscription management methods

  /**
   * Subscribe to state changes
   */
  subscribe(subscriber: StateSubscriber): () => void {
    this.stateSubscribers.push(subscriber);

    logger.debug(
      'PluginManager',
      'New state subscriber added',
      { subscribersCount: this.stateSubscribers.length },
      'subscribe',
      this.managerTraceId,
    );

    // Return unsubscribe function
    return () => this.unsubscribe(subscriber);
  }

  /**
   * Unsubscribe from state changes
   */
  private unsubscribe(subscriber: StateSubscriber): void {
    const index = this.stateSubscribers.indexOf(subscriber);
    if (index > -1) {
      this.stateSubscribers.splice(index, 1);

      logger.debug(
        'PluginManager',
        'State subscriber removed',
        { subscribersCount: this.stateSubscribers.length },
        'unsubscribe',
        this.managerTraceId,
      );
    }
  }

  /**
   * Notify all subscribers of state changes
   */
  private notifyStateSubscribers(newState: SelectBlockState): void {
    // 🔧 Immediately notify all subscribers, bypass React batch updates
    this.stateSubscribers.forEach((subscriber) => {
      try {
        subscriber(newState);
      } catch (error) {
        logger.error(
          'PluginManager',
          'State subscriber notification failed',
          error as Error,
          { error: String(error) },
          'notifyStateSubscribers',
          this.managerTraceId,
        );
      }
    });
  }

  /**
   * Destroy all plugins
   */
  destroy(): void {
    logger.info(
      'PluginManager',
      'Starting destruction of all plugins',
      {
        pluginCount: this.plugins.size,
      },
      'destroy',
      this.managerTraceId,
    );

    this.plugins.forEach((plugin) => {
      if (plugin.destroy) {
        try {
          plugin.destroy();
          logger.debug(
            'PluginManager',
            `Plugin destruction successful: ${plugin.name}`,
            {
              pluginName: plugin.name,
            },
            'destroy',
            this.managerTraceId,
          );
        } catch (error) {
          logger.error(
            'PluginManager',
            `Plugin destruction failed: ${plugin.name}`,
            error as Error,
            {
              pluginName: plugin.name,
            },
            'destroy',
            this.managerTraceId,
          );
        }
      }
    });
    this.plugins.clear();

    // 🔧 Clear all state subscribers
    this.stateSubscribers.length = 0;

    logger.info(
      'PluginManager',
      'All plugins destroyed',
      {
        remainingPlugins: this.plugins.size,
        remainingSubscribers: this.stateSubscribers.length,
      },
      'destroy',
      this.managerTraceId,
    );
  }

  /**
   * Get state
   */
  getState(): SelectBlockState {
    logger.debug(
      'PluginManager',
      'Getting state',
      {
        state: {
          ...this.context.state,
          fetchOptions: `[${this.context.state.fetchOptions?.length || 0} items]`,
        },
      },
      'getState',
      this.managerTraceId,
    );
    return this.context.state;
  }

  /**
   * Get Props
   */
  getProps(): veArchSelectBlockProps {
    logger.debug(
      'PluginManager',
      'Getting Props',
      {
        propsKeys: Object.keys(this.context.props),
      },
      'getProps',
      this.managerTraceId,
    );
    return this.context.props;
  }
}
