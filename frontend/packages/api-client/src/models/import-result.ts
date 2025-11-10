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

/* generated using openapi-typescript-codegen -- do not edit */
import type { ImportLog } from './import-log';
export type ImportResult = {
  /**
   * Total number of rows
   */
  total_rows: number;
  /**
   * Number of successful imports
   */
  successful_imports: number;
  /**
   * Number of failed imports
   */
  failed_imports: number;
  /**
   * Number of skipped rows
   */
  skipped_rows: number;
  /**
   * List of error messages
   */
  errors: Array<string>;
  /**
   * List of import logs
   */
  logs: Array<ImportLog>;
  /**
   * Start time
   */
  start_time: string;
  /**
   * End time
   */
  end_time?: string | null;
};
