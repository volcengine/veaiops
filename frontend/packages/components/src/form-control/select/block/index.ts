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

// Main component export - use refactored version
// StateSync utility export (from logger instance)
// Note: Use logger instance instead of SelectBlockLogger class
import { SelectBlockLogger } from './logger';

export { SelectBlock } from './select-block';

// Plugin system exports - import from dedicated export file
export * from './exports';

// Utility function exports
export {
  getFrontEnumsOptions,
  getFrontEnumsByKey,
  splitPastedText,
  optionfy,
  ensureArray,
  removeUndefinedValues,
  isDataSourceSetter,
  defaultFilterOption,
  filterArrayByObjectCriteria,
  canConvertToNumber,
} from './util';

// Token separator utility export
export { TokenSeparatorUtils } from './plugins/paste-handler';

// Cache storage export
export { sessionStore } from './cache-store';

// Logging system export
export { logger, SelectBlockLogger, LogLevel } from './logger';
export type { LogEntry, LoggerConfig } from './logger';

export const StateSync = {
  forceLoadingSync: SelectBlockLogger.forceLoadingSync,
  verifyAndFixInconsistencies: SelectBlockLogger.verifyAndFixInconsistencies,
  checkStateConsistency: SelectBlockLogger.checkStateConsistency,
};

// Type exports - component related
export type {
  VeArchSelectBlockProps,
  OptionfyProps,
  SelectDataSourceProps,
  Option,
  FinalSelectBlockProps,
  OptionsEntity,
  StandardEnum,
  SelectOption,
  EnumOptionConfigs,
  DataSourceSetter,
  SearchKeyConfig,
} from './types/interface';
