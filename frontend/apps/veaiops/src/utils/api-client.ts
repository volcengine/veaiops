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

import { authConfig } from '@/config/auth';
import { Message } from '@arco-design/web-react';
import {
  type ApiErrorResponse,
  extractApiErrorMessage,
  logger,
} from '@veaiops/utils';
import {
  ApiError,
  type ApiRequestOptions,
  type CancelablePromise,
  FetchHttpRequest,
  type OnCancel,
  VolcAIOpsApi,
} from 'api-generate';
import { StatusCodes } from 'http-status-codes';

/**
 * Token管理常量
 */
const TOKEN_KEY: string = authConfig.storageKeys.token;
const REFRESH_TOKEN_KEY: string = 'volcaiops_refresh_token';
const MAX_REFRESH_ATTEMPTS: number = 3;

// Assuming API_RESPONSE_CODE and other necessary constants are defined elsewhere.
// For demonstration, let's define a placeholder:
const API_RESPONSE_CODE = {
  SUCCESS: 0,
  // ... other codes
};

/**
 * 统一的后端错误响应类型
 *
 * 对应 Python 后端的 APIResponse 格式：
 * - veaiops/schema/models/base.py: APIResponse(code: int, message: str, data: Optional[T])
 * - veaiops/handler/errors/exception.py: BaseHTTPExc 使用 APIResponse 创建错误响应
 *
 * 错误响应格式：
 * {
 *   "code": 1,  // BUSINESS_CODE_GENERIC_ERROR
 *   "message": "Failed to create task: All connection attempts failed",
 *   "data": null
 * }
 *
 * ✅ 修复：从 @veaiops/utils 导入统一类型，避免重复定义
 * 注意：保留此处的导出以保持向后兼容性
 */
export type { ApiErrorResponse } from '@veaiops/utils';

let refreshPromise: Promise<string> | null = null;
let refreshAttempts = 0;
let proactiveRefreshTimer: number | null = null;

function parseJwtExp(token: string): number | null {
  try {
    const [, payloadBase64] = token.split('.') as [string, string, string];
    if (!payloadBase64) {
      return null;
    }
    const payloadJson = atob(
      payloadBase64.replace(/-/g, '+').replace(/_/g, '/'),
    );
    const payload = JSON.parse(payloadJson) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

/**
 * Token管理工具函数
 *
 * 修复：使用 localStorage 替代 sessionStorage，以支持跨标签页共享认证状态
 * 原因：sessionStorage 是基于浏览器会话的，每个标签页都有独立的存储空间
 * 当使用 target="_blank" 打开新标签页时，新标签页无法访问父标签页的 sessionStorage
 */
const TokenManager = {
  /**
   * 存储token到localStorage
   * 修复：使用 localStorage 替代 sessionStorage
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    // 设定一次"到期前2分钟"的静默刷新
    if (proactiveRefreshTimer) {
      window.clearTimeout(proactiveRefreshTimer);
      proactiveRefreshTimer = null;
    }
    const exp = parseJwtExp(token);
    if (exp) {
      const nowSec = Math.floor(Date.now() / 1000);
      const refreshInMs = Math.max((exp - nowSec - 120) * 1000, 0);
      proactiveRefreshTimer = window.setTimeout(() => {
        // 页面可见时才静默刷新，避免后台标签页无限续期
        if (document.visibilityState === 'visible') {
          TokenManager.refreshToken().catch(() => {
            // 刷新失败由 refreshToken 内部处理
          });
        }
      }, refreshInMs);
    }
  },

  /**
   * 存储refresh token到localStorage
   * 修复：使用 localStorage 替代 sessionStorage
   */
  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  /**
   * 获取token
   * 修复：使用 localStorage 替代 sessionStorage
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * 获取refresh token
   * 修复：使用 localStorage 替代 sessionStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * 清除所有token
   * 修复：使用 localStorage 替代 sessionStorage
   */
  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    refreshPromise = null;
    refreshAttempts = 0;
    if (proactiveRefreshTimer) {
      window.clearTimeout(proactiveRefreshTimer);
      proactiveRefreshTimer = null;
    }
  },

  /**
   * 清除access token
   * 修复：使用 localStorage 替代 sessionStorage
   */
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * 重定向到登录页
   */
  redirectToLogin(): void {
    this.clearTokens();
    Message.error('登录已过期，请重新登录');

    // 延迟跳转，确保消息显示
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  },

  /**
   * 静默刷新token
   */
  async refreshToken(): Promise<string> {
    // 如果已经有刷新请求在进行中，返回同一个Promise
    if (refreshPromise) {
      return refreshPromise;
    }

    // 检查刷新次数
    if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      this.redirectToLogin();
      throw new Error('Token refresh failed after maximum attempts');
    }

    refreshAttempts++;

    refreshPromise = this.performRefresh();

    try {
      const newToken = await refreshPromise;
      refreshAttempts = 0; // 重置刷新次数
      return newToken;
    } catch (error: unknown) {
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        this.redirectToLogin();
      }
      // ✅ 正确：将错误转换为 Error 对象再抛出（符合 @typescript-eslint/only-throw-error 规则）
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      throw errorObj;
    } finally {
      refreshPromise = null;
    }
  },

  /**
   * 执行token刷新
   */
  async performRefresh(): Promise<string> {
    const currentToken = this.getToken();

    if (!currentToken) {
      throw new Error('No token available for refresh');
    }

    try {
      const response =
        await apiClient.authentication.postApisV1AuthRefreshToken({
          requestBody: {
            token: currentToken,
          },
        });

      if (
        response.code === API_RESPONSE_CODE.SUCCESS &&
        response.data?.access_token
      ) {
        const newToken = response.data.access_token;
        this.setToken(newToken);
        return newToken;
      }

      throw new Error(response.message || 'Token refresh failed');
    } catch (error: unknown) {
      // 刷新失败时清除令牌
      this.clearToken();
      // ✅ 正确：将错误转换为 Error 对象再抛出（符合 @typescript-eslint/only-throw-error 规则）
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      throw errorObj;
    }
  },
};

