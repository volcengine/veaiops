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

import { useEffect, useState } from 'react';

// Authentication state interface
export interface AuthState {
  isAuthenticated: boolean | null;
  isLoading: boolean;
  user: {
    username: string;
    token: string;
    isSupervisor?: string;
    userData?: string;
  } | null;
}

// Authentication configuration
export const authConfig = {
  // Storage key names
  storageKeys: {
    token: 'access_token',
    username: 'username',
    isSupervisor: 'is_supervisor',
    userData: 'id',
  },
  // Default redirect path - redirect to the first menu of the first top navigation
  defaultRedirectPath: '/statistics/overview',
  loginPath: '/login',
  // Token expiration time (milliseconds)
  tokenExpireTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  // Development mode configuration - set to true to bypass login verification
  devMode: {
    enabled: process.env.NODE_ENV === 'development', // Only enabled in development environment
    bypassAuth: false, // Set to false to use real authentication, true to bypass authentication
    mockUser: {
      username: 'dev-user',
      token: `dev-mock-token-${Date.now()}`,
    },
  },
} as const;

// Authentication Hook
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: null,
    isLoading: true,
    user: null,
  });

  // Initialize authentication state
  useEffect(() => {
    // Fix: Use localStorage instead of sessionStorage to support cross-tab authentication state sharing
    // Reason: sessionStorage is session-based, each tab has independent storage space
    // When opening a new tab with target="_blank", the new tab cannot access the parent tab's sessionStorage
    const token = localStorage.getItem(authConfig.storageKeys.token);
    const username = localStorage.getItem(authConfig.storageKeys.username);

    if (token && username) {
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: { username, token },
      });
    } else {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  }, []);

  // Login
  interface LoginParams {
    username: string;
    token: string;
  }

  const login = ({ username, token }: LoginParams) => {
    // Fix: Use localStorage instead of sessionStorage to support cross-tab authentication state sharing
    localStorage.setItem(authConfig.storageKeys.token, token);
    localStorage.setItem(authConfig.storageKeys.username, username);

    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: { username, token },
    });
  };

  // Logout
  const logout = () => {
    // Fix: Use localStorage instead of sessionStorage
    localStorage.removeItem(authConfig.storageKeys.token);
    localStorage.removeItem(authConfig.storageKeys.username);
    localStorage.removeItem(authConfig.storageKeys.isSupervisor);
    localStorage.removeItem(authConfig.storageKeys.userData);

    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  };

  // Check if authenticated
  const isAuthenticated = () => {
    return authState.isAuthenticated === true;
  };

  // Check if loading
  const isLoading = () => {
    return authState.isLoading;
  };

  return {
    ...authState,
    login,
    logout,
    isAuthenticated,
    isLoading,
  };
};
