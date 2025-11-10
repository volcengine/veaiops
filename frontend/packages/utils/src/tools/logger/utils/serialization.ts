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
 * Serialization utilities for logger
 */

/**
 * Serialize a single value
 */
export function serializeValue(value: unknown): unknown {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return (value as unknown[]).map((item) => {
      if (typeof item === 'object' && item !== null) {
        return '[Object]';
      }
      return item;
    });
  }

  if (typeof value === 'object' && value !== null) {
    return serializeObjectValue(value);
  }

  return String(value);
}

/**
 * Detect if object contains circular references
 */
export function hasCircularReference(
  value: unknown,
  seen = new WeakSet<object>(),
): boolean {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (seen.has(value)) {
    return true;
  }

  seen.add(value);

  try {
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const propValue = (value as Record<string, unknown>)[key];
        if (hasCircularReference(propValue, seen)) {
          return true;
        }
      }
    }
  } catch {
    return true;
  }

  return false;
}

/**
 * Serialize object value, avoiding deep nesting and circular references
 */
export function serializeObjectValue(value: unknown): string {
  if (
    value instanceof Element ||
    (value as any).$$typeof ||
    (value as any)._owner
  ) {
    return '[React/DOM Element]';
  }

  if (hasCircularReference(value)) {
    return '[Circular Reference]';
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    ('_context' in value ||
      '_currentValue' in value ||
      '_currentValue2' in value)
  ) {
    return '[React Context]';
  }

  try {
    return JSON.parse(JSON.stringify(value)) as string;
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorMessage = errorObj.message || String(error);

    if (
      process.env.NODE_ENV === 'development' &&
      !errorMessage.includes('circular') &&
      !errorMessage.includes('Converting circular structure')
    ) {
      console.warn('[Logger] Object serialization failed', errorMessage);
    }

    return '[Complex Object]';
  }
}

/**
 * Safely serialize data, removing circular references and non-serializable objects
 */
export function safeSerializeData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  try {
    JSON.stringify(data);
    return data;
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    try {
      if (Array.isArray(data)) {
        return (data as unknown[]).map((item) => safeSerializeData(item));
      }

      const safeData: Record<string, unknown> = {};
      for (const key in data) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) {
          continue;
        }

        safeData[key] = serializeValue((data as Record<string, unknown>)[key]);
      }
      return safeData;
    } catch (innerError: unknown) {
      const innerErrorObj =
        innerError instanceof Error
          ? innerError
          : new Error(String(innerError));
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[Logger] Data serialization completely failed',
          innerErrorObj.message,
          {
            originalError: errorObj.message,
          },
        );
      }
      return `[Unserializable: ${typeof data}]`;
    }
  }
}

