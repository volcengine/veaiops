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

import type { SubscribeRelationWithAttributes } from 'api-generate';
import { useEffect, useState } from 'react';

/**
 * Webhook management Hook return value type
 */
export interface UseWebhookManagementReturn {
  webhookHeaders: Array<{ key: string; value: string }>;
  addWebhookHeader: () => void;
  removeWebhookHeader: (index: number) => void;
  updateWebhookHeader: (
    index: number,
    field: 'key' | 'value',
    value: string,
  ) => void;
  resetWebhookHeaders: () => void;
}

/**
 * Webhook management Hook parameters
 */
export interface UseWebhookManagementParams {
  /** Initial data (used in edit mode) */
  initialData?: SubscribeRelationWithAttributes | null;
}

/**
 * Convert backend webhook_headers object to array format used by frontend form
 *
 * @param webhookHeadersObj - Backend webhook_headers object
 * @returns Array format used by frontend form
 *
 * @example
 * ```ts
 * const headers = convertWebhookHeadersToArray({
 *   'Content-Type': 'application/json',
 *   'Authorization': 'Bearer token'
 * });
 * // Returns: [
 * //   { key: 'Content-Type', value: 'application/json' },
 * //   { key: 'Authorization', value: 'Bearer token' }
 * // ]
 * ```
 */
const convertWebhookHeadersToArray = (
  webhookHeadersObj: Record<string, string> | undefined | null,
): Array<{ key: string; value: string }> => {
  if (!webhookHeadersObj || typeof webhookHeadersObj !== 'object') {
    return [];
  }

  return Object.entries(webhookHeadersObj).map(([key, value]) => ({
    key,
    value,
  }));
};

/**
 * Webhook management Hook
 * Provides state management functionality for Webhook request headers
 *
 * @param params - Hook parameters
 * @returns Webhook management functions and state
 */
export const useWebhookManagement = ({
  initialData,
}: UseWebhookManagementParams = {}): UseWebhookManagementReturn => {
  const [webhookHeaders, setWebhookHeaders] = useState<
    Array<{ key: string; value: string }>
  >(() => {
    // Extract webhook_headers from initialData during initialization
    if (initialData?.webhook_headers) {
      return convertWebhookHeadersToArray(initialData.webhook_headers);
    }
    return [];
  });

  // Re-initialize webhookHeaders when initialData changes
  useEffect(() => {
    if (initialData?.webhook_headers) {
      setWebhookHeaders(
        convertWebhookHeadersToArray(initialData.webhook_headers),
      );
    } else {
      setWebhookHeaders([]);
    }
  }, [initialData]);

  /**
   * Add Webhook request header
   */
  const addWebhookHeader = () => {
    setWebhookHeaders([...webhookHeaders, { key: '', value: '' }]);
  };

  /**
   * Remove Webhook request header
   */
  const removeWebhookHeader = (index: number) => {
    const newHeaders = webhookHeaders.filter((_, i) => i !== index);
    setWebhookHeaders(newHeaders);
  };

  /**
   * Update Webhook request header
   */
  const updateWebhookHeader = (
    index: number,
    field: 'key' | 'value',
    value: string,
  ) => {
    const newHeaders = [...webhookHeaders];
    newHeaders[index][field] = value;
    setWebhookHeaders(newHeaders);
  };

  /**
   * Reset Webhook request headers
   */
  const resetWebhookHeaders = () => {
    setWebhookHeaders([]);
  };

  return {
    webhookHeaders,
    addWebhookHeader,
    removeWebhookHeader,
    updateWebhookHeader,
    resetWebhookHeaders,
  };
};

export default useWebhookManagement;
