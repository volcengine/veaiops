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

import { logger } from '@veaiops/utils';
import {
  ApiError,
  type ApiRequestOptions,
  type CancelablePromise,
  FetchHttpRequest,
  type OnCancel,
  VolcAIOpsApi,
} from 'api-generate';
import { StatusCodes } from 'http-status-codes';
import {
  handleApiError as handleApiErrorFn,
  handleNetworkError as handleNetworkErrorFn,
  handleOtherHttpErrors as handleOtherHttpErrorsFn,
  handleServerError as handleServerErrorFn,
  handleUnauthorizedError as handleUnauthorizedErrorFn,
} from './error-handlers';
import { TokenManager } from './token-manager';

/**
 * Custom HTTP request class that handles tokens and 401 authentication errors
 */
interface HandleUnauthorizedErrorParams<T> {
  options: ApiRequestOptions;
  /**
   * Promise resolve function
   * Why use (value: T) => void:
   * - resolve is the standard Promise resolve function type
   * - Accepts a result value of generic type T
   */
  resolve: (value: T) => void;
  /**
   * Promise reject function
   * Why use (reason?: unknown) => void:
   * - reject is the standard Promise reject function type
   * - Accepts an optional error reason (unknown type is safer)
   */
  reject: (reason?: unknown) => void;
  /**
   * Cancel callback function
   * Why use OnCancel:
   * - OnCancel is the standard cancel callback type defined in api-generate
   * - Complies with CancelablePromise cancellation mechanism
   */
  onCancel: OnCancel;
  error: ApiError;
}

interface HandleServerErrorParams {
  options: ApiRequestOptions;
  /**
   * Promise resolve function
   */
  resolve: (value: unknown) => void;
  /**
   * Promise reject function
   */
  reject: (reason?: unknown) => void;
  /**
   * Cancel callback function
   */
  onCancel: OnCancel;
  error: ApiError;
}

interface HandleApiErrorParams {
  error: ApiError;
  options: ApiRequestOptions;
  /**
   * Promise resolve function
   */
  resolve: (value: unknown) => void;
  /**
   * Promise reject function
   */
  reject: (reason?: unknown) => void;
  /**
   * Cancel callback function
   */
  onCancel: OnCancel;
}

let apiClientInstance: any = null;

function getApiClient() {
  return apiClientInstance;
}

class CustomFetchHttpRequest extends FetchHttpRequest {
  private apiClient: any;

  constructor(config: any) {
    super(config);
    this.apiClient = null;
  }

  setApiClient(client: any): void {
    this.apiClient = client;
  }

  private async handleUnauthorizedError<T>({
    options,
    resolve,
    reject,
    onCancel,
    error,
  }: HandleUnauthorizedErrorParams<T>): Promise<void> {
    const apiClient = this.apiClient || getApiClient();
    await handleUnauthorizedErrorFn({
      options,
      resolve,
      reject,
      onCancel,
      error,
      apiClient,
      retryRequest: (opts) => super.request(opts),
    });
  }

  private async handleServerError({
    options,
    resolve,
    reject,
    onCancel,
    error,
  }: HandleServerErrorParams): Promise<void> {
    const apiClient = this.apiClient || getApiClient();
    await handleServerErrorFn({
      options,
      resolve,
      reject,
      onCancel,
      error,
      apiClient,
      handleUnauthorizedError: handleUnauthorizedErrorFn,
      retryRequest: (opts) => super.request(opts),
    });
  }

  private handleOtherHttpErrors(error: ApiError): string {
    return handleOtherHttpErrorsFn(error);
  }

  private async handleApiError({
    error,
    options,
    resolve,
    reject,
    onCancel,
  }: HandleApiErrorParams): Promise<void> {
    const apiClient = this.apiClient || getApiClient();
    await handleApiErrorFn({
      error,
      options,
      resolve,
      reject,
      onCancel,
      apiClient,
      handleUnauthorizedError: handleUnauthorizedErrorFn,
      handleServerError: handleServerErrorFn,
      handleOtherHttpErrors: handleOtherHttpErrorsFn,
      retryRequest: (opts) => super.request(opts),
    });
  }

