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

import { queryArrayFormat, queryBooleanFormat } from '@veaiops/utils';

/**
 * Query parameter format configuration
 *
 * 🔧 Optimization notes:
 * - Only need to define **non-string type** fields (arrays, booleans, etc.)
 * - String type fields (such as datasource_type, task_name, etc.) are automatically handled by CustomTable
 * - This avoids URL synchronization issues caused by missing fields
 */
export const TASK_TABLE_QUERY_FORMAT = {
  // Project name list - array format
  projects: queryArrayFormat,
  // Product name list - array format
  products: queryArrayFormat,
  // Customer name list - array format
  customers: queryArrayFormat,
  // Task ID list - array format
  task_ids: queryArrayFormat,
  // Task status list - array format
  statuses: queryArrayFormat,
  // Auto update - boolean format
  auto_update: queryBooleanFormat,
};
