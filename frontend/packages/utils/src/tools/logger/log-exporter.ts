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
 * Log export utility - backward compatible export
 *
 * Note: The ./log-exporter/ directory referenced by this file may not exist
 * Currently all log-related functionality is exported through ./index.ts
 *
 * @deprecated It is recommended to import from '../index' (i.e., unified export from logger directory)
 */

// Re-export core functionality for backward compatibility
export { logger } from './core';
export type { LogEntry, LoggerConfig } from './core';
export {
  exportLogsToFile,
  getLogCount,
  clearCollectedLogs,
  startLogCollection,
  stopLogCollection,
  exportLogsInTimeRange,
} from './export';
