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

// Auto initialize log collection (side effect import)
import './lib/auto-log-init';

/**
 * GlobalGuide module unified export
 *
 * Architecture notes (conforms to .cursorrules Feature-Based architecture):
 * - lib/ - Configuration, state, utilities (unified export from lib/index.ts)
 * - ui/ - UI components (unified export from ui/index.ts)
 * - hooks/ - Business logic Hooks (unified export from hooks/index.ts)
 * - enums/ - Enum definitions
 *
 * Layered export principle:
 * - Unified export from each module's index.ts
 * - Root index.ts unified re-export of all modules
 */

// Export lib (configuration, state, utilities) - unified export from lib (layered export)
export * from './lib';

// Export UI components (unified export from ui, includes main components and sub-components)
export * from './ui';

// Export hooks (unified export from hooks)
export * from './hooks';

// Export enums (unified export from enums)
export * from './enums';
