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

const useChatsList = () => {
  const options = useRequest(
    async (uid) => {
      if (!uid) {
        return [];
      }
      const res = await apiClient.chats.getApisV1ConfigChats({
        uid,
        skip: 0,
        limit: 100,
      });
      if (res.code !== API_RESPONSE_CODE.SUCCESS) {
        throw new Error(res.message || 'Failed to fetch Lark chat list');
      }
      const options = (res?.data || [])?.map((item) => ({
        label: item.name || item.chat_id,
        value: item.chat_id || '',
      }));
      sessionStorage.setItem('charts_option', JSON.stringify(options));
      return options;
    },
    {
      manual: true,
    },
  );
  return { ...options };
};

export default useChatsList;
