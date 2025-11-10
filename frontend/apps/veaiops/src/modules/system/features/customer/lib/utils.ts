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

import type { Customer } from "api-generate";
import type { CustomerTableData } from "@customer/types";

/**
 * Customer import data row interface
 *
 * Corresponds to import file template column structure (IMPORT_FILE_CONFIG.templateColumns)
 * All fields are optional because import files may be incomplete
 */
export interface CustomerImportRow {
  name?: string;
  contact?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  type?: string;
  level?: string;
  description?: string;
}

/**
 * Transform customer data to table data
 * Note: Directly use Customer type from api-generate, do not add non-existent fields
 */
export const transformCustomerToTableData = (
  customer: Record<string, unknown> | Customer
): CustomerTableData => {
  // Use Customer type fields from api-generate
  const apiCustomer = customer as Customer;
  return {
    _id: apiCustomer._id,
    customer_id: apiCustomer.customer_id || "",
    name: apiCustomer.name || "",
    desensitized_name: apiCustomer.desensitized_name,
    is_active: apiCustomer.is_active ?? true,
    created_at: apiCustomer.created_at,
    updated_at: apiCustomer.updated_at,
  } as CustomerTableData;
};

/**
 * Format time display
 */
export const formatTime = (time: string): string => {
  return new Date(time).toLocaleString();
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Generate customer ID
 */
export const generateCustomerId = (): string => {
  return `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if customer can be deleted
 * According to Customer type from api-generate, use is_active to determine
 */
export const canDeleteCustomer = (isActive?: boolean): boolean => {
  return !isActive; // Inactive customers can be deleted
};

/**
 * Check if customer can be edited
 * According to Customer type from api-generate, all customers can be edited
 */
export const canEditCustomer = (): boolean => {
  return true;
};

/**
 * Format customer status display
 * According to Customer type from api-generate, only has is_active field
 */
export const formatCustomerStatus = (isActive?: boolean): string => {
  return isActive ? "活跃" : "非活跃";
};


/**
 * Validate import file format
 */
export const validateImportFile = (
  file: File
): { valid: boolean; message?: string } => {
  const allowedTypes = [".xlsx", ".xls", ".csv"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  // Check file type
  const fileExtension = file.name
    .toLowerCase()
    .substring(file.name.lastIndexOf("."));
  if (!allowedTypes.includes(fileExtension)) {
    return {
      valid: false,
      message: `不支持的文件格式，请上传 ${allowedTypes.join("、")} 格式的文件`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      message: "文件大小不能超过10MB",
    };
  }

  return { valid: true };
};

/**
 * Parse import data
 *
 * @param data - Array of imported customer data rows, each row corresponds to CustomerImportRow structure
 * @returns Array of transformed customer table data
 */
export const parseImportData = (data: CustomerImportRow[]): CustomerTableData[] => {
  return data
    .map((row, index) => {
      try {
        return transformCustomerToTableData({
          id: generateCustomerId(),
          name: row.name || `客户${index + 1}`,
          contact: row.contact || '',
          email: row.email || '',
          phone: row.phone || '',
          company: row.company || '',
          address: row.address || '',
          type: row.type || 'individual',
          level: row.level || 'basic',
          status: 'pending',
          description: row.description || '',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch (error) {
        // Silent handling: return null when data transformation fails, will be filtered out in filter
        return null;
      }
    })
    .filter(Boolean) as CustomerTableData[];
};
