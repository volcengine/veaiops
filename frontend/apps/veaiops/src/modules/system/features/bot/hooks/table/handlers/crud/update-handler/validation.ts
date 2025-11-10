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

import { Message } from '@arco-design/web-react';
import type { Bot } from '@bot/lib';
import { logger } from '@veaiops/utils';

/**
 * Pre-update validation
 */
export const validateUpdateRequest = ({
  editingBot,
}: {
  editingBot: Bot | null;
}): boolean => {
  if (!editingBot || !editingBot._id) {
    logger.warn({
      message: '更新机器人失败：App ID 不能为空',
      data: {
        editingBot: editingBot ? { _id: editingBot._id } : null,
        source: 'useBot',
        action: 'handleUpdate',
      },
      source: 'BotManagement',
      component: 'handleUpdate',
    });
    Message.error('App ID 不能为空');
    return false;
  }
  return true;
};
