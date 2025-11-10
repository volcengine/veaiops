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
import React, { memo, useMemo } from 'react';

/**
 * Route loading state component
 * Uses memo to optimize performance and avoid unnecessary re-renders
 */
export const RouteLoadingFallback: React.FC = memo(() => {
  const containerStyle = useMemo(
    () => ({
      display: 'flex' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      height: '200px',
      minHeight: '50vh',
      backgroundColor: 'var(--color-bg-1, #ffffff)',
      borderRadius: '6px',
      transition: 'opacity 0.3s ease-in-out',
    }),
    [],
  );

  return React.createElement(
    'div',
    { style: containerStyle },
    React.createElement(Spin, {
      size: 40,
      tip: '页面加载中...',
    }),
  );
});

RouteLoadingFallback.displayName = 'RouteLoadingFallback';

/**
 * Route error boundary component
 * Provides better error handling and user experience
 */
export class RouteErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  },
  { hasError: boolean; error?: Error; errorId: string }
> {
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  public state: { hasError: boolean; error?: Error; errorId: string } = {
    hasError: false,
    error: undefined,
    errorId: '',
  };

  private retryCount = 0;
  private readonly maxRetries: number = 3;

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Send error report to monitoring system
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Can integrate error monitoring service here, such as Sentry
    if (typeof window !== 'undefined' && (window as any).reportError) {
      (window as any).reportError({
        type: 'RouteError',
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        timestamp: Date.now(),
      });
    }
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({ hasError: false, error: undefined, errorId: '' });
    } else {
      window.location.reload();
    }
  };

  private renderErrorUI(): React.ReactElement {
    const { error } = this.state;
    const containerStyle: React.CSSProperties = {
      padding: '40px',
      textAlign: 'center',
      color: 'var(--color-text-2, #666)',
      backgroundColor: 'var(--color-bg-1, #ffffff)',
      borderRadius: '8px',
      border: '1px solid var(--color-border-2, #e5e6eb)',
      maxWidth: '500px',
      margin: '0 auto',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    };

    const buttonStyle: React.CSSProperties = {
      padding: '8px 16px',
      backgroundColor: 'var(--color-primary-6, #1890ff)',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
      transition: 'background-color 0.3s ease',
      marginRight: '8px',
    };

    const secondaryButtonStyle: React.CSSProperties = {
      ...buttonStyle,
      backgroundColor: 'transparent',
      color: 'var(--color-text-2, #666)',
      border: '1px solid var(--color-border-2, #e5e6eb)',
    };

    return React.createElement(
      'div',
      { style: containerStyle },
      React.createElement(
        'div',
        {
          style: { fontSize: '48px', marginBottom: '16px' },
        },
        '😵',
      ),
      React.createElement(
        'h3',
        {
          style: { margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 },
        },
        '页面加载失败',
      ),
      React.createElement(
        'p',
        {
          style: { margin: '0 0 24px 0', fontSize: '14px', lineHeight: '1.5' },
        },
        error?.message || '页面组件加载时发生了错误，请稍后重试',
      ),
      React.createElement(
        'div',
        null,
        React.createElement(
          'button',
          {
            onClick: this.handleRetry,
            style: buttonStyle,
            onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor =
                'var(--color-primary-7, #0e7ce8)';
            },
            onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor =
                'var(--color-primary-6, #1890ff)';
            },
          },
          this.retryCount < this.maxRetries ? '重试' : '刷新页面',
        ),
        React.createElement(
          'button',
          {
            onClick: () => window.history.back(),
            style: secondaryButtonStyle,
          },
          '返回上页',
        ),
      ),
      process.env.NODE_ENV === 'development' &&
        React.createElement(
          'details',
          {
            style: { marginTop: '24px', textAlign: 'left', fontSize: '12px' },
          },
          React.createElement(
            'summary',
            { style: { cursor: 'pointer' } },
            '错误详情',
          ),
          React.createElement(
            'pre',
            {
              style: {
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '200px',
              },
            },
            error?.stack,
          ),
        ),
    );
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // If custom error component is provided, use it
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return React.createElement(FallbackComponent, {
          error: this.state.error!,
          retry: this.handleRetry,
        });
      }

      return this.renderErrorUI();
    }

    return this.props.children;
  }
}
