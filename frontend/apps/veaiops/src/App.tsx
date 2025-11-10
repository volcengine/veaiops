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
import { BrowserRouter } from '@modern-js/runtime/router';
import type React from 'react';

// Global style imports - adjust loading order to ensure custom styles priority
import './index.css';
import '@veaiops/theme-ve-o';
import './styles/arco-theme.less';

import { SubscriptionProvider } from '@veaiops/components';
// Import components and configuration
import { ErrorBoundary, LoadingFallback } from './components';
import { AuthRoutes } from './components/auth/auth-routes';
import { useAuth } from './config/auth';
import { ThemeProvider, useTheme } from './contexts/theme-context';

// Loading state component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-base">
    <LoadingFallback />
  </div>
);

// Application content component (using theme)
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { themeConfig } = useTheme();

  // Display loading state
  if (isLoading()) {
    return <LoadingScreen />;
  }

  return (
    <ConfigProvider theme={themeConfig}>
      <ErrorBoundary>
        <SubscriptionProvider>
          <BrowserRouter>
            <AuthRoutes isAuthenticated={isAuthenticated()} />
          </BrowserRouter>
        </SubscriptionProvider>
      </ErrorBoundary>
    </ConfigProvider>
  );
};

// Main application component
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