  private handleNetworkError(error: unknown): void {
    handleNetworkErrorFn(error);
  }

  /**
   * Override request method, add token and error handling
   */
  public request<T>(options: ApiRequestOptions): CancelablePromise<T> {
    // Log request start
    logger.debug({
      message: '[API Client] Initiating API request',
      data: {
        method: options.method,
        url: options.url,
        hasBody: Boolean(options.body),
      },
      source: 'ApiClient',
      component: 'request',
    });

    // Get token and add to request headers
    const token = TokenManager.getToken();
    let requestOptions = options;

    // Exclude requests that don't need Authorization header (e.g., login requests)
    const isAuthRequest =
      options.url?.includes('/apis/v1/auth/token') ||
      options.url?.includes('/login');

    if (token && !isAuthRequest) {
      // Create new options object, ensure headers exist
      requestOptions = {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      };
    }

    const originalPromise = super.request<T>(requestOptions);

    // Wrap original Promise, add error handling
    // Note: CancelablePromise constructor signature requires type assertion
    // Because we need to dynamically create Promise instance of the same type
    // Use CancelablePromise constructor type definition, not any
    return new (
      originalPromise.constructor as new <TResult>(
        executor: (
          resolve: (value: TResult | PromiseLike<TResult>) => void,
          reject: (reason?: unknown) => void,
          onCancel: OnCancel,
        ) => void,
      ) => CancelablePromise<T>
    )(
      (
        resolve: (value: T | PromiseLike<T>) => void,
        reject: (reason?: unknown) => void,
        onCancel: OnCancel,
      ) => {
        originalPromise
          .then((result) => {
            // Log request success
            logger.debug({
              message: '[API Client] API request successful',
              data: {
                url: options.url,
                method: options.method,
                hasResult: Boolean(result),
              },
              source: 'ApiClient',
              component: 'request',
            });
            resolve(result);
          })
          .catch(async (error: unknown) => {
            // Log caught error
            logger.warn({
              message: '[API Client] Request error caught',
              data: {
                isApiError: error instanceof ApiError,
                errorType: error?.constructor?.name,
                url: options.url,
                method: options.method,
              },
              source: 'ApiClient',
              component: 'request',
            });

            if (error instanceof ApiError) {
              // Log ApiError details
              logger.error({
                message: '[API Client] ApiError details',
                data: {
                  status: error.status,
                  statusText: error.statusText,
                  url: error.url,
                  message: error.message,
                  body: error.body,
                },
                source: 'ApiClient',
                component: 'request',
              });

              // Print complete error information, including body
              await this.handleApiError({
                error,
                options,
                resolve,
                reject,
                onCancel,
              });
            } else {
              logger.error({
                message: '[API Client] Network error or other error',
                data: {
                  error: error instanceof Error ? error.message : String(error),
                  errorType: error?.constructor?.name,
                },
                source: 'ApiClient',
                component: 'request',
              });
              this.handleNetworkError(error);
              reject(error);
            }
          });

        // Pass cancel callback
        if (onCancel && typeof originalPromise.cancel === 'function') {
          onCancel(() => originalPromise.cancel());
        }
      },
    );
  }
}

/**
 * API client instance
 *
 * Note: CustomFetchHttpRequest extends FetchHttpRequest,
 * while VolcAIOpsApi expects HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest
 * Due to TypeScript type system limitations, type assertion is required
 */
const apiClient = new VolcAIOpsApi(
  {
    BASE: '',
  },
  CustomFetchHttpRequest as typeof FetchHttpRequest,
);

apiClientInstance = apiClient;
(window as any).__volcaiopsApiClient = apiClient;

const httpRequest = apiClient.request as any;
if (httpRequest?.setApiClient) {
  httpRequest.setApiClient(apiClient);
}

export { TokenManager };

export default apiClient;
