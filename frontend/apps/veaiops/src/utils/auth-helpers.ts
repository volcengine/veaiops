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
import { TokenManager } from './api-client';

/**
 * Login response data type
 */
export interface LoginResponse {
  token: string;
  refreshToken?: string;
  userInfo?: {
    id: string;
    username: string;
    email: string;
  };
}

/**
 * Handle login success
 * @param loginResponse Login API response data
 */
export const handleLoginSuccess = (loginResponse: LoginResponse): void => {
  try {
    // Store token to localStorage
    TokenManager.setToken(loginResponse.token);

    // If refresh token exists, also store it
    if (loginResponse.refreshToken) {
      TokenManager.setRefreshToken(loginResponse.refreshToken);
    }

    Message.success('Login successful');
  } catch (error: unknown) {
    // ✅ Correct: Expose actual error information
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorMessage = errorObj.message || 'Failed to save login state';
    Message.error(errorMessage);
  }
};

/**
 * Handle logout
 */
export const handleLogout = (): void => {
  try {
    // Clear all tokens
    TokenManager.clearTokens();

    Message.success('Logged out successfully');

    // Delay redirect to ensure message is displayed
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  } catch (error: unknown) {
    // Even if error occurs, redirect to login page (silent handling, no logging)
    // ✅ Note: Silent handling here is expected behavior to ensure user can redirect to login page
    if (process.env.NODE_ENV === 'development') {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      console.warn(
        '[auth-helpers] Logout handling failed (silent handling):',
        errorObj.message,
      );
    }
    window.location.href = '/login';
  }
};

/**
 * Check if user is logged in
 */
export const isUserLoggedIn = (): boolean => {
  try {
    const token = TokenManager.getToken();
    return Boolean(token);
  } catch (error: unknown) {
    // Token check failed, return false (silent handling)
    // ✅ Note: Silent handling here is expected behavior to ensure login status check is not blocked by exceptions
    if (process.env.NODE_ENV === 'development') {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      console.warn(
        '[auth-helpers] Token check failed (silent handling):',
        errorObj.message,
      );
    }
    return false;
  }
};

/**
 * Get current user token
 */
export const getCurrentToken = (): string | null => {
  try {
    return TokenManager.getToken();
  } catch (error: unknown) {
    // Failed to get token, return null (silent handling)
    // ✅ Note: Silent handling here is expected behavior to ensure it's not blocked by exceptions
    if (process.env.NODE_ENV === 'development') {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      console.warn(
        '[auth-helpers] Failed to get token (silent handling):',
        errorObj.message,
      );
    }
    return null;
  }
};

/**
 * Force refresh token
 * @returns New token
 */
export const forceRefreshToken = async (): Promise<string | null> => {
  try {
    const newToken = await TokenManager.refreshToken();

    return newToken;
  } catch (error: unknown) {
    // Token refresh failed, return null (silent handling)
    // ✅ Note: Silent handling here is expected behavior to ensure it's not blocked by exceptions
    if (process.env.NODE_ENV === 'development') {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      console.warn(
        '[auth-helpers] Token refresh failed (silent handling):',
        errorObj.message,
      );
    }
    return null;
  }
};
