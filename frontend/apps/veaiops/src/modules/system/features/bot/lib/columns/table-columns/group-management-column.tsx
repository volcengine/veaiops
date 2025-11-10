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

import { Button } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { IconUserGroup } from '@arco-design/web-react/icon';
import type { Bot } from '@bot/types';

/**
 * Group management column definition
 */
export const getGroupManagementColumn = ({
  onGroupManagement,
}: {
  onGroupManagement?: (bot: Bot) => void;
}): ColumnProps<Bot> => ({
  title: '群管理',
  key: 'groupManagement',
  width: 100,
  render: (_: unknown, record: Bot) => (
    <Button
      type="text"
      size="small"
      icon={<IconUserGroup />}
      onClick={() => {
        if (onGroupManagement) {
          onGroupManagement(record);
        }
        // If group management callback is not provided, silently skip (feature not implemented)
      }}
      data-testid="group-management-btn"
    >
      群管理
    </Button>
  ),
});
