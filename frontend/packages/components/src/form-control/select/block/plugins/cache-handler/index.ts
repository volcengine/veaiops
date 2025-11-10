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

import { logger } from '../../logger';
import type {
  CacheHandlerConfig,
  CacheHandlerPlugin,
  PluginContext,
} from '../../types/plugin';

/**
 * Cache handler plugin implementation
 */
export class CacheHandlerPluginImpl implements CacheHandlerPlugin {
  name = 'cache-handler';

  config: CacheHandlerConfig;

  private context!: PluginContext;

  private removalTimeouts: Map<string, ReturnType<typeof setTimeout>> =
    new Map();

  constructor(config: CacheHandlerConfig) {
    this.config = {
      autoRemoveDelay: 5000,
      ...config,
    };
  }

  init(context: PluginContext): void {
    this.context = context;
    logger.debug(
      'CacheHandler',
      'Plugin initialized',
      {
        cacheKey: this.config.cacheKey,
        dataSourceShare: this.config.dataSourceShare,
        autoRemoveDelay: this.config.autoRemoveDelay,
      },
      'init',
    );
  }

  /**
   * Get data from cache
   */
  getFromCache(key: string): any {
    if (!this.context) {
      logger.warn(
        'CacheHandler',
        'getFromCache called but context is null',
        { key },
        'getFromCache',
      );
      return null;
    }
    const data = this.context.utils.sessionStore.get(key);
    logger.debug(
      'CacheHandler',
      'Get data from cache',
      {
        key,
        hasData: Boolean(data),
        dataType: typeof data,
      },
      'getFromCache',
    );
    return data;
  }

  /**
   * Set cache data
   */
  setToCache(key: string, data: any): void {
    if (!this.context) {
      logger.warn(
        'CacheHandler',
        'setToCache called but context is null',
        { key },
        'setToCache',
      );
      return;
    }
    this.context.utils.sessionStore.set(key, data);
    logger.debug(
      'CacheHandler',
      'Set cache data',
      {
        key,
        dataType: typeof data,
      },
      'setToCache',
    );
  }

  /**
   * Remove data from cache
   */
  removeFromCache(key: string): void {
    this.context.utils.sessionStore.remove(key);

    // Clear timer
    const timeout = this.removalTimeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.removalTimeouts.delete(key);
    }
  }

  /**
   * Schedule delayed cache removal
   */
  scheduleRemoval(key: string, delay?: number): void {
    const removeDelay = delay ?? this.config.autoRemoveDelay;

    // Clear previous timer
    const existingTimeout = this.removalTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timer
    const timeout = setTimeout(() => {
      this.removeFromCache(key);
    }, removeDelay);

    this.removalTimeouts.set(key, timeout);
  }

  /**
   * Check if data exists in cache for specified key
   */
  hasCache(key: string): boolean {
    const data = this.getFromCache(key);
    return data !== null && data !== undefined;
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    // Clear all timers
    this.removalTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.removalTimeouts.clear();
  }

  /**
   * Handle data source sharing cache logic
   */
  handleDataSourceCache(api: string, response: any): void {
    if (this.config.dataSourceShare) {
      this.setToCache(api, response);
    }
  }

  /**
   * Get or set cache data
   */
  getOrSetCache<T>(
    key: string,
    factory: () => Promise<T> | T,
    shouldCache = true,
  ): Promise<T> | T {
    // Check if data exists in cache
    const cachedData = this.getFromCache(key);
    if (cachedData !== null && cachedData !== undefined) {
      // If cached data found, schedule delayed removal
      this.scheduleRemoval(key);
      return cachedData;
    }

    // If no data in cache, call factory function to get
    const result = factory();

    if (result instanceof Promise) {
      return result.then((data) => {
        if (shouldCache) {
          this.setToCache(key, data);
        }
        return data;
      });
    }
    if (shouldCache) {
      this.setToCache(key, result);
    }
    return result;
  }

  /**
   * Handle cache cleanup when component unmounts or resets
   */
  handleComponentReset(): void {
    const { cacheKey } = this.config;

    if (cacheKey) {
      // Remove current component's cache
      this.removeFromCache(cacheKey);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { activeTimeouts: number; cacheKey?: string } {
    return {
      activeTimeouts: this.removalTimeouts.size,
      cacheKey: this.config.cacheKey,
    };
  }

  /**
   * Extend cache lifetime
   */
  extendCacheLifetime(key: string, additionalDelay?: number): void {
    const delay = additionalDelay ?? this.config.autoRemoveDelay;
    this.scheduleRemoval(key, delay);
  }

  /**
   * Immediately remove specified cache
   */
  immediateRemove(key: string): void {
    this.removeFromCache(key);
  }

  destroy(): void {
    // Clear all timers
    this.removalTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.removalTimeouts.clear();

    // Clean up cache related to current component
    if (this.config.cacheKey) {
      this.removeFromCache(this.config.cacheKey);
    }

    this.context = null as any;
  }
}
