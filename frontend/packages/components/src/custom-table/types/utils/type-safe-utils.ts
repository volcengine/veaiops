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
 * Type-safe utility functions
 * Replaces any type, provides safer type operations
 */

import type { BaseQuery, BaseRecord } from '@veaiops/types';

/**
 * Safe record type field access
 */
export type SafeRecordAccess<T extends BaseRecord, K extends keyof T> = T[K];

/**
 * Safe query parameters type
 */
export type SafeQueryParams<T extends BaseQuery> = {
  [K in keyof T]: T[K];
};

/**
 * Type-safe access to configuration objects
 */
export interface TypeSafeConfig<T = Record<string, unknown>> {
  /** Raw configuration */
  raw: T;
  /** Get configuration value */
  get: <K extends keyof T>(key: K) => T[K];
  /** Set configuration value */
  set: <K extends keyof T>(key: K, value: T[K]) => void;
  /** Check if configuration key exists */
  has: <K extends keyof T>(key: K) => boolean;
  /** Get all keys */
  keys: () => (keyof T)[];
  /** Validate configuration format */
  validate: () => boolean;
}

/**
 * Create type-safe configuration object
 */
export function createTypeSafeConfig<T extends Record<string, unknown>>(
  initialConfig: T,
): TypeSafeConfig<T> {
  const config = { ...initialConfig };

  return {
    raw: config,
    get<K extends keyof T>(key: K): T[K] {
      return config[key];
    },
    set<K extends keyof T>(key: K, value: T[K]): void {
      config[key] = value;
    },
    has<K extends keyof T>(key: K): boolean {
      return key in config;
    },
    keys(): (keyof T)[] {
      return Object.keys(config) as (keyof T)[];
    },
    validate(): boolean {
      return typeof config === 'object' && config !== null;
    },
  };
}

/**
 * Safe array operation utilities
 */
export interface SafeArrayUtils<T> {
  /** Filter array */
  filter: (predicate: (item: T, index: number) => boolean) => T[];
  /** Map array */
  map: <U>(mapper: (item: T, index: number) => U) => U[];
  /** Find element */
  find: (predicate: (item: T, index: number) => boolean) => T | undefined;
  /** Check if exists */
  some: (predicate: (item: T, index: number) => boolean) => boolean;
  /** Check all elements */
  every: (predicate: (item: T, index: number) => boolean) => boolean;
  /** Reduce operation */
  reduce: <U>(
    reducer: (acc: U, item: T, index: number) => U,
    initialValue: U,
  ) => U;
  /** Get length */
  length: number;
  /** Raw array */
  raw: T[];
}

/**
 * Create safe array utilities
 */
export function createSafeArrayUtils<T>(array: T[]): SafeArrayUtils<T> {
  const safeArray = Array.isArray(array) ? [...array] : [];

  return {
    filter(predicate: (item: T, index: number) => boolean): T[] {
      return safeArray.filter(predicate);
    },
    map<U>(mapper: (item: T, index: number) => U): U[] {
      return safeArray.map(mapper);
    },
    find(predicate: (item: T, index: number) => boolean): T | undefined {
      return safeArray.find(predicate);
    },
    some(predicate: (item: T, index: number) => boolean): boolean {
      return safeArray.some(predicate);
    },
    every(predicate: (item: T, index: number) => boolean): boolean {
      return safeArray.every(predicate);
    },
    reduce<U>(
      reducer: (acc: U, item: T, index: number) => U,
      initialValue: U,
    ): U {
      return safeArray.reduce(reducer, initialValue);
    },
    get length(): number {
      return safeArray.length;
    },
    get raw(): T[] {
      return safeArray;
    },
  };
}

/**
 * Type-safe encapsulation of event handlers
 */
export type SafeEventHandler<EventType extends string, EventData = unknown> = {
  eventType: EventType;
  handler: (data: EventData) => void;
  once?: boolean;
};

/**
 * Type-safe handling of request parameters
 */
export interface SafeRequestParams<T = Record<string, unknown>> {
  /** Query parameters */
  query?: T;
  /** Path parameters */
  params?: Record<string, string | number>;
  /** Request body */
  body?: unknown;
  /** Request headers */
  headers?: Record<string, string>;
}

/**
 * Type-safe handling of response data
 */
export interface SafeResponseData<T = unknown> {
  /** Response data */
  data: T;
  /** Status code */
  status: number;
  /** Status text */
  statusText: string;
  /** Response headers */
  headers: Record<string, string>;
  /** Whether successful */
  success: boolean;
}

/**
 * Type-safe handling of pagination data
 */
export interface SafePaginationData<T = unknown> {
  /** Data list */
  list: T[];
  /** Current page number */
  current: number;
  /** Page size */
  pageSize: number;
  /** Total data count */
  total: number;
  /** Total pages */
  totalPages: number;
  /** Whether has next page */
  hasNext: boolean;
  /** Whether has previous page */
  hasPrev: boolean;
}

/**
 * Create type-safe pagination data
 */
export function createSafePaginationData<T>(
  list: T[],
  current: number,
  pageSize: number,
  total: number,
): SafePaginationData<T> {
  const totalPages = Math.ceil(total / pageSize);

  return {
    list: Array.isArray(list) ? list : [],
    current: Math.max(1, current),
    pageSize: Math.max(1, pageSize),
    total: Math.max(0, total),
    totalPages,
    hasNext: current < totalPages,
    hasPrev: current > 1,
  };
}

/**
 * Field validator type
 */
export type FieldValidator<T> = (value: T) => boolean | string;

/**
 * Type-safe handling of form validation
 */
export interface SafeFormValidation<T extends Record<string, unknown>> {
  /** Validation rules */
  rules: {
    [K in keyof T]?: FieldValidator<T[K]>[];
  };
  /** Execute validation */
  validate: (data: T) => {
    isValid: boolean;
    errors: Partial<Record<keyof T, string[]>>;
  };
}

/**
 * Create type-safe form validator
 */
export function createSafeFormValidation<T extends Record<string, unknown>>(
  rules: {
    [K in keyof T]?: FieldValidator<T[K]>[];
  },
): SafeFormValidation<T> {
  return {
    rules,
    validate(data: T) {
      const errors: Partial<Record<keyof T, string[]>> = {};
      let isValid = true;

      for (const [field, validators] of Object.entries(rules) as [
        keyof T,
        FieldValidator<T[keyof T]>[] | undefined,
      ][]) {
        if (!validators) {
          continue;
        }

        const fieldErrors: string[] = [];
        const value = data[field];

        for (const validator of validators) {
          const result = validator(value);
          if (result !== true) {
            fieldErrors.push(
              typeof result === 'string'
                ? result
                : `${String(field)} is invalid`,
            );
            isValid = false;
          }
        }

        if (fieldErrors.length > 0) {
          errors[field] = fieldErrors;
        }
      }

      return { isValid, errors };
    },
  };
}
