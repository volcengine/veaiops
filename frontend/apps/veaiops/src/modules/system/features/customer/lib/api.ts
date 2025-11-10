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

import { VolcAIOpsApi } from "api-generate";
import type { CustomerTableData, CustomerFormData } from "@customer/types";
import { transformCustomerToTableData } from "./utils";

/**
 * Customer management API service - uses real API
 */

// Create API client instance
const apiClient = new VolcAIOpsApi();
const customersService = apiClient.customers;

/**
 * Get customer list
 */
export const getCustomerList = async (params: {
  current?: number;
  pageSize?: number;
  name?: string;
  status?: string;
  type?: string;
  level?: string;
}): Promise<{
  data: CustomerTableData[];
  total: number;
  success: boolean;
}> => {
  const skip = params.current
    ? (params.current - 1) * (params.pageSize || 10)
    : 0;
  const limit = params.pageSize || 10;

  const response = await customersService.getApisV1ManagerSystemConfigCustomers(
    {
      skip,
      limit,
      name: params.name,
    }
  );

  // Transform data format
  const transformedData =
    response.data?.map(transformCustomerToTableData) || [];

  return {
    data: transformedData,
    total: transformedData.length, // API response doesn't have total field, use data length
    success: true,
  };
};

/**
 * Create customer
 */
export const createCustomer = async (
  data: CustomerFormData
): Promise<{
  data: CustomerTableData;
  success: boolean;
  message: string;
}> => {
  // Validate required fields
  if (!data.name.trim()) {
    throw new Error("客户名称不能为空");
  }

  // Note: Customer type from api-generate doesn't have email field, removed email validation

  // Call API to create customer
  const response =
    await customersService.postApisV1ManagerSystemConfigCustomers({
      requestBody: {
        name: data.name,
      },
    });

  // Transform response data
  const transformedData = transformCustomerToTableData(response.data || {});

  return {
    data: transformedData,
    success: true,
    message: response.message || "客户创建成功",
  };
};

/**
 * Update customer
 * Note: Backend API doesn't have update interface yet, provides placeholder implementation
 */
export const updateCustomer = async (
  id: string,
  data: CustomerFormData
): Promise<{
  data: CustomerTableData;
  success: boolean;
  message: string;
}> => {
  // TODO: Wait for backend to provide update interface

  // Temporarily return mock data
  // Note: Use Customer type fields from api-generate
  const updatedCustomer: CustomerTableData = {
    _id: id,
    customer_id: data.customer_id,
    name: data.name,
    desensitized_name: data.desensitized_name,
    is_active: data.is_active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as CustomerTableData;

  return {
    data: updatedCustomer,
    success: true,
    message: "客户更新成功（模拟）",
  };
};

/**
 * Delete customer
 */
export const deleteCustomer = async (
  id: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  const response =
    await customersService.deleteApisV1ManagerSystemConfigCustomers({
      customerId: id,
    });

  return {
    success: response.data || false,
    message: response.message || "客户删除成功",
  };
};

/**
 * Batch import customers
 */
export const importCustomers = async (
  file: File
): Promise<{
  success: boolean;
  message: string;
  successCount: number;
  failCount: number;
}> => {
  const response =
    await customersService.postApisV1ManagerSystemConfigCustomersImport({
      formData: {
        file,
      },
    });

  // Parse response message to get success and failure counts
  const message = response.message || "";
  const successMatch = message.match(/(\d+)\s*customers/);
  const successCount = successMatch ? parseInt(successMatch[1], 10) : 0;

  // ImportResult type data structure (according to definition in api-generate)
  const importResult = response.data;
  return {
    success: (importResult?.successful_imports ?? 0) > 0,
    message: response.message || "导入完成",
    successCount: importResult?.successful_imports ?? successCount,
    failCount: importResult?.failed_imports ?? 0,
  };
};

/**
 * Get customer detail
 * Note: Backend API doesn't have detail interface yet, provides placeholder implementation
 */
export const getCustomerDetail = async (
  id: string
): Promise<{
  data: CustomerTableData;
  success: boolean;
}> => {
  // TODO: Wait for backend to provide detail interface

  // Temporarily get data from list interface
  // Note: Use Customer type field _id from api-generate
  const listResponse = await getCustomerList({ pageSize: 1000 });
  const customer = listResponse.data.find((c) => c._id === id);

  if (!customer) {
    throw new Error("客户不存在");
  }

  return {
    data: customer,
    success: true,
  };
};

/**
 * Create table request wrapper
 * Used for CustomTable's dataSource configuration
 */
export const createCustomerTableRequestWrapper = () => {
  return {
    serviceInstance: getCustomerList,
    payload: {},
  };
};
