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

import type {
  MetricTemplateCreateRequest,
  MetricTemplateUpdateRequest,
  ToggleActiveRequest,
} from "api-generate";
import apiClient from "@/utils/api-client";

/**
 * Metric template related API wrapper
 */
interface UpdateParams {
  uid: string;
  data: MetricTemplateUpdateRequest;
}

interface ToggleParams {
  uid: string;
  data: ToggleActiveRequest;
}

export const metricTemplateApi = {
  /**
   * Get metric template list
   * @param params Query parameters
   */
  list: (params?: { skip?: number; limit?: number }) => {
    return apiClient.metricTemplate.getApisV1DatasourceTemplate(params || {});
  },

  /**
   * Create metric template
   * @param data Create parameters
   */
  create: (data: MetricTemplateCreateRequest) => {
    return apiClient.metricTemplate.postApisV1DatasourceTemplate({
      requestBody: data,
    });
  },

  /**
   * Get single metric template
   * @param uid Template unique identifier
   */
  get: (uid: string) => {
    return apiClient.metricTemplate.getApisV1DatasourceTemplate1({
      uid,
    });
  },

  /**
   * Update metric template
   */
  update: ({ uid, data }: UpdateParams) => {
    return apiClient.metricTemplate.putApisV1DatasourceTemplate({
      uid,
      requestBody: data,
    });
  },

  /**
   * Delete metric template
   * @param uid Template unique identifier
   */
  delete: (uid: string) => {
    return apiClient.metricTemplate.deleteApisV1DatasourceTemplate({
      uid,
    });
  },

  /**
   * Toggle metric template active status
   */
  toggle: ({ uid, data }: ToggleParams) => {
    return apiClient.metricTemplate.putApisV1DatasourceTemplateToggle({
      uid,
      requestBody: data,
    });
  },
};

export default metricTemplateApi;
