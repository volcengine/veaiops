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
 * Plugin core module exports
 *
 * @date 2025-12-19
 */

// Export core classes
export { PluginEventSystem } from './plugin-events';
export { PluginExecutor } from './plugin-executor';
export { PluginLifecycleManager } from './plugin-lifecycle';
export { PluginPerformanceMonitor } from './plugin-performance';
export { PluginRegistry } from './plugin-registry';

// Export utility functions
export * from './plugin-utils';

// Export types
export type { EventListener, UnsubscribeFunction } from './plugin-events';
export type { PluginInstance } from './plugin-registry';
