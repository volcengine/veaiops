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
 * Table Columns Plugin Hooks
 *
 * Note: The original useColumns hook has been migrated to the base version
 * Location: @/custom-table/hooks/use-column-config.ts
 * Reason: Unified column configuration management, avoid functional duplication
 *
 * If column width persistence is needed, it can be added to the base version, or use column-width-persistence plugin
 */
export { useColumns as useColumnConfig } from '@/custom-table/hooks/use-column-config';
