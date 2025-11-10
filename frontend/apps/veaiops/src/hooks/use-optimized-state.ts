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

import { memoryCache } from '@/utils/cache-manager';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Optimized state management Hook
 * Provides debounce, throttle, cache and other functionality
 */

/**
 * Debounced state Hook
 */
export interface UseDebouncedStateParams<T> {
  initialValue: T;
  delay?: number;
}

export function useDebouncedState<T>({
  initialValue,
  delay = 300,
}: UseDebouncedStateParams<T>) {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return [debouncedValue, setValue] as const;
}

/**
 * Throttled state Hook
 */
export interface UseThrottledStateParams<T> {
  initialValue: T;
  delay?: number;
}

export function useThrottledState<T>({
  initialValue,
  delay = 300,
}: UseThrottledStateParams<T>) {
  const [value, setValue] = useState<T>(initialValue);
  const [throttledValue, setThrottledValue] = useState<T>(initialValue);
  const lastExecuted = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const updateThrottledValue = useCallback(
    (newValue: T) => {
      const now = Date.now();

      if (now - lastExecuted.current >= delay) {
        setThrottledValue(newValue);
        lastExecuted.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            setThrottledValue(newValue);
            lastExecuted.current = Date.now();
          },
          delay - (now - lastExecuted.current),
        );
      }
    },
    [delay],
  );

  useEffect(() => {
    updateThrottledValue(value);
  }, [value, updateThrottledValue]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [throttledValue, setValue] as const;
}

/**
 * Cached state Hook
 * @param key Cache key
 * @param initialValue Initial value
 * @param ttl Cache time to live (milliseconds)
 */
export interface UseCachedStateParams<T> {
  key: string;
  initialValue: T;
  ttl?: number;
}

export function useCachedState<T>({
  key,
  initialValue,
  ttl = 5 * 60 * 1000,
}: UseCachedStateParams<T>) {
  // Try to get initial value from cache
  const getCachedValue = useCallback(() => {
    const cached = memoryCache.get(key);
    return cached !== null ? cached : initialValue;
  }, [key, initialValue]);

  const [value, setValue] = useState<T>(getCachedValue);

  // Update state and cache
  const setCachedValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const nextValue =
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(prev)
            : newValue;

        // Cache new value
        memoryCache.set({ key, value: nextValue, ttl });
        return nextValue;
      });
    },
    [key, ttl],
  );

  return [value, setCachedValue] as const;
}

/**
 * Async state Hook
 * Provides loading state, error handling and retry functionality
 */
export interface UseAsyncStateParams<T, E = Error> {
  asyncFunction: () => Promise<T>;
  _deps?: React.DependencyList;
}

export function useAsyncState<T, E = Error>({
  asyncFunction,
  _deps = [],
}: UseAsyncStateParams<T, E>) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: E | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await asyncFunction();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error: unknown) {
      setState({ data: null, loading: false, error: error as E });
      // ✅ Correct: Convert error to Error object before throwing (complies with @typescript-eslint/only-throw-error rule)
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      throw errorObj;
    }
  }, [asyncFunction]);

  const retry = useCallback(() => {
    return execute();
  }, [execute]);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    execute,
    retry,
  };
}

/**
 * Optimized object state Hook
 * Provides shallow comparison optimization to avoid unnecessary re-renders
 */
export interface UseOptimizedObjectStateParams<T extends Record<string, any>> {
  initialValue: T;
}

export function useOptimizedObjectState<T extends Record<string, any>>({
  initialValue,
}: UseOptimizedObjectStateParams<T>) {
  const [state, setState] = useState<T>(initialValue);
  const prevStateRef = useRef<T>(initialValue);

  const setOptimizedState = useCallback(
    (newState: Partial<T> | ((prev: T) => Partial<T>)) => {
      setState((prev) => {
        const updates =
          typeof newState === 'function' ? newState(prev) : newState;
        const nextState = { ...prev, ...updates };

        // Shallow comparison, do not update if no changes
        const hasChanged = Object.keys(updates).some(
          (key) => prev[key] !== nextState[key],
        );

        if (!hasChanged) {
          return prev;
        }

        prevStateRef.current = nextState;
        return nextState;
      });
    },
    [],
  );

  return [state, setOptimizedState] as const;
}

