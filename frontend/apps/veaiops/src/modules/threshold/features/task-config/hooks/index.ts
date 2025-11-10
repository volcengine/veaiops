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
 * Intelligent threshold task configuration module - Hooks unified exports
 */

// 🎯 Table configuration Hook (recommended - follows CUSTOM_TABLE_REFACTOR_TASKS.md specification)
export {
  useTaskTableConfig,
  type UseTaskTableConfigReturn,
} from './use-table-config';

// 🎯 Auto-refresh CRUD operations Hook (general solution)
export {
  useAutoRefreshOperations,
  createOperationWrapper,
  type AutoRefreshOperations,
  type UseAutoRefreshOperationsParams,
  type CreateOperationWrapperParams,
} from './auto-refresh';

// Other business Hooks
export { useTaskFormHandlers } from './use-form-handlers';
export { useTaskOperations } from './use-operations';
export { useTaskVersionTableConfig } from './use-version-table';
export { useTimeseriesData } from './use-timeseries-data';
export { useUrlParams } from './use-url-params';
export { useTaskManagementLogic } from './use-management';
export { useDatasourceDetail } from './use-datasource-detail';
