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
 * SelectBlock Hooks module exports
 *
 * Main exports:
 * - useSelectBlock: Main Hook, integrates all functionality
 *
 * Sub-hook exports (can be used independently or for testing):
 * - useBaseConfig: Base configuration processing
 * - useDebugLogging: Debug logging system
 * - usePluginManager: Plugin manager
 * - useStateSubscription: State subscription
 * - useOptionsProcessing: Options processing
 * - useEventHandlers: Event handlers
 * - useFetchEffects: Data fetching side effects
 * - useDebugEffects: Debug side effects
 * - useDefaultValueEffects: Default value side effects
 * - useReturnValue: Return value construction
 */

// Main Hook export
export { useSelectBlock } from './use-select-block';

// Sub-hook exports (for advanced usage and testing)
export { useBaseConfig } from './use-base-config';
export { useDebugLogging } from './use-debug-logging';
export { usePluginManager } from './use-plugin-manager';
export { useStateSubscription } from './use-state-subscription';
export { useOptionsProcessing } from './use-options-processing';
export { useEventHandlers } from './use-event-handlers';
export { useFetchEffects } from './use-fetch-effects';
export { useDebugEffects } from './use-debug-effects';
export { useDefaultValueEffects } from './use-default-value-effects';
export { useReturnValue } from './use-return-value';

// Type exports
export type { veArchSelectBlockProps, SelectOption } from '../types/interface';

export type { SelectBlockState } from '../types/plugin';
