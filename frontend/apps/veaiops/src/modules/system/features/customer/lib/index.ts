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
 * Customer management related constants, configurations, and utility functions
 */

import { createTableRequestWrapper } from "@veaiops/utils";
import { API_RESPONSE_CODE } from "@veaiops/constants";
import apiClient from "@/utils/api-client";

// Re-export all constants
export * from './constants';

/**
 * Create customer
 */
export const createCustomer = async (_customerData: any): Promise<boolean> => {
  return true;
};

/**
 * Update customer parameters interface
 */
export interface UpdateCustomerParams {
  customerId: string;
  customerData: any;
}

/**
 * Update customer
 */
export const updateCustomer = async ({
  customerId: _customerId,
  customerData: _customerData,
}: UpdateCustomerParams): Promise<boolean> => {
  return true;
};

/**
 * Delete customer
 */
export const deleteCustomer = async (
  customerId: string,
): Promise<{ success: boolean; error?: Error }> => {
  try {
    const response =
      await apiClient.customers.deleteApisV1ManagerSystemConfigCustomers({
        customerId,
      });

    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      return { success: true };
    }

    const error = new Error(response.message || '删除客户失败');
    return { success: false, error };
  } catch (error) {
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    return { success: false, error: errorObj };
  }
};

/**
 * Import customers
 */
export const importCustomers = async (file: File): Promise<boolean> => {
  const response =
    await apiClient.customers.postApisV1ManagerSystemConfigCustomersImport({
      formData: { file },
    });
  return response.code === API_RESPONSE_CODE.SUCCESS;
};

/**
 * Customer list API call function
 * @param params - Object containing pagination and filter parameters
 */
const fetchCustomerList = async (params: Record<string, any>) => {
  // Extract query conditions from parameters
  const { name, is_active, ...otherParams } = params;

  // Build API request parameters
  const requestParams: Record<string, any> = {};

  // Add filter conditions
  if (name) {
    requestParams.name = name;
  }
  if (typeof is_active === "boolean") {
    requestParams.is_active = is_active;
  }

  // Add other parameters
  Object.assign(requestParams, otherParams);

  const response =
    await apiClient.customers.getApisV1ManagerSystemConfigCustomers(
      requestParams
    );
  return {
    data: response.data || [],
    total: response.data?.length || 0,
  };
};

/**
 * Create customer table request wrapper
 */
export const createCustomerTableRequestWrapper = () =>
  createTableRequestWrapper({
    apiCall: fetchCustomerList,
    defaultLimit: 20,
  });