/**
 * 自定义HTTP请求类，处理token和401鉴权错误
 */
interface HandleUnauthorizedErrorParams<T> {
  options: ApiRequestOptions;
  /**
   * Promise resolve 函数
   * 为什么使用 (value: T) => void：
   * - resolve 是 Promise 的标准 resolve 函数类型
   * - 接受泛型 T 类型的结果值
   */
  resolve: (value: T) => void;
  /**
   * Promise reject 函数
   * 为什么使用 (reason?: unknown) => void：
   * - reject 是 Promise 的标准 reject 函数类型
   * - 接受可选的错误原因（unknown 类型更安全）
   */
  reject: (reason?: unknown) => void;
  /**
   * 取消回调函数
   * 为什么使用 OnCancel：
   * - OnCancel 是 api-generate 中定义的标准取消回调类型
   * - 符合 CancelablePromise 的取消机制
   */
  onCancel: OnCancel;
  error: ApiError;
}

interface HandleServerErrorParams<T> {
  options: ApiRequestOptions;
  /**
   * Promise resolve 函数
   */
  resolve: (value: T) => void;
  /**
   * Promise reject 函数
   */
  reject: (reason?: unknown) => void;
  /**
   * 取消回调函数
   */
  onCancel: OnCancel;
  error: ApiError;
}

interface HandleApiErrorParams<T> {
  error: ApiError;
  options: ApiRequestOptions;
  /**
   * Promise resolve 函数
   */
  resolve: (value: T) => void;
  /**
   * Promise reject 函数
   */
  reject: (reason?: unknown) => void;
  /**
   * 取消回调函数
   */
  onCancel: OnCancel;
}

