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

/**
 * StreamRetryButton component type definitions
 * Migrated from components/stream-retry-button/types.ts
 */

/**
 * @name Stream loading retry button properties
 */
export interface StreamRetryButtonProps {
  /** @name Whether it is retrying */
  isRetrying?: boolean;
  /** @name Whether there is an error */
  hasError?: boolean;
  /** @name Error type */
  errorType?: 'rate_limit' | 'concurrency_limit' | 'timeout' | 'unknown';
  /** @name Whether to continue loading */
  needContinue?: boolean;
  /** @name Retry callback */
  onRetry?: () => void;
  /** @name Auto retry delay time */
  autoRetryDelay?: number;
  /** @name Container style class name */
  className?: string;
  /** @name Whether there is more data */
  hasMoreData?: boolean;
  /** @name Load more data callback */
  onLoadMore?: () => void;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  autoRetry?: boolean;
}
