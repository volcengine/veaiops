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
 * Unified backend error response type
 *
 * Corresponds to Python backend APIResponse format:
 * - veaiops/schema/models/base.py: APIResponse(code: int, message: str, data: Optional[T])
 * - veaiops/handler/errors/exception.py: BaseHTTPExc uses APIResponse to create error responses
 *
 * Error response format:
 * {
 *   "code": 1,  // BUSINESS_CODE_GENERIC_ERROR
 *   "message": "Failed to create task: All connection attempts failed",
 *   "data": null
 * }
 */
export interface ApiErrorResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
}

/**
 * Extract error message from API error object
 *
 * Priority:
 * 1. ApiErrorResponse format: error.body.detail.message (from backend APIResponse)
 *    Error structure: { body: { detail: { code, message, data } } }
 * 2. Error instance: error.message
 * 3. Object with message property: error.message
 * 4. Default error message (only used when completely unable to extract)
 *
 * @param error - Error object (unknown type)
 * @param defaultMessage - Default error message, used when unable to extract error message
 * @returns Extracted error message string
 *
 * @example
 * ```typescript
 * // Basic usage
 * const errorMessage = extractApiErrorMessage(error);
 * // Result: "Failed to create task: All connection attempts failed"
 *
 * // With default message
 * const errorMessage = extractApiErrorMessage(error, '操作失败，请重试');
 * // Result: "Failed to create task: All connection attempts failed" or "操作失败，请重试"
 *
 * // Usage in catch block
 * try {
 *   await createTask(taskData);
 * } catch (error: unknown) {
 *   const errorMessage = extractApiErrorMessage(error, '创建任务失败：未知错误');
 *   logger.error({
 *     message: '创建任务失败',
 *     data: { error: errorMessage },
 *     source: 'TaskAPI',
 *     component: 'createTask',
 *   });
 *   throw new Error(errorMessage);
 * }
 * ```
 */
export function extractApiErrorMessage(
  error: unknown,
  defaultMessage = '操作失败，请稍后重试',
): string {
  // 1. Check if error is ApiError with ApiErrorResponse body
  // Error structure: { body: { detail: { code, message, data } } }
  if (
    error &&
    typeof error === 'object' &&
    'body' in error &&
    error.body &&
    typeof error.body === 'object' &&
    'detail' in error.body &&
    error.body.detail &&
    typeof error.body.detail === 'object' &&
    'message' in error.body.detail &&
    typeof (error.body.detail as { message: unknown }).message === 'string'
  ) {
    const errorDetail = error.body.detail as ApiErrorResponse;
    if (errorDetail.message) {
      return errorDetail.message;
    }
  }

  // 2. Error instance
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  // 3. Object with message property
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    const errorMessage = (error as { message: string }).message;
    if (errorMessage) {
      return errorMessage;
    }
  }

  // 4. String type
  if (typeof error === 'string') {
    return error;
  }

  // 5. Default message
  return defaultMessage;
}
