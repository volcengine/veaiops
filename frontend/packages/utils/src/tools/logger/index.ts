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
 * Logger utilities unified exports
 *
 * ✅ Unified export of all logging-related functionality:
 * - core: Unified logger instance (main log collection)
 * - export: Log export utilities (unified export of all logs)
 * - log-exporter: Log export utilities (backward compatible)
 * - enhanced-collector: Enhanced log collector for global type definitions
 */

// Export core logger
export * from './core';

// Export log export utilities
export * from './export';

// Export log-exporter (backward compatible)
export * from './log-exporter';

// Export enhanced collector for global type definitions
export {
  enhancedCollector,
  EnhancedLoggerCollector,
} from './enhanced-collector/enhanced-collector';
