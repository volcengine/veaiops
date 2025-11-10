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
 * Time utility module unified export
 *
 * Split into multiple sub-modules for better maintainability:
 * - constants: Constants and type definitions
 * - utils: Basic utility functions
 * - format: Time formatting functions
 * - convert: Time conversion functions
 * - calculate: Time calculation functions
 * - range: Time range functions
 */

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// Initialize Day.js plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

// Export constants and types
export * from './constants';

// Export utility functions
// Do not export utils, because canConvertToNumber duplicates with common.ts
// export * from './utils';

// Export formatting functions (only once)
export * from './format';

// Export conversion functions (only once)
export * from './convert';

// Export calculation functions
export * from './calculate';

// Export range functions
export * from './range';

// Export timezone management functions
export * from './timezone';

// Export time range conversion functions
export * from './range-convert';

// Export timezone-aware components
export * from './with-timezone';