class CustomFetchHttpRequest extends FetchHttpRequest {
  /**
   * 处理401未授权错误
   */
  private async handleUnauthorizedError<T>({
    options,
    resolve,
    reject,
    onCancel,
    error,
  }: HandleUnauthorizedErrorParams<T>): Promise<void> {
    try {
      const newToken = await TokenManager.refreshToken();

      if (options.headers) {
        options.headers.Authorization = `Bearer ${newToken}`;
      }

      const retryPromise = super.request<T>(options);
      retryPromise.then(resolve).catch(reject);

      if (onCancel && typeof retryPromise.cancel === 'function') {
        onCancel(() => retryPromise.cancel());
      }
    } catch (_refreshError) {
      // ✅ 正确：透出实际错误信息，而不是固定消息
      const errorObj =
        _refreshError instanceof Error
          ? _refreshError
          : new Error(String(_refreshError));
      const errorMessage = errorObj.message || 'Token 刷新失败';
      Message.error(errorMessage);
      // ✅ 正确：使用 logger 记录错误，并透出实际错误信息
      logger.error({
        message: 'Token 刷新失败',
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

  /**
   * 处理500服务器错误
   */
  private async handleServerError<T>({
    options,
    resolve,
    reject,
    onCancel,
    error,
  }: HandleServerErrorParams<T>): Promise<void> {
    // ✅ 修复：使用统一的 extractApiErrorMessage 工具函数提取错误信息
    const errorMessage = extractApiErrorMessage(
      error,
      '服务器内部错误，请稍后重试',
    );

    // 检查错误消息中是否包含 401 信息（500错误中包含401信息，也尝试刷新token）
    if (
      errorMessage.includes('UnauthorizedError') &&
      errorMessage.includes('status_code=401')
    ) {
      // 500错误中包含401信息，也尝试刷新token
      await this.handleUnauthorizedError<T>({
        options,
        resolve,
        reject,
        onCancel,
        error,
      });
    } else {
      // ✅ 修复：不显示 Message.error，只记录日志
      // 原因：让业务代码决定如何显示错误消息，避免重复提示
      logger.error({
        message: '服务器内部错误',
        data: {
          error: errorMessage,
          status: error.status,
          url: options.url,
          errorBody: error.body,
          errorObj: error instanceof Error ? error : new Error(String(error)),
        },
        source: 'ApiClient',
        component: 'handleServerError',
      });
      reject(error);
    }
  }

  /**
   * 处理其他HTTP错误
   *
   * ✅ 修复：不显示 Message.error，只返回错误消息
   * 原因：让调用方决定如何显示错误消息，避免双重提示
   */
  private handleOtherHttpErrors(error: ApiError): string {
    // 记录进入错误处理函数
    logger.info({
      message: '[API Client] handleOtherHttpErrors 被调用',
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

    // ✅ 修复：使用统一的 extractApiErrorMessage 工具函数提取错误信息
    // 尝试从 error.body 中提取详细错误信息
    const errorMessage = extractApiErrorMessage(error, '');

    // ✅ 正确：优先透出实际错误信息，如果没有则使用默认消息
    let finalErrorMessage = '';
    if (error.status === StatusCodes.FORBIDDEN) {
      finalErrorMessage = errorMessage || '权限不足，无法访问该资源';
    } else if (error.status === StatusCodes.NOT_FOUND) {
      finalErrorMessage = errorMessage || '请求的资源不存在';
    } else if (error.status === StatusCodes.CONFLICT) {
      // ✅ 特别处理 409 Conflict 错误
      finalErrorMessage = errorMessage || '资源冲突，请检查输入信息';
      logger.warn({
        message: '[API Client] 409 Conflict 错误',
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
      finalErrorMessage =
        errorMessage || error.statusText || '请求失败，请重试';
    }

    // 记录最终的错误消息
    logger.error({
      message: `[API Client] HTTP ${error.status} 错误 - 最终错误消息`,
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

  /**
   * 处理API错误
   */
  private async handleApiError<T>({
    error,
    options,
    resolve,
    reject,
    onCancel,
  }: HandleApiErrorParams<T>): Promise<void> {
    // 记录进入 handleApiError
    logger.info({
      message: '[API Client] handleApiError 被调用',
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
        message: '[API Client] 处理 401 Unauthorized 错误',
        data: { url: error.url },
        source: 'ApiClient',
        component: 'handleApiError',
      });
      await this.handleUnauthorizedError({
        options,
        resolve,
        reject,
        onCancel,
        error,
      });
    } else if (error.status === StatusCodes.INTERNAL_SERVER_ERROR) {
      logger.info({
        message: '[API Client] 处理 500 Internal Server Error',
        data: { url: error.url },
        source: 'ApiClient',
        component: 'handleApiError',
      });
      await this.handleServerError<T>({
        options,
        resolve,
        reject,
        onCancel,
        error,
      });
    } else {
      logger.info({
        message: `[API Client] 处理其他 HTTP 错误 (${error.status})`,
        data: { status: error.status, url: error.url },
        source: 'ApiClient',
        component: 'handleApiError',
      });
      // ✅ 修复：提取错误消息并创建 Error 对象，然后 reject
      // 原因：让调用方的 catch 块能正确捕获错误和错误消息
      const errorMessage = this.handleOtherHttpErrors(error);
      const errorObj = new Error(errorMessage);
      // 保留原始 ApiError 信息供调试
      (errorObj as Error & { originalError?: ApiError }).originalError = error;

      // 记录准备 reject 的错误对象
      logger.error({
        message: '[API Client] 准备 reject 错误对象',
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

  /**
   * 处理网络错误
   */
  private handleNetworkError(error: unknown): void {
    // ✅ 正确：透出实际错误信息
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorMessage = errorObj.message || '网络连接失败，请检查网络连接';
    Message.error(errorMessage);
    // ✅ 正确：使用 logger 记录错误，并透出实际错误信息
    logger.error({
      message: '网络连接失败',
      data: {
        error: errorMessage,
        stack: errorObj.stack,
        errorObj,
      },
      source: 'ApiClient',
      component: 'handleNetworkError',
    });
  }

  /**
   * 重写request方法，添加token和错误处理
   */
  public request<T>(options: ApiRequestOptions): CancelablePromise<T> {
    // 记录请求开始
    logger.debug({
      message: '[API Client] 发起 API 请求',
      data: {
        method: options.method,
        url: options.url,
        hasBody: Boolean(options.body),
      },
      source: 'ApiClient',
      component: 'request',
    });

    // 获取token并添加到请求头
    const token = TokenManager.getToken();
    let requestOptions = options;

    // 排除不需要 Authorization header 的请求（如登录请求）
    const isAuthRequest =
      options.url?.includes('/apis/v1/auth/token') ||
      options.url?.includes('/login');

    if (token && !isAuthRequest) {
      // 创建新的 options 对象，确保 headers 存在
      requestOptions = {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      };
    }

    const originalPromise = super.request<T>(requestOptions);

    // 包装原始Promise，添加错误处理
    // 注意：CancelablePromise 的构造函数签名需要使用类型断言
    // 因为我们需要动态创建相同类型的 Promise 实例
    // 使用 CancelablePromise 的构造函数类型定义，而不是 any
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
            // 记录请求成功
            logger.debug({
              message: '[API Client] API 请求成功',
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
            // 记录捕获到错误
            logger.warn({
              message: '[API Client] 捕获到请求错误',
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
              // 记录 ApiError 详情
              logger.error({
                message: '[API Client] ApiError 详情',
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

              // 打印完整错误信息，包括 body
              await this.handleApiError<T>({
                error,
                options,
                resolve,
                reject,
                onCancel,
              });
            } else {
              logger.error({
                message: '[API Client] 网络错误或其他错误',
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

        // 传递取消回调
        if (onCancel && typeof originalPromise.cancel === 'function') {
          onCancel(() => originalPromise.cancel());
        }
      },
    );
  }
}

/**
 * API客户端实例
 *
 * 注意：CustomFetchHttpRequest 继承自 FetchHttpRequest，
 * 而 VolcAIOpsApi 期望 HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest
 * 由于 TypeScript 的类型系统限制，需要进行类型断言
 */
const apiClient = new VolcAIOpsApi(
  {
    BASE: '',
  },
  CustomFetchHttpRequest as typeof FetchHttpRequest,
);

/**
 * 导出Token管理器，供登录页面使用
 */
export { TokenManager };

export default apiClient;
