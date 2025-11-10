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

import type { ColumnProps } from '@arco-design/web-react/es/Table';
import type { Bot } from '@bot/types';

/**
 * Base column definitions (App ID, Name, Open ID)
 */
export const getBaseColumns = (): ColumnProps<Bot>[] => [
  {
    title: 'App ID',
    dataIndex: 'bot_id',
    key: 'bot_id',
    width: 200,
    ellipsis: true,
  },
  {
    title: '群聊机器人名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    ellipsis: true,
  },
  {
    title: 'Open ID',
    dataIndex: 'open_id',
    key: 'open_id',
    width: 200,
    ellipsis: true,
    render: (openId: string) => openId || '-',
  },
];
