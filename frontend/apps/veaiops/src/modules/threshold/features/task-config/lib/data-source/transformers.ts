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

import type { IntelligentThresholdTask } from "api-generate";
import type { TaskQueryParams } from "./types";

/**
 * Parameter type for getApisV1IntelligentThresholdTask API method
 */
interface GetIntelligentThresholdTaskParams {
  projects?: Array<string>;
  taskName?: string;
  datasourceType?: "Zabbix" | "Aliyun" | "Volcengine";
  autoUpdate?: boolean;
  createdAtStart?: string;
  createdAtEnd?: string;
  updatedAtStart?: string;
  updatedAtEnd?: string;
  skip?: number;
  limit?: number;
}

/**
 * Transform query parameters to API request format
 */
export const transformQueryToApiRequest = (
  query: TaskQueryParams
): GetIntelligentThresholdTaskParams => {
  const request: GetIntelligentThresholdTaskParams = {
    datasourceType: query.datasource_type,
    skip: query.page_req.skip,
    limit: query.page_req.limit,
    // sort property not in API type definition, temporarily removed
    // sort: query.sort,
  };

  // Add filter conditions
  if (query.projects && query.projects.length > 0) {
    request.projects = query.projects;
  }

  if (query.auto_update !== undefined) {
    request.autoUpdate = query.auto_update;
  }

  if (query.task_name) {
    request.taskName = query.task_name;
  }

  if (query.created_at_start) {
    request.createdAtStart = query.created_at_start;
  }

  if (query.created_at_end) {
    request.createdAtEnd = query.created_at_end;
  }

  if (query.updated_at_start) {
    request.updatedAtStart = query.updated_at_start;
  }

  if (query.updated_at_end) {
    request.updatedAtEnd = query.updated_at_end;
  }
  return request;
};

/**
 * Transform API response data to table data - only handles IntelligentThresholdTask
 */
export const transformApiResponseToTableData = (
  apiData: IntelligentThresholdTask
): IntelligentThresholdTask & { key: string } => {
  return {
    ...apiData,
    key: apiData._id || "",
  };
};
