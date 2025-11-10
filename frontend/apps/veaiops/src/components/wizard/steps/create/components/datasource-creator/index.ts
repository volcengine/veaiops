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
 * Data source creator unified export
 */

// Type definitions
export type { CreateResult } from './types';

// Validators
export { validateConfiguration } from './validators';

// Create functions
export {
  createAliyunDataSource,
  createDataSource,
  createVolcengineDataSource,
  createZabbixDataSource,
} from './creators';

// Update functions
export {
  updateAliyunDataSource,
  updateDataSource,
  updateVolcengineDataSource,
  updateZabbixDataSource,
} from './updaters';

// Utility functions
export { processApiError } from './utils';