/**
 * List state Hook
 * Provides common list operation methods
 */
interface InsertParams<T> {
  index: number;
  item: T;
}

interface UpdateParams<T> {
  index: number;
  item: T;
}

interface UpdateWhereParams<T> {
  predicate: (item: T) => boolean;
  updater: (item: T) => T;
}

interface MoveParams {
  fromIndex: number;
  toIndex: number;
}

export interface UseListStateParams<T> {
  initialValue?: T[];
}

export function useListState<T>({
  initialValue = [],
}: UseListStateParams<T> = {}) {
  const [list, setList] = useState<T[]>(initialValue);

  const actions = {
    // Add item
    append: useCallback((item: T) => {
      setList((prev) => [...prev, item]);
    }, []),

    // Add to beginning
    prepend: useCallback((item: T) => {
      setList((prev) => [item, ...prev]);
    }, []),

    // Insert at specified position
    insert: useCallback(({ index, item }: InsertParams<T>) => {
      setList((prev) => [...prev.slice(0, index), item, ...prev.slice(index)]);
    }, []),

    // Remove item at specified index
    remove: useCallback((index: number) => {
      setList((prev) => prev.filter((_, i) => i !== index));
    }, []),

    // Remove items matching condition
    removeWhere: useCallback((predicate: (item: T) => boolean) => {
      setList((prev) => prev.filter((item) => !predicate(item)));
    }, []),

    // Update item at specified index
    update: useCallback(({ index, item }: UpdateParams<T>) => {
      setList((prev) =>
        prev.map((prevItem, i) => (i === index ? item : prevItem)),
      );
    }, []),

    // Update items matching condition
    updateWhere: useCallback(({ predicate, updater }: UpdateWhereParams<T>) => {
      setList((prev) =>
        prev.map((item) => (predicate(item) ? updater(item) : item)),
      );
    }, []),

    // Clear list
    clear: useCallback(() => {
      setList([]);
    }, []),

    // Reset to initial value
    reset: useCallback(() => {
      setList(initialValue);
    }, [initialValue]),

    // Move item
    move: useCallback(({ fromIndex, toIndex }: MoveParams) => {
      setList((prev) => {
        const newList = [...prev];
        const [removed] = newList.splice(fromIndex, 1);
        newList.splice(toIndex, 0, removed);
        return newList;
      });
    }, []),
  };

  return [list, actions, setList] as const;
}

/**
 * Form state Hook
 * Provides form validation and error handling
 */
export interface UseFormStateParams<T extends Record<string, any>> {
  initialValues: T;
  validators?: Partial<Record<keyof T, (value: any) => string | null>>;
}

export function useFormState<T extends Record<string, any>>({
  initialValues,
  validators,
}: UseFormStateParams<T>) {
  const [values, setValues] = useOptimizedObjectState<T>({
    initialValue: initialValues,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  interface SetValueParams {
    field: keyof T;
    value: any;
  }

  const setValue = useCallback(
    ({ field, value }: SetValueParams) => {
      setValues({ [field]: value } as Partial<T>);

      // Validate field
      if (validators?.[field]) {
        const error = validators[field](value);
        setErrors((prev) => ({
          ...prev,
          [field]: error,
        }));
      }
    },
    [setValues, validators],
  );

  const setTouchedField = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const validateAll = useCallback(() => {
    if (!validators) {
      return true;
    }

    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validators).forEach((field) => {
      const validator = validators[field as keyof T];
      if (validator) {
        const error = validator(values[field as keyof T]);
        if (error) {
          newErrors[field as keyof T] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validators, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues, setValues]);

  return {
    values,
    errors,
    touched,
    setValue,
    setTouchedField,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
}
