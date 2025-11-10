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
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { useRequest } from 'ahooks';
import type { Chat } from 'api-generate';

/**
 * Dropdown option type definition
 */
interface SelectOption {
  label: string;
  value: string;
}

/**
 * Transform Chat API returned data item to format suitable for Select component
 * @param item - Single Chat object
 * @returns SelectOption format object
 */
const transformDataToOption = (item: Chat): SelectOption => ({
  label: item.name || item.chat_id,
  value: item.chat_id,
});

const useChatsList = () => {
  const {
    data,
    loading,
    error,
    run: fetchChats,
  } = useRequest(
    async (uid: string): Promise<SelectOption[]> => {
      const res = await apiClient.chats.getApisV1ConfigChats({
        uid,
        skip: 0,
        limit: 100, // For dropdown lists, fetching a fixed longer list is usually acceptable
      });
      if (res.code !== API_RESPONSE_CODE.SUCCESS) {
        throw new Error(res.message || 'Failed to fetch Lark chat list');
      }
      // Use optional chaining and nullish coalescing operator to ensure safety, and perform data transformation
      return (res.data ?? []).map(transformDataToOption);
    },
    {
      manual: true,
      // Suggestion: Can enable caching based on business needs to avoid duplicate requests
      // cacheKey: 'chats-list',
      // staleTime: 5 * 60 * 1000, // Data is considered fresh within 5 minutes
    },
  );

  // Return more explicit interface, not all return items from ahooks
  return {
    chatOptions: data,
    loadingChats: loading,
    loadError: error,
    fetchChats,
  };
};

export default useChatsList;
