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
 * Query transformer
 * Used to convert frontend query parameters to API parameters
 */

/**
 * Transform table query parameters to API parameters
 * @param params Table query parameters
 * @returns API query parameters
 */
export const transformTableQueryToApi = (params: any): any => {
  const {
    current = 1,
    pageSize = 10,
    sorter,
    filters = {},
    ...otherParams
  } = params;

  const apiParams: any = {
    page: current,
    page_size: pageSize,
    ...otherParams,
  };

  // Handle sorting
  if (sorter) {
    const { field, order } = sorter;
    if (field && order) {
      apiParams.order_by = order === "ascend" ? field : `-${field}`;
    }
  }

  // Handle filters
  Object.keys(filters).forEach((key) => {
    const value = filters[key];
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        apiParams[key] = value.join(",");
      } else {
        apiParams[key] = value;
      }
    }
  });

  return apiParams;
};

/**
 * Transform API response to table data format
 * @param response API response
 * @returns Table data format
 */
export const transformApiResponseToTable = (response: any) => {
  const { data, total, page, page_size } = response;

  return {
    data: data || [],
    total: total || 0,
    current: page || 1,
    pageSize: page_size || 10,
  };
};

/**
 * Transform form data to API data
 * @param formData Form data
 * @returns API data
 */
export const transformFormDataToApi = (formData: any) => {
  const apiData = { ...formData };

  // Handle special field conversion
  if (apiData.datasource_type) {
    apiData.datasource_type = apiData.datasource_type.toUpperCase();
  }

  if (apiData.direction) {
    apiData.direction = apiData.direction.toUpperCase();
  }

  // Handle array fields
  if (apiData.projects && Array.isArray(apiData.projects)) {
    apiData.projects = apiData.projects.join(",");
  }

  if (apiData.products && Array.isArray(apiData.products)) {
    apiData.products = apiData.products.join(",");
  }

  if (apiData.customers && Array.isArray(apiData.customers)) {
    apiData.customers = apiData.customers.join(",");
  }

  return apiData;
};

/**
 * Transform API data to form data
 * @param apiData API data
 * @returns Form data
 */
export const transformApiDataToForm = (apiData: any) => {
  const formData = { ...apiData };

  // Handle string fields converted to arrays
  if (formData.projects && typeof formData.projects === "string") {
    formData.projects = formData.projects.split(",").filter(Boolean);
  }

  if (formData.products && typeof formData.products === "string") {
    formData.products = formData.products.split(",").filter(Boolean);
  }

  if (formData.customers && typeof formData.customers === "string") {
    formData.customers = formData.customers.split(",").filter(Boolean);
  }

  return formData;
};

/**
 * Build query URL parameters
 * @param params Query parameters
 * @returns URL parameter string
 */
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(","));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString();
};

/**
 * Parse URL query parameters
 * @param search URL query string
 * @returns Parsed parameter object
 */
export const parseQueryParams = (search: string): Record<string, any> => {
  const params: Record<string, any> = {};
  const searchParams = new URLSearchParams(search);

  searchParams.forEach((value, key) => {
    // Try to parse as number
    if (!isNaN(Number(value))) {
      params[key] = Number(value);
    }
    // Try to parse as boolean
    else if (value === "true" || value === "false") {
      params[key] = value === "true";
    }
    // Try to parse as array (comma-separated)
    else if (value.includes(",")) {
      params[key] = value.split(",").filter(Boolean);
    }
    // Default to string
    else {
      params[key] = value;
    }
  });

  return params;
};
