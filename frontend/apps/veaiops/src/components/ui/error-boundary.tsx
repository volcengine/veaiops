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

import React from 'react';

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // Error boundary catches child component errors to prevent the entire app from crashing
    // Error information is handled in render through state.hasError
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-bg-base)' }}
        >
          <div className="text-center">
            <h1
              className="text-2xl font-bold mb-4"
              style={{ color: 'var(--color-text-base)' }}
            >
              Application Load Error
            </h1>
            <p
              className="mb-4"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Sorry, the application encountered an error. Please try refreshing
              the page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#096dd9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
