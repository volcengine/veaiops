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
 * Bot UI components unified export
 * Organized according to Feature-Based architecture
 *
 * Architecture description:
 * - management.tsx: Bot management main page
 * - table.tsx: Bot table component
 * - attributes-table.tsx: Bot attributes table component
 * - components/: Sub-components directory
 *   - bot/: Bot related sub-components
 *   - chat/: Chat management related sub-components
 *   - attributes/: Attributes related sub-components
 */

// Main page components
export { BotManagement, default } from './management';
export { BotTable, default as BotTableDefault } from './table';
export { BotAttributesTable } from './attributes-table';

// Sub-components (unified export through components/index.ts)
export * from './components';
