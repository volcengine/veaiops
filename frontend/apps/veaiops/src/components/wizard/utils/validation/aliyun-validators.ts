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
 * Aliyun data validation utilities
 * @description Provides Aliyun-related data validation functionality
 * @author AI Assistant
 * @date 2025-01-16
 */

/**
 * Validate connection ID format
 * @param connectId Connection ID
 * @returns Whether it's a valid MongoDB ObjectId format
 */
export const validateConnectId = (connectId: string): boolean => {
  if (!connectId) {
    return false;
  }

  // Must be 24-character hexadecimal string (MongoDB ObjectId format)
  if (connectId.length !== 24) {
    return false;
  }

  // Check if it's a valid hexadecimal string
  if (!/^[0-9a-fA-F]{24}$/.test(connectId)) {
    return false;
  }

  return true;
};

/**
 * Validate connection ID and return error message
 * @param connectId Connection ID
 * @returns Validation result and error message
 */
export const validateConnectIdWithMessage = (
  connectId: string,
): {
  isValid: boolean;
  errorMessage?: string;
} => {
  if (!connectId) {
    return {
      isValid: false,
      errorMessage: '连接ID不能为空',
    };
  }

  if (connectId.length !== 24) {
    return {
      isValid: false,
      errorMessage: '连接ID长度必须为24位',
    };
  }

  if (!/^[0-9a-fA-F]{24}$/.test(connectId)) {
    return {
      isValid: false,
      errorMessage: '连接ID必须为有效的十六进制字符串',
    };
  }

  return {
    isValid: true,
  };
};
