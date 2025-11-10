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
 * GlobalGuide lib unified export
 *
 * Architecture notes (conforms to .cursorrules Feature-Based architecture):
 * - config.ts - Guide configuration
 * - store.ts - State management
 * - tracker.ts - Tracker
 * - types.ts - Type definitions
 * - debug-collector.ts - Debug log collector
 * - utils/ - Utility functions
 */

// Export configuration
export * from './config';

// Export state management
export * from './store';

// Export tracker
export * from './tracker';

// Export types
export * from './types';

// Export debug log collector
export * from './debug-collector';

// Export auto log initialization
export { initializeAutoLogCollection } from './auto-log-init';

// Export utility functions
export * from './utils';
