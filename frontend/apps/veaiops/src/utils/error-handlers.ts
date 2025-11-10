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
import type { ApiError, ApiRequestOptions, OnCancel } from 'api-generate';
import { StatusCodes } from 'http-status-codes';
import { TokenManager } from './token-manager';

interface HandleUnauthorizedErrorParams<T> {
  options: ApiRequestOptions;
  /**
   * Promise resolve function
   * Why use (value: T | PromiseLike<T>) => void:
   * - resolve is the standard Promise resolve function type
   * - Accepts a result value of generic type T or PromiseLike<T>
   * - Matches the resolve type in CancelablePromise executor
   */
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
  onCancel: OnCancel;
  error: ApiError;
  apiClient: any;
  retryRequest: <TResult>(options: ApiRequestOptions) => Promise<TResult>;
}

interface HandleServerErrorParams<T> {
  options: ApiRequestOptions;
  /**
   * Promise resolve function
   * Why use (value: T | PromiseLike<T>) => void:
   * - resolve is the standard Promise resolve function type
   * - Accepts a result value of generic type T or PromiseLike<T>
   * - Matches the resolve type in CancelablePromise executor
   */
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
  onCancel: OnCancel;
  error: ApiError;
  apiClient: any;
  handleUnauthorizedError: <TResult>(
    params: HandleUnauthorizedErrorParams<TResult>,
  ) => Promise<void>;
  retryRequest: <TResult>(options: ApiRequestOptions) => Promise<TResult>;
}

interface HandleApiErrorParams<T> {
  error: ApiError;
  options: ApiRequestOptions;
  /**
   * Promise resolve function
   * Why use (value: T | PromiseLike<T>) => void:
   * - resolve is the standard Promise resolve function type
   * - Accepts a result value of generic type T or PromiseLike<T>
   * - Matches the resolve type in CancelablePromise executor
   */
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
  onCancel: OnCancel;
  apiClient: any;
  handleUnauthorizedError: <TResult>(
    params: HandleUnauthorizedErrorParams<TResult>,
  ) => Promise<void>;
  handleServerError: <TResult>(
    params: HandleServerErrorParams<TResult>,
  ) => Promise<void>;
  handleOtherHttpErrors: (error: ApiError) => string;
  retryRequest: <TResult>(options: ApiRequestOptions) => Promise<TResult>;
}

export async function handleUnauthorizedError<T>({
  options,
  resolve,
  reject,
  onCancel,
  error,
  apiClient,
  retryRequest,
}: HandleUnauthorizedErrorParams<T>): Promise<void> {
  try {
    const newToken = await TokenManager.refreshToken(apiClient);

    if (options.headers) {
      options.headers.Authorization = `Bearer ${newToken}`;
    }

    const retryPromise = retryRequest<T>(options);
    retryPromise.then(resolve).catch(reject);

    if (onCancel && typeof (retryPromise as any).cancel === 'function') {
      onCancel(() => (retryPromise as any).cancel());
    }
  } catch (_refreshError) {
    const errorObj =
      _refreshError instanceof Error
        ? _refreshError
        : new Error(String(_refreshError));
    const errorMessage = errorObj.message || 'Token 刷新失败';
    Message.error(errorMessage);
    logger.error({
      message: 'Token refresh failed',
      data: {
        error: errorMessage,
        stack: errorObj.stack,
        url: options.url,
        errorObj,
      },
      source: 'ApiClient',
      component: 'handleUnauthorizedError',
    });
    reject(errorObj);
  }
}

export async function handleServerError<T>({
  options,
  resolve,
  reject,
  onCancel,
  error,
  apiClient,
  handleUnauthorizedError: handleUnauthorizedErrorFn,
  retryRequest,
}: HandleServerErrorParams<T>): Promise<void> {
  const errorBody =
    error.body && typeof error.body === 'object'
      ? (error.body as { message?: string })
      : null;

  if (
    errorBody?.message?.includes('UnauthorizedError') &&
    errorBody?.message?.includes('status_code=401')
  ) {
    await handleUnauthorizedErrorFn({
      options,
      resolve,
      reject,
      onCancel,
      error,
      apiClient,
      retryRequest,
    });
  } else {
    const errorMessage =
      errorBody?.message || error.message || '服务器内部错误，请稍后重试';
    Message.error(errorMessage);
    logger.error({
      message: 'Internal server error',
      data: {
        error: errorMessage,
        status: error.status,
        url: options.url,
        errorBody,
        errorObj: error instanceof Error ? error : new Error(String(error)),
      },
      source: 'ApiClient',
      component: 'handleServerError',
    });
    reject(error);
  }
}

