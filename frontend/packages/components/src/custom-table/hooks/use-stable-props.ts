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
 * Props stabilization utilities
 *
 * 🎯 Purpose: Prevent infinite loops caused by props object/function reference changes
 *
 * Use cases:
 * - Function props like handleColumns/handleFilters
 * - Object props like tableActions
 * - Any props that may change frequently but have the same content
 */

import { isEqual } from 'lodash-es';
import { useRef } from 'react';

/**
 * Stabilize callback function
 *
 * Maintains stable function reference through useRef while always calling the latest function implementation
 *
 * @param callback - Callback function
 * @returns Stable function reference
 *
 * @example
 * ```typescript
 * const stableOnEdit = useStableCallback(onEdit);
 * // stableOnEdit's reference never changes, but internally calls the latest onEdit
 * ```
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T | undefined,
): T | undefined {
  const callbackRef = useRef(callback);

  // Always keep the latest function reference
  callbackRef.current = callback;

  // Return stable wrapper function
  const stableCallbackRef = useRef<T>();

  if (!stableCallbackRef.current && callback) {
    stableCallbackRef.current = ((...args: any[]) => {
      return callbackRef.current?.(...args);
    }) as T;
  }

  return callback ? stableCallbackRef.current : undefined;
}

/**
 * Stabilize object
 *
 * Uses deep comparison (isEqual), only returns new reference when content actually changes
 *
 * @param obj - Object
 * @returns Stable object reference
 *
 * @example
 * ```typescript
 * const stableActions = useStableObject({ onEdit, onDelete, onCreate });
 * // stableActions reference only changes when object content actually changes
 * ```
 */
export function useStableObject<T extends Record<string, any>>(
  obj: T | undefined,
): T | undefined {
  const ref = useRef(obj);

  // Deep comparison: only update when content actually changes
  if (!isEqual(ref.current, obj)) {
    ref.current = obj;
  }

  return ref.current;
}

/**
 * Stabilize handler function (higher-order function)
 *
 * Special handling: functions that return functions like handleColumns/handleFilters
 *
 * @param handler - Handler function
 * @returns Stable handler function
 *
 * @example
 * ```typescript
 * const stableHandleColumns = useStableHandler(handleColumns);
 * // stableHandleColumns reference never changes
 * ```
 */
export function useStableHandler<T extends (...args: any[]) => any>(
  handler: T | undefined,
): T | undefined {
  const handlerRef = useRef(handler);

  // Always keep the latest function reference
  handlerRef.current = handler;

  // Return stable wrapper function
  const stableHandlerRef = useRef<T>();

  if (!stableHandlerRef.current && handler) {
    stableHandlerRef.current = ((...args: any[]) => {
      return handlerRef.current?.(...args);
    }) as T;
  }

  return handler ? stableHandlerRef.current : undefined;
}

/**
 * Batch stabilize Props (simplified version)
 *
 * Uses deep comparison to stabilize entire object
 *
 * @param props - Props object
 * @returns Stable Props object
 *
 * @example
 * ```typescript
 * const stableProps = useStableProps({
 *   onEdit,
 *   onDelete,
 *   onCreate,
 * });
 * ```
 */
export function useStableProps<T extends Record<string, any>>(props: T): T {
  return useStableObject(props) as T;
}
