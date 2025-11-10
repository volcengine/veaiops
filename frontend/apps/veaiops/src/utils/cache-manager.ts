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
 * Cache manager
 * Provides memory cache, local storage cache, and session cache functionality
 */

interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number; // Time to live (milliseconds)
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  /** Cache time to live (milliseconds), default 5 minutes */
  ttl?: number;
  /** Maximum number of cache items, default 100 */
  maxSize?: number;
  /** Whether to use LRU eviction strategy, default true */
  useLRU?: boolean;
  /** Storage type */
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}

class CacheManager<T = any> {
  private cache: Map<string, CacheItem<T>> = new Map<string, CacheItem<T>>();
  private readonly options: Required<CacheOptions>;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl ?? 5 * 60 * 1000, // 5 minutes
      maxSize: options.maxSize ?? 100,
      useLRU: options.useLRU ?? true,
      storage: options.storage ?? 'memory',
    };

    // Start periodic cleanup
    this.startCleanup();
  }

  /**
   * Set cache item
   */
  set({
    key,
    value,
    ttl,
  }: {
    key: string;
    value: T;
    ttl?: number;
  }): void {
    const now = Date.now();
    const itemTtl = ttl ?? this.options.ttl;

    const item: CacheItem<T> = {
      value,
      timestamp: now,
      ttl: itemTtl,
      accessCount: 0,
      lastAccessed: now,
    };

    // If using browser storage
    if (this.options.storage !== 'memory') {
      this.setStorageItem(key, item);
      return;
    }

    // Memory cache
    this.cache.set(key, item);

    // Check cache size limit
    if (this.cache.size > this.options.maxSize) {
      this.evictItems();
    }
  }

  /**
   * Get cache item
   */
  get(key: string): T | null {
    let item: CacheItem<T> | null = null;

    // Get from different storage
    if (this.options.storage === 'memory') {
      item = this.cache.get(key) || null;
    } else {
      item = this.getStorageItem(key);
    }

    if (!item) {
      return null;
    }

    const now = Date.now();

    // Check if expired
    if (now - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }

    // Update access information
    item.accessCount++;
    item.lastAccessed = now;

    // Update storage
    if (this.options.storage === 'memory') {
      this.cache.set(key, item);
    } else {
      this.setStorageItem(key, item);
    }

    return item.value;
  }

  /**
   * Delete cache item
   */
  delete(key: string): boolean {
    if (this.options.storage === 'memory') {
      return this.cache.delete(key);
    } else {
      return this.deleteStorageItem(key);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    if (this.options.storage === 'memory') {
      this.cache.clear();
    } else {
      this.clearStorage();
    }
  }

  /**
   * Check if cache item exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const items = this.getAllItems();
    const now = Date.now();

    let totalSize = 0;
    let expiredCount = 0;
    let hitCount = 0;

    items.forEach((item) => {
      totalSize++;
      if (now - item.timestamp > item.ttl) {
        expiredCount++;
      }
      hitCount += item.accessCount;
    });

    return {
      totalItems: totalSize,
      expiredItems: expiredCount,
      totalHits: hitCount,
      storageType: this.options.storage,
      maxSize: this.options.maxSize,
      defaultTTL: this.options.ttl,
    };
  }

  /**
   * Clean up expired items
   */
  cleanup(): number {
    const now = Date.now();
    let cleanedCount = 0;

    if (this.options.storage === 'memory') {
      for (const [key, item] of this.cache.entries()) {
        if (now - item.timestamp > item.ttl) {
          this.cache.delete(key);
          cleanedCount++;
        }
      }
    } else {
      // Browser storage cleanup
      const keys = this.getStorageKeys();
      keys.forEach((key) => {
        const item = this.getStorageItem(key);
        if (item && now - item.timestamp > item.ttl) {
          this.deleteStorageItem(key);
          cleanedCount++;
        }
      });
    }

    return cleanedCount;
  }

  /**
   * Evict cache items (LRU strategy)
   */
  private evictItems(): void {
    if (!this.options.useLRU) {
      return;
    }

    const items = Array.from(this.cache.entries());

    // Sort by last access time, least recently used first
    items.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    // Delete least recently used items until cache size meets limit
    const itemsToRemove = items.length - this.options.maxSize + 1;
    for (let i = 0; i < itemsToRemove; i++) {
      const [key] = items[i];
      this.cache.delete(key);
    }
  }

  /**
   * Start periodic cleanup
   */
  private startCleanup(): void {
    // Clean up expired items every 5 minutes
    this.cleanupTimer = setInterval(
      () => {
        const cleaned = this.cleanup();
        if (cleaned > 0) {
          // Expired cache items cleaned, can add logging here
        }
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Stop periodic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Browser storage related methods
   */
  private getStorage() {
    if (typeof window === 'undefined') {
      return null;
    }
    return this.options.storage === 'localStorage'
      ? localStorage
      : sessionStorage;
  }

  private getStorageKey(key: string): string {
    return `cache_${key}`;
  }

  private setStorageItem(key: string, item: CacheItem<T>): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }

    try {
      storage.setItem(this.getStorageKey(key), JSON.stringify(item));
    } catch (error) {
      // localStorage/sessionStorage write failed (may be insufficient storage space or permission issue), handle silently
    }
  }

  private getStorageItem(key: string): CacheItem<T> | null {
    const storage = this.getStorage();
    if (!storage) {
      return null;
    }

    try {
      const data = storage.getItem(this.getStorageKey(key));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      // localStorage/sessionStorage read or parse failed, return null (handle silently)
      return null;
    }
  }

  private deleteStorageItem(key: string): boolean {
    const storage = this.getStorage();
    if (!storage) {
      return false;
    }

    try {
      storage.removeItem(this.getStorageKey(key));
      return true;
    } catch (error) {
      // localStorage/sessionStorage delete failed, return false (handle silently)
      return false;
    }
  }

  private clearStorage(): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }

    const keys = this.getStorageKeys();
    keys.forEach((key) => {
      storage.removeItem(this.getStorageKey(key));
    });
  }

  private getStorageKeys(): string[] {
    const storage = this.getStorage();
    if (!storage) {
      return [];
    }

    const keys: string[] = [];
    const prefix = 'cache_';

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(prefix)) {
        keys.push(key.substring(prefix.length));
      }
    }

    return keys;
  }

  private getAllItems(): CacheItem<T>[] {
    if (this.options.storage === 'memory') {
      return Array.from(this.cache.values());
    } else {
      const keys = this.getStorageKeys();
      return keys
        .map((key) => this.getStorageItem(key))
        .filter(Boolean) as CacheItem<T>[];
    }
  }
}

// Create default cache instances
export const memoryCache = new CacheManager({ storage: 'memory' });
export const localCache = new CacheManager({
  storage: 'sessionStorage',
  ttl: 24 * 60 * 60 * 1000,
}); // 24 hours
export const sessionCache = new CacheManager({ storage: 'sessionStorage' });

// Export cache manager class
export { CacheManager };

/**
 * Cache decorator for caching function results
 */
export interface CachedParams<T extends (...args: any[]) => any> {
  cacheManager?: CacheManager;
  keyGenerator?: (...args: Parameters<T>) => string;
  ttl?: number;
}

export function cached<T extends (...args: any[]) => any>({
  cacheManager = memoryCache,
  keyGenerator,
  ttl,
}: CachedParams<T> = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: Parameters<T>) {
      const cacheKey = keyGenerator
        ? keyGenerator(...args)
        : `${propertyKey}_${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = cacheManager.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original method and cache result
      const result = originalMethod.apply(this, args);
      cacheManager.set({ key: cacheKey, value: result, ttl });

      return result;
    };

    return descriptor;
  };
}
