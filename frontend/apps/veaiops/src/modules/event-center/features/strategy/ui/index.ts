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
 * Strategy management UI components unified export
 *
 * Directory structure:
 * - modal/    - Strategy modal components (split, 262 lines → multiple files)
 * - table/    - Strategy table components (reorganized, file names simplified)
 * - form.tsx  - Strategy form component (168 lines)
 * - detail-drawer.tsx - Detail drawer component (107 lines)
 * - main.tsx  - Main page component (83 lines)
 */

// ✅ Reorganized: modal directory (split components)
export {
  default as StrategyModal,
  CardTemplateConfigMessage,
  type StrategyModalProps,
} from './modal';

// ✅ Reorganized: table directory (file names simplified)
export { StrategyTable, type StrategyTableRef } from './table';

// ✅ Simplified file name: strategy-detail-drawer.tsx → detail-drawer.tsx
export { StrategyDetailDrawer } from './detail-drawer';

// ✅ Main component (avoid circular dependency with index.ts)
export { default as StrategyManagement } from './main';