export function handleOtherHttpErrors(error: ApiError): string {
  logger.info({
    message: '[API Client] handleOtherHttpErrors called',
    data: {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      hasBody: Boolean(error.body),
      bodyType: typeof error.body,
    },
    source: 'ApiClient',
    component: 'handleOtherHttpErrors',
  });

  let errorMessage = '';
  if (error.body && typeof error.body === 'object') {
    const errorBody = error.body as {
      detail?: { message?: string };
      message?: string;
      error?: string;
      code?: number;
    };

    logger.info({
      message: '[API Client] Extracting error information from error.body',
      data: {
        hasMessage: Boolean(errorBody.message),
        hasDetailMessage: Boolean(errorBody.detail?.message),
        hasError: Boolean(errorBody.error),
        messageValue: errorBody.message,
        detailMessage: errorBody.detail?.message,
        errorValue: errorBody.error,
        code: errorBody.code,
      },
      source: 'ApiClient',
      component: 'handleOtherHttpErrors',
    });

    if (errorBody.message) {
      errorMessage = errorBody.message;
      logger.info({
        message:
          '[API Client] Extracted error information from errorBody.message',
        data: { extractedMessage: errorMessage },
        source: 'ApiClient',
        component: 'handleOtherHttpErrors',
      });
    } else if (errorBody.detail?.message) {
      errorMessage = errorBody.detail.message;
      logger.info({
        message:
          '[API Client] Extracted error information from errorBody.detail.message',
        data: { extractedMessage: errorMessage },
        source: 'ApiClient',
        component: 'handleOtherHttpErrors',
      });
    } else if (errorBody.error) {
      errorMessage = errorBody.error;
      logger.info({
        message:
          '[API Client] Extracted error information from errorBody.error',
        data: { extractedMessage: errorMessage },
        source: 'ApiClient',
        component: 'handleOtherHttpErrors',
      });
    }
  }

  let finalErrorMessage = '';
  if (error.status === 403) {
    finalErrorMessage = errorMessage || '权限不足，无法访问该资源';
  } else if (error.status === 404) {
    finalErrorMessage = errorMessage || '请求的资源不存在';
  } else if (error.status === 409) {
    finalErrorMessage = errorMessage || '资源冲突，请检查输入信息';
    logger.warn({
      message: '[API Client] 409 Conflict error',
      data: {
        extractedMessage: errorMessage,
        finalMessage: finalErrorMessage,
        url: error.url,
        body: error.body,
      },
      source: 'ApiClient',
      component: 'handleOtherHttpErrors',
    });
  } else if (error.status >= 500) {
    finalErrorMessage = errorMessage || '服务器错误，请稍后重试';
  } else {
    finalErrorMessage = errorMessage || error.statusText || '请求失败，请重试';
  }

  logger.error({
    message: `[API Client] HTTP ${error.status} error - Final error message`,
    data: {
      status: error.status,
      extractedMessage: errorMessage,
      finalErrorMessage,
      statusText: error.statusText,
      errorBody: error.body,
      url: error.url,
      errorObj: error instanceof Error ? error : new Error(String(error)),
    },
    source: 'ApiClient',
    component: 'handleOtherHttpErrors',
  });

  return finalErrorMessage;
}

export async function handleApiError<T>({
  error,
  options,
  resolve,
  reject,
  onCancel,
  apiClient,
  handleUnauthorizedError: handleUnauthorizedErrorFn,
  handleServerError: handleServerErrorFn,
  handleOtherHttpErrors: handleOtherHttpErrorsFn,
  retryRequest,
}: HandleApiErrorParams<T>): Promise<void> {
  logger.info({
    message: '[API Client] handleApiError called',
    data: {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      method: options.method,
      hasBody: Boolean(error.body),
      errorMessage: error.message,
    },
    source: 'ApiClient',
    component: 'handleApiError',
  });

  if (error.status === StatusCodes.UNAUTHORIZED) {
    logger.info({
      message: '[API Client] Handling 401 Unauthorized error',
      data: { url: error.url },
      source: 'ApiClient',
      component: 'handleApiError',
    });
    await handleUnauthorizedErrorFn({
      options,
      resolve,
      reject,
      onCancel,
      error,
      apiClient,
      retryRequest,
    });
  } else if (error.status === StatusCodes.INTERNAL_SERVER_ERROR) {
    logger.info({
      message: '[API Client] Handling 500 Internal Server Error',
      data: { url: error.url },
      source: 'ApiClient',
      component: 'handleApiError',
    });
    await handleServerErrorFn({
      options,
      resolve,
      reject,
      onCancel,
      error,
      apiClient,
      handleUnauthorizedError: handleUnauthorizedErrorFn,
      retryRequest,
    });
  } else {
    logger.info({
      message: `[API Client] Handling other HTTP error (${error.status})`,
      data: { status: error.status, url: error.url },
      source: 'ApiClient',
      component: 'handleApiError',
    });
    const errorMessage = handleOtherHttpErrorsFn(error);
    const errorObj = new Error(errorMessage);
    (errorObj as Error & { originalError?: ApiError }).originalError = error;

    logger.error({
      message: '[API Client] Ready to reject error object',
      data: {
        errorMessage,
        hasOriginalError: Boolean(errorObj),
        status: error.status,
        url: error.url,
      },
      source: 'ApiClient',
      component: 'handleApiError',
    });

    reject(errorObj);
  }
}

export function handleNetworkError(error: unknown): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const errorMessage = errorObj.message || '网络连接失败，请检查网络连接';
  Message.error(errorMessage);
  logger.error({
    message: 'Network connection failed',
    data: {
      error: errorMessage,
      stack: errorObj.stack,
      errorObj,
    },
    source: 'ApiClient',
    component: 'handleNetworkError',
  });
}
