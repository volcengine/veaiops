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

import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { useCallback, useEffect, useState } from 'react';

/**
 * Parameters interface for viewing encrypted information
 */
interface UseSecretViewerParams {
  botId?: string;
  form: FormInstance;
}

/**
 * Return value interface for viewing encrypted information
 */
export interface UseSecretViewerReturn {
  loadingSecrets: {
    api_key: boolean;
    ak: boolean;
    sk: boolean;
  };
  showSecretTooltips: {
    api_key: boolean;
    ak: boolean;
    sk: boolean;
  };
  handleViewSecret: (
    fieldName: 'agent_cfg.api_key' | 'volc_cfg.ak' | 'volc_cfg.sk',
    formField: string,
    secretKey: 'api_key' | 'ak' | 'sk',
  ) => Promise<void>;
}

/**
 * Hook for managing encrypted information viewing
 */
export const useSecretViewer = ({
  botId,
  form,
}: UseSecretViewerParams): UseSecretViewerReturn => {
  const [loadingSecrets, setLoadingSecrets] = useState({
    api_key: false,
    ak: false,
    sk: false,
  });
  const [showSecretTooltips, setShowSecretTooltips] = useState({
    api_key: false,
    ak: false,
    sk: false,
  });

  /**
   * View encrypted information
   * Get decrypted value through API and fill it into the form
   */
  const handleViewSecret = useCallback(
    async (
      fieldName: 'agent_cfg.api_key' | 'volc_cfg.ak' | 'volc_cfg.sk',
      formField: string,
      secretKey: 'api_key' | 'ak' | 'sk',
    ) => {
      if (!botId) {
        Message.error('Bot ID 不存在');
        return;
      }

      setLoadingSecrets((prev) => ({ ...prev, [secretKey]: true }));
      try {
        const response =
          await apiClient.bots.getApisV1ManagerSystemConfigBotsSecrets({
            uid: botId,
            fieldName,
          });

        if (response.code === API_RESPONSE_CODE.SUCCESS) {
          if (response.data) {
            form.setFieldValue(formField, response.data);
            setShowSecretTooltips((prev) => ({ ...prev, [secretKey]: true }));
            Message.success('已获取加密信息');
          } else {
            Message.warning('该字段未配置');
          }
        } else {
          Message.error(response.message || '获取加密信息失败');
        }
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || '获取加密信息失败';
        Message.error(errorMessage);
      } finally {
        setLoadingSecrets((prev) => ({ ...prev, [secretKey]: false }));
      }
    },
    [botId, form],
  );

  // Auto-hide tooltip
  useEffect(() => {
    const timers = Object.entries(showSecretTooltips).map(([key, show]) => {
      if (show) {
        return setTimeout(() => {
          setShowSecretTooltips((prev) => ({ ...prev, [key]: false }));
        }, 3000);
      }
      return null;
    });

    return () => {
      timers.forEach((timer) => {
        if (timer) {
          clearTimeout(timer);
        }
      });
    };
  }, [showSecretTooltips]);

  return {
    loadingSecrets,
    showSecretTooltips,
    handleViewSecret,
  };
};
