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
 * Card template Hooks unified export
 *
 * Directory structure:
 * - table/         - Table configuration Hook (simplified: use-card-template-table-config → table/)
 * - crud/          - CRUD operations Hook (simplified: use-card-template-crud → crud/)
 * - management/    - Management logic Hook (simplified: use-management-logic → management/)
 * - card-template/ - Card template utilities (already exists, preserved)
 * - use-card-template/ - Card template Hook (already exists, preserved)
 */

// ==================== Table Configuration ====================
// ✅ Simplified: use-card-template-table-config.tsx → table/
export * from './table';

// ==================== CRUD Operations ====================
// ✅ Simplified: use-card-template-crud.ts → crud/
export * from './crud';

// ==================== Management Logic ====================
// ✅ Simplified: use-management-logic.ts → management/
export * from './management';

// ==================== Card Template Utilities ====================
// ✅ Already exists: card-template/ directory
// Note: Contents of card-template directory have been split to other directories:
// - useCardTemplateManagementLogic → ./management
// - transformAgentTemplateToTableData → ./use-card-template/utils/transform
// If you need to access types and utilities from card-template/lib, please directly import that directory
// export * from './card-template'; // Removed to avoid duplicate exports

// ==================== Use Card Template Hook ====================
// ✅ Already exists: use-card-template/ directory
// Note: useCardTemplateManagementLogic is already exported from ./management, not exported here (avoid duplicates)
// UseCardTemplateManagementLogicParams type is already exported from ./management, unified export from management here
export type { UseCardTemplateManagementLogicParams } from './management';
