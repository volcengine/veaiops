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
 * RetryHandler component type definitions
 * Migrated from components/retry-handler/types.ts
 */

import type { PluginContext } from '@veaiops/types';

/**
 * @name Retry handler component properties
 */
export interface RetryHandlerProps {
  /** @name Plugin context */
  context: PluginContext;
  /** @name Retry tip message */
  message?: string;
  /** @name Retry button text */
  buttonText?: string;
}

/**
 * Retry state
 */
export interface RetryState {
  attempt: number;
  isRetrying: boolean;
  lastError?: Error;
  nextRetryAt?: Date;
}

/**
 * Retry options
 */
export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay?: number;
  backoffFactor?: number;
}
