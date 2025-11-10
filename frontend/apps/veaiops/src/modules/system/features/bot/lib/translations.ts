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
 * Translation utility functions
 */

import { ChannelType } from "api-generate";

/**
 * Get channel type translation
 */
export const getChannelTypeTranslation = (type: ChannelType): string => {
  const translations: Record<ChannelType, string> = {
    [ChannelType.LARK]: "飞书",
    [ChannelType.DING_TALK]: "钉钉",
    [ChannelType.WE_CHAT]: "微信",
    [ChannelType.WEBHOOK]: "Webhook",
  };

  return translations[type] || type;
};
