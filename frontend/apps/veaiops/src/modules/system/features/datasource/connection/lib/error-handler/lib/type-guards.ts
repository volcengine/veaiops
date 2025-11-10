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
 * Error object type guard
 * Check if object contains message property
 */
export function hasMessage(obj: unknown): obj is { message: unknown } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'message' in obj
  );
}

/**
 * Error object type guard
 * Check if object contains code property
 */
export function hasCode(obj: unknown): obj is { code: unknown } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'code' in obj
  );
}

/**
 * Network error object type guard
 */
export function isNetworkError(obj: unknown): boolean {
  return (
    hasCode(obj) &&
    (obj.code === 'NETWORK_ERROR' || obj.code === 'ECONNREFUSED' || obj.code === 'ETIMEDOUT')
  );
}

/**
 * HTTP response error object type guard
 */
export function hasResponse(obj: unknown): obj is { response?: { status?: number; data?: { message?: unknown; error?: unknown } } } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'response' in obj
  );
}

/**
 * HTTP status error object type guard
 */
export function hasStatus(obj: unknown): obj is { status?: number } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'status' in obj
  );
}
