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
 * CustomTable utility types unified export
 */

// ==================== Error Related Types ====================
export * from './error';

// ==================== Type Safety Utilities ====================
export * from './type-safe-utils';

// ==================== State Managers ====================
// Explicitly export key functions to ensure build tools can correctly identify them (avoid star export parsing issues)
export {
  createPaginationStateManager,
  createSorterStateManager,
  createSafeStateCleaner,
} from './state-managers';
// Export type definitions
export type {
  PaginationStateManager,
  SorterStateManager,
  SafeStateCleaner,
} from './state-managers';
