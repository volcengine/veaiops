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

import { hasMessage, hasResponse } from './type-guards';

/**
 * Extract error message from error object
 *
 * Priority:
 * 1. Error instance's message property
 * 2. Object containing message property value
 * 3. Nested error objects (error.error.message, error.response.data.message)
 * 4. Default error message (only used when completely unable to extract)
 *
 * @param error Error object (unknown type)
 * @returns Extracted error message string
 */
export function getErrorMessage(error: unknown): string {
  // 1. String type returns directly
  if (typeof error === 'string') {
    return error;
  }

  // 2. Error instance
  if (error instanceof Error) {
    return error.message || '未知错误';
  }

  // 3. Object containing message property
  if (hasMessage(error)) {
    const { message } = error;
    if (typeof message === 'string' && message) {
      return message;
    }
  }

  // 4. Nested error object error.error.message
  if (
    typeof error === 'object' &&
    error !== null &&
    'error' in error
  ) {
    const { error: nestedError } = error as { error: unknown };
    if (
      typeof nestedError === 'object' &&
      nestedError !== null &&
      'message' in nestedError
    ) {
      const { message: nestedMessage } = nestedError as { message: unknown };
      if (typeof nestedMessage === 'string' && nestedMessage) {
        return nestedMessage;
      }
    }
  }

  // 5. HTTP response error error.response.data.message
  if (hasResponse(error) && error.response?.data) {
    const responseData = error.response.data;
    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      'message' in responseData &&
      typeof responseData.message === 'string' &&
      responseData.message
    ) {
      return responseData.message;
    }
    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      'error' in responseData &&
      typeof responseData.error === 'string' &&
      responseData.error
    ) {
      return responseData.error;
    }
  }

  // 6. Return default message when completely unable to extract
  return '未知错误';
}
