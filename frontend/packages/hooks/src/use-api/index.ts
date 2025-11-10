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

import { useCallback, useEffect, useState } from 'react';

/**
 * API call options
 */
export interface UseApiOptions {
  /** Whether to execute immediately */
  immediate?: boolean;
  /** Dependencies */
  deps?: any[];
  /** Error handler function */
  onError?: (error: Error) => void;
  /** Success callback */
  onSuccess?: (data: any) => void;
  /** Cache key */
  cacheKey?: string;
  /** Cache time (milliseconds) */
  cacheTime?: number;
}

/**
 * API call state
 */
export interface UseApiResult<T> {
  /** Data */
  data: T | null;
  /** Loading state */
  loading: boolean;
  /** Error information */
  error: Error | null;
  /** Execute API call */
  execute: (...args: any[]) => Promise<T>;
  /** Reset state */
  reset: () => void;
  /** Refresh data */
  refresh: () => Promise<T>;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

/**
 * Parameters interface for generic API call Hook
 */
export interface UseApiParams<T, P extends any[] = any[]> {
  apiCall: (...params: P) => Promise<T>;
  options?: UseApiOptions;
}

/**
 * Generic API call Hook
 * @description Provides unified API calls, error handling, and loading state management
 */
export const useApi = <T, P extends any[] = any[]>({
  apiCall,
  options = {},
}: UseApiParams<T, P>): UseApiResult<T> => {
  const {
    immediate = false,
    deps = [],
    onError,
    onSuccess,
    cacheKey,
    cacheTime = 5 * 60 * 1000, // Default 5-minute cache
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastParams, setLastParams] = useState<P | null>(null);

  interface GetCachedDataParams {
    key: string;
  }

  // Check cache
  const getCachedData = useCallback(
    ({ key }: GetCachedDataParams): T | null => {
      if (!cacheKey) {
        return null;
      }

      const cached = cache.get(key);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
      }

      // Clean up expired cache
      if (cached) {
        cache.delete(key);
      }

      return null;
    },
    [cacheKey],
  );

  interface SetCachedDataParams {
    key: string;
    data: T;
  }

  // Set cache
  const setCachedData = useCallback(
    ({ key, data }: SetCachedDataParams) => {
      if (!cacheKey) {
        return;
      }

      cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: cacheTime,
      });
    },
    [cacheKey, cacheTime],
  );

  // Execute API call
  const execute = useCallback(
    async (...params: P): Promise<T> => {
      try {
        setLoading(true);
        setError(null);
        setLastParams(params);

        // Check cache
        if (cacheKey) {
          const cachedData = getCachedData({ key: cacheKey });
          if (cachedData) {
            setData(cachedData);
            setLoading(false);
            return cachedData;
          }
        }

        const result = await apiCall(...params);

        setData(result);

        // Set cache
        if (cacheKey) {
          setCachedData({ key: cacheKey, data: result });
        }

        // Success callback
        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        // Error handling
        if (onError) {
          onError(error);
        } else {
          // Default error handling can be added here
        }

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, onError, onSuccess, cacheKey, getCachedData, setCachedData],
  );

  // Reset state
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setLastParams(null);

    // Clean up cache
    if (cacheKey) {
      cache.delete(cacheKey);
    }
  }, [cacheKey]);

  // Refresh data
  const refresh = useCallback(async (): Promise<T> => {
    if (!lastParams) {
      throw new Error('No request parameters available for refresh');
    }

    // Clear cache and re-request
    if (cacheKey) {
      cache.delete(cacheKey);
    }

    return execute(...lastParams);
  }, [execute, lastParams, cacheKey]);

  // Execute immediately
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as P));
    }
  }, [immediate, ...deps]);

  return {
    data,
    loading,
    error,
    execute: execute as (...args: any[]) => Promise<T>,
    reset,
    refresh,
  };
};

/**
 * Parameters interface for batch API call Hook
 */
export interface UseBatchApiParams<T> {
  apiCalls: Array<() => Promise<T>>;
  options?: UseApiOptions;
}

/**
 * Batch API call Hook
 */
export const useBatchApi = <T>({
  apiCalls,
  options = {},
}: UseBatchApiParams<T>) => {
  const [results, setResults] = useState<(T | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<(Error | null)[]>([]);

  const execute = useCallback(async () => {
    setLoading(true);
    setErrors(new Array(apiCalls.length).fill(null));

    try {
      const promises = apiCalls.map(async (apiCall, index) => {
        try {
          return await apiCall();
        } catch (error) {
          setErrors((prev) => {
            const newErrors = [...prev];
            newErrors[index] =
              error instanceof Error ? error : new Error(String(error));
            return newErrors;
          });
          return null;
        }
      });

      const results = await Promise.all(promises);
      setResults(results);

      return results;
    } finally {
      setLoading(false);
    }
  }, [apiCalls]);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [options.immediate, execute]);

  return {
    results,
    loading,
    errors,
    execute,
  };
};

export default useApi;
