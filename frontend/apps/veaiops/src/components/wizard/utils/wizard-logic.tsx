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
 * Data source wizard business logic utility functions - backward compatible export
 * @description This file has been split and reorganized into a modular structure, this file is only for backward compatibility
 *
 * New file structure:
 * - steps/          Step-related (validation, data fetching, utility functions)
 * - data/           Data processing (prefill, converters)
 * - validation/     Validation-related
 * - error-handling/ Error handling
 * - helpers/        General helper functions
 *
 * @deprecated Please import required functions directly from '../utils' or sub-modules
 * @example
 * // Recommended usage
 * import { canProceed, handleStepDataFetch } from '../utils/steps';
 * import { prefillDataSourceConfig } from '../utils/data';
 *
 * @author AI Assistant
 * @date 2025-01-19
 */

// Re-export all functions to maintain backward compatibility
export {
  // Step validators
  canProceed,
  // Step data fetchers
  handleStepDataFetch,
  // Step utility functions
  getButtonText,
  getCurrentStepConfig,
  getDataSourceTypeDisplayName,
  getStepProgressText,
  isLastStep,
} from './index';
