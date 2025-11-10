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
 * Account management utility functions - Unified export
 * @description Account management related utility functions and helper methods
 *
 * This file has been split into multiple sub-modules for better maintainability:
 * - formatters.ts: Formatting functions
 * - validators.ts: Validation functions
 * - validation-helpers.ts: Validation helper functions
 * - permissions.ts: Permission check functions
 * - helpers.ts: Helper functions
 *
 * For backward compatibility, all functions are re-exported from this file
 */

// Export formatting functions
export * from './formatters';

// Export validation functions
export * from './validators';

// Export validation helper functions
export * from './validation-helpers';

// Export permission functions
export * from './permissions';

// Export helper functions
export * from './helpers';
