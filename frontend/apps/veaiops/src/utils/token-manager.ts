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

const TOKEN_KEY = 'volcaiops_token';
const REFRESH_TOKEN_KEY = 'volcaiops_refresh_token';
const MAX_REFRESH_ATTEMPTS = 3;
const API_RESPONSE_CODE = {
  SUCCESS: 0,
};

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

export const TokenManager = {
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    if (proactiveRefreshTimer) {
      window.clearTimeout(proactiveRefreshTimer);
      proactiveRefreshTimer = null;
    }
    const exp = parseJwtExp(token);
    if (exp) {
      const nowSec = Math.floor(Date.now() / 1000);
      const refreshInMs = Math.max((exp - nowSec - 120) * 1000, 0);
      proactiveRefreshTimer = window.setTimeout(() => {
        if (document.visibilityState === 'visible') {
          const apiClient = (window as any).__volcaiopsApiClient;
          if (apiClient) {
            TokenManager.refreshToken(apiClient).catch(() => {});
          }
        }
      }, refreshInMs);
    }
  },

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

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

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  redirectToLogin(): void {
    this.clearTokens();
    Message.error('登录已过期，请重新登录');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  },

  async refreshToken(apiClient: any): Promise<string> {
    if (refreshPromise) {
      return refreshPromise;
    }

    if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      this.redirectToLogin();
      throw new Error('Token refresh failed after maximum attempts');
    }

    refreshAttempts++;

    refreshPromise = this.performRefresh(apiClient);

    try {
      const newToken = await refreshPromise;
      refreshAttempts = 0;
      return newToken;
    } catch (error: unknown) {
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        this.redirectToLogin();
      }
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      throw errorObj;
    } finally {
      refreshPromise = null;
    }
  },

  async performRefresh(apiClient: any): Promise<string> {
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
      this.clearToken();
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      throw errorObj;
    }
  },
};
