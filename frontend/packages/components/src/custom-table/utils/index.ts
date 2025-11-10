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
 * CustomTable utility functions unified export
 */

// Data processing utilities
export {
  filterEmptyDataByKeys,
  formatTableData,
  filterTableData,
} from './data';

// Lifecycle manager
export {
  LifecycleManager,
  createLifecycleManager,
  mergeLifecycleConfigs,
} from './lifecycle-manager';

// Plugin lifecycle enhancer
export {
  enhancePluginLifecycle,
  enhancePluginsLifecycle,
  addLifecycleTriggerToContext,
  hasLifecycleSupport,
  getPluginLifecyclePhases,
} from './plugin-lifecycle-enhancer';

// Formatting utilities

// Query parameter utilities
export { getParamsObject } from './query';

// Legacy utility functions
export * from './legacy-utils';

// Data source utility functions (exported from data-source-helpers)
export {
  buildRequestResult,
  extractResponseData,
  handleRequestError,
} from './data-source-helpers';

// Log utilities - achieve shortest path through layered exports (@/custom-table/utils)
export { devLog } from './log-utils';
export { resetLogCollector } from './reset-log-collector';

// Utility types - moved to types directory for unified management
// ResponseErrorType may not exist in @veaiops/types, temporarily commented
// export type { ResponseErrorType } from '@veaiops/types';
