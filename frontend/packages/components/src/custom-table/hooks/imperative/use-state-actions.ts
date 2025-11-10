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
 * CustomTable state operations Hook
 * Responsible for handling loading state, error state and other management operations
 *
 * @date 2025-12-19
 */
import type {
  BaseQuery,
  BaseRecord,
  PluginContext,
} from '@/custom-table/types';

/**
 * @name State operation related instance methods
 */
export interface StateActionMethods {
  /** @name Set loading state */
  setLoading: (newLoading: boolean) => void;
  /** @name Set error state */
  setError: (error: Error | null) => void;
  /** @name Get complete state */
  getState: () => Record<string, unknown>;
  /** @name Get loading state */
  getLoading: () => boolean;
  /** @name Get error state */
  getError: () => Error | null;
}

/**
 * @name Create state operation methods
 * @description Based on pro-components state management design pattern
 */
export const createStateActions = <
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(
  context: PluginContext<RecordType, QueryType>,
): StateActionMethods => ({
  /** @name Set loading state */
  setLoading: (newLoading: boolean) => {
    // Set loading state through context helpers
    context.helpers.setLoading(newLoading);
  },

  /** @name Set error state */
  setError: (error: Error | null) => {
    // Set error state through context helpers
    context.helpers.setError(error);
  },

  /** @name Get complete state */
  getState: () => context.state as unknown as Record<string, unknown>,

  /** @name Get loading state */
  getLoading: () => context.state.loading,

  /** @name Get error state */
  getError: () => context.state.error || null,
});
