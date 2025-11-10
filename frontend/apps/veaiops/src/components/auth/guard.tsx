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

import { Spin } from '@arco-design/web-react';
import { Navigate } from '@modern-js/runtime/router';
import type React from 'react';
import { useEffect, useState } from 'react';
import { authConfig } from '../../config/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Development mode debug logging
      console.debug('AuthGuard: Checking authentication status');
    }

    // Development mode bypass authentication
    if (authConfig.devMode.enabled && authConfig.devMode.bypassAuth) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('AuthGuard: Development mode - bypassing authentication');
      }

      // Automatically set mock user information
      sessionStorage.setItem(
        authConfig.storageKeys.token,
        authConfig.devMode.mockUser.token,
      );
      sessionStorage.setItem(
        authConfig.storageKeys.username,
        authConfig.devMode.mockUser.username,
      );

      if (process.env.NODE_ENV === 'development') {
        console.debug('AuthGuard: Mock user set successfully');
      }
      setIsAuthenticated(true);
      return;
    }

    // Normal authentication flow
    const token = sessionStorage.getItem(authConfig.storageKeys.token);
    if (process.env.NODE_ENV === 'development') {
      console.debug('AuthGuard: Checking for existing token');
    }
    setIsAuthenticated(Boolean(token));
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export { AuthGuard };
export default AuthGuard;
