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

import { ConfigProvider } from '@arco-design/web-react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from '@modern-js/runtime/router';
import type React from 'react';
import { Suspense } from 'react';

import { authConfig } from '@/config/auth';
import { LoginPage } from '@/modules/auth';

import { routesConfig } from '@/config/routes';
import type { RouteConfig } from '@/types/route';
import { AppLayout } from '../common/app-layout';
import { themeConfig } from '../config/theme-config';
import { LoadingFallback } from '../ui/loading-fallback';

// Authentication route component Props
interface AuthRoutesProps {
  isAuthenticated: boolean;
}

// Authentication route component
export const AuthRoutes: React.FC<AuthRoutesProps> = ({ isAuthenticated }) => {
  const location = useLocation();

  // If not authenticated and not on login page, redirect to login page
  if (!isAuthenticated && location.pathname !== authConfig.loginPath) {
    return <Navigate to={authConfig.loginPath} replace />;
  }

  // If authenticated and on login page, redirect to default page
  if (isAuthenticated && location.pathname === authConfig.loginPath) {
    return <Navigate to={authConfig.defaultRedirectPath} replace />;
  }

  // If not authenticated and on login page, show login page
  if (!isAuthenticated && location.pathname === authConfig.loginPath) {
    return (
      <ConfigProvider theme={themeConfig}>
        <LoginPage />
      </ConfigProvider>
    );
  }

  // Authenticated user, show full application layout
  return (
    <ConfigProvider theme={themeConfig}>
      <AppLayout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {routesConfig.map((route: RouteConfig) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </Suspense>
      </AppLayout>
    </ConfigProvider>
  );
};
