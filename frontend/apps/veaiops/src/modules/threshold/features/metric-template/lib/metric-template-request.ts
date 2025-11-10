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

import { createTableRequestWrapper } from "@veaiops/utils";
import { metricTemplateApi } from "./api-service";

/**
 * Fetch metric template list
 * @param params - Object containing pagination and filter parameters
 */
const fetchMetricTemplateList = async (params: Record<string, any>) => {
  // Extract query conditions from parameters
  const { name, metricType, skip, limit } = params;

  // Fetch all data (backend doesn't support filtering, need to filter on frontend)
  // Use a large limit to fetch all data
  const response = await metricTemplateApi.list({ skip: 0, limit: 10000 });
  let filteredData = response.data || [];

  // Filter on frontend
  if (name) {
    filteredData = filteredData.filter((item: any) =>
      item.name?.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (metricType !== undefined && metricType !== null) {
    filteredData = filteredData.filter(
      (item: any) => item.metric_type === metricType
    );
  }

  // Paginate on frontend
  const startIndex = skip || 0;
  const endIndex = startIndex + (limit || 10);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    total: filteredData.length,
    success: true,
  };
};

/**
 * Create metric template table request wrapper
 */
export const createMetricTemplateTableRequestWrapper = () =>
  createTableRequestWrapper({ apiCall: fetchMetricTemplateList, defaultLimit: 10 });
