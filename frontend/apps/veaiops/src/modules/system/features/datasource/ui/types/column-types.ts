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
 * Table column related type definitions
 */

import type { DataSource } from 'api-generate';

/**
 * Delete handler function type
 *
 * ✅ Complies with async method error handling specification:
 * - Supports returning result object in { success: boolean; error?: Error } format
 * - Also supports void/Promise<void> format (backward compatible)
 */
export type DeleteHandler = (
  id: string,
) => void | Promise<void> | Promise<{ success: boolean; error?: Error }>;

/**
 * View handler function type
 */
export type ViewHandler = (item: DataSource) => void;

/**
 * Edit handler function type
 */
export type EditHandler = (item: DataSource) => void;

/**
 * Configuration item type
 */
export interface ConfigItem {
  configKey: string;
  value: unknown;
}
