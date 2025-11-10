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

import { authConfig } from '@/config/auth';
import apiClient from '@/utils/api-client';
import { Form, type FormInstance, Message } from '@arco-design/web-react';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';
import type { APIResponseLoginToken, LoginRequest } from 'api-generate';
import { useState } from 'react';

type LoginFormData = LoginRequest;

export const useLogin = (): {
  form: FormInstance<LoginFormData>;
  loading: boolean;
  handleSubmit: (
    values: LoginFormData,
  ) => Promise<{ success: boolean; error?: Error }>;
} => {
  const [form] = Form.useForm<LoginFormData>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    values: LoginFormData,
  ): Promise<{ success: boolean; error?: Error }> => {
    setLoading(true);
    try {
      const response: APIResponseLoginToken =
        await apiClient.authentication.postApisV1AuthToken({
          requestBody: values,
        });

      if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
        // Fix: Use localStorage instead of sessionStorage to support cross-tab authentication state sharing
        // Reason: sessionStorage is session-based, each tab has independent storage space
        // When opening a new tab with target="_blank", the new tab cannot access the parent tab's sessionStorage
        const { data } = response;
        if (data.access_token) {
          localStorage.setItem(authConfig.storageKeys.token, data.access_token);
        }

        // Store username
        localStorage.setItem(authConfig.storageKeys.username, values.username);

        Message.success('登录成功');

        // Use full URL path for redirect to ensure correct navigation
        window.location.href = `${window.location.origin}${authConfig.defaultRedirectPath}`;

        // ✅ Return success result
        return { success: true };
      } else if (response.code === API_RESPONSE_CODE.ERROR) {
        // ✅ Display error message based on error code and return error result
        const errorMessage = '用户名或密码错误';
        Message.error(errorMessage);
        return {
          success: false,
          error: new Error(errorMessage),
        };
      }

      // ✅ Unknown response code, return error result
      const errorMessage = response.message || '登录失败，请重试';
      Message.error(errorMessage);
      return {
        success: false,
        error: new Error(errorMessage),
      };
    } catch (error: unknown) {
      // ✅ Correct: Expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = errorObj.message || '登录失败，请检查网络连接后重试';
      Message.error(errorMessage);
      // ✅ Correct: Use logger to record error (object destructuring parameters)
      logger.error({
        message: 'Login failed',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
          username: values.username,
        },
        source: 'useLogin',
        component: 'handleSubmit',
      });

      // ✅ Return error result, conforming to async method error handling specification
      return { success: false, error: errorObj };
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    handleSubmit,
  };
};
