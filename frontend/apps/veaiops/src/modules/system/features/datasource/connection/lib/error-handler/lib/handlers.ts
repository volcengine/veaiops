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

import { Message } from '@arco-design/web-react';
import { logger } from '@veaiops/utils';
import { getErrorMessage } from './message-extractor';
import { hasMessage, hasResponse, hasStatus, isNetworkError } from './type-guards';

/**
 * Show error message parameter interface
 */
export interface ShowErrorMessageParams {
  error: unknown;
  defaultMessage?: string;
}

/**
 * Show error message
 */
export function showErrorMessage({ error, defaultMessage = '操作失败' }: ShowErrorMessageParams): void {
  const message = getErrorMessage(error) || defaultMessage;
  Message.error(message);
}

/**
 * Handle API error parameter interface
 */
export interface HandleApiErrorParams {
  error: unknown;
  context?: string;
}

/**
 * Handle API error
 */
export function handleApiError({ error, context }: HandleApiErrorParams): void {
  // ✅ Correct: use type guard to create Error object
  const errorObj =
    error instanceof Error ? error : new Error(String(error));

  logger.error({
    message: `API Error${context ? ` in ${context}` : ''}`,
    data: {
      error: errorObj.message,
      stack: errorObj.stack,
      originalError: error,
    },
    source: 'ErrorHandler',
    component: 'handleApiError',
  });

  const message = getErrorMessage(error);
  Message.error(message);
}

/**
 * Handle network error
 * @param error Error object (unknown type)
 */
export function handleNetworkError(error: unknown): void {
  // ✅ Correct: use type guard to create Error object
  const errorObj =
    error instanceof Error ? error : new Error(String(error));

  logger.error({
    message: 'Network Error',
    data: {
      error: errorObj.message,
      stack: errorObj.stack,
      originalError: error,
    },
    source: 'ErrorHandler',
    component: 'handleNetworkError',
  });

  // ✅ Correct: expose actual error information, not use fixed message
  // Prioritize extracting actual error information, only use default message when unable to extract
  let errorMessage: string;

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (hasMessage(error)) {
    const { message } = error;
    errorMessage = typeof message === 'string' && message ? message : '网络请求失败';
  } else if (isNetworkError(error)) {
    errorMessage = '网络连接失败，请检查网络设置';
  } else {
    errorMessage = '网络请求失败';
  }

  // Prioritize displaying actual error information
  Message.error(errorMessage);
}

/**
 * Handle permission error
 * @param error Error object (unknown type)
 */
export function handlePermissionError(error: unknown): void {
  // ✅ Correct: use type guard to create Error object
  const errorObj =
    error instanceof Error ? error : new Error(String(error));

  logger.error({
    message: 'Permission Error',
    data: {
      error: errorObj.message,
      stack: errorObj.stack,
      originalError: error,
    },
    source: 'ErrorHandler',
    component: 'handlePermissionError',
  });

  // ✅ Correct: expose actual error information, not use fixed message
  let errorMessage: string;

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (hasMessage(error)) {
    const { message } = error;
    errorMessage = typeof message === 'string' && message ? message : '访问被拒绝';
  } else {
    errorMessage = '访问被拒绝';
  }

  // Prioritize displaying actual error information, if none then provide default prompt based on status code
  if (errorMessage && errorMessage !== '访问被拒绝') {
    Message.error(errorMessage);
  } else if (
    (hasStatus(error) && error.status === 403) ||
    (hasResponse(error) && error.response?.status === 403)
  ) {
    Message.error('权限不足，请联系管理员');
  } else {
    Message.error(errorMessage || '访问被拒绝');
  }
}

/**
 * General error handler parameter interface
 */
export interface HandleErrorOptions {
  context?: string;
  showMessage?: boolean;
  logError?: boolean;
}

/**
 * General error handler
 * @param error Error object (unknown type)
 * @param options Handling options
 */
export function handleError(
  error: unknown,
  options: HandleErrorOptions = {},
): void {
  const { context, showMessage = true, logError = true } = options;

  if (logError) {
    // ✅ Correct: use type guard to create Error object
    const errorObj =
      error instanceof Error ? error : new Error(String(error));

    logger.error({
      message: `Error${context ? ` in ${context}` : ''}`,
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        originalError: error,
      },
      source: 'ErrorHandler',
      component: context || 'handleError',
    });
  }

  if (showMessage) {
    const message = getErrorMessage(error);
    Message.error(message);
  }
}
