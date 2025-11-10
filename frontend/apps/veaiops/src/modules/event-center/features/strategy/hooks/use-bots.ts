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

const useBotsList = () => {
  const options = useRequest(async () => {
    const res = await apiClient.bots.getApisV1ManagerSystemConfigBots({
      skip: 0,
      limit: 100,
    });
    if (res.code !== API_RESPONSE_CODE.SUCCESS) {
      throw new Error(res.message || 'Failed to fetch bot list');
    }
    const options = (res?.data || [])?.map((item) => ({
      label: item.name,
      value: item.bot_id,
      extra: item,
    }));
    return options;
  });
  return { ...options };
};

export default useBotsList;
