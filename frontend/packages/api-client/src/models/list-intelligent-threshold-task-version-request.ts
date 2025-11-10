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
import type { PaginationRequest } from './pagination-request';
import type { SortColumn } from './sort-column';
import type { TimeRange } from './time-range';
export type ListIntelligentThresholdTaskVersionRequest = {
  /**
   * Task ID
   */
  task_id: string;
  /**
   * List of task statuses
   */
  statuses?: Array<'launching' | 'running' | 'completed' | 'failed' | 'cancelled'>;
  create_time_range?: TimeRange;
  update_time_range?: TimeRange;
  page_req: PaginationRequest;
  /**
   * Sort columns
   */
  sort_columns?: Array<SortColumn>;
};
