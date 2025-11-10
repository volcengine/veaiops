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

import { Alert, Drawer } from '@arco-design/web-react';
import type { ChatManagementDrawerProps } from '@bot';
import { useManagementRefresh } from '@veaiops/hooks';
import { logger } from '@veaiops/utils';
import type React from 'react';
import { useRef } from 'react';
import { BotDrawerTitle } from '../bot/drawer-title';
import { ChatTable, type ChatTableRef } from './chat-table/index';

/**
 * Chat management drawer component
 *
 * Corresponds to origin/feat/web-v2 branch implementation, ensures functional consistency
 */
export const ChatManagementDrawer: React.FC<ChatManagementDrawerProps> = ({
  visible,
  onClose,
  selectedBot,
}) => {
  // Table reference, used to get refresh function
  const tableRef = useRef<ChatTableRef>(null);

  // Get table refresh function
  const getRefreshTable = async () => {
    if (tableRef.current?.refresh) {
      const result = await tableRef.current.refresh();
      if (!result.success && result.error) {
        logger.warn({
          message: '聊天表格刷新失败',
          data: {
            error: result.error.message,
            stack: result.error.stack,
            errorObj: result.error,
          },
          source: 'ChatManagementDrawer',
          component: 'getRefreshTable',
        });
      }
    }
  };

  // Use management refresh Hook, provide refresh functionality after configuration update
  const { afterUpdate } = useManagementRefresh(getRefreshTable);

  return (
    <Drawer
      width={1200}
      title={
        selectedBot ? (
          <BotDrawerTitle bot={selectedBot} title="群管理" />
        ) : (
          '群管理'
        )
      }
      visible={visible}
      onCancel={onClose}
      footer={null}
      maskClosable={false}
      focusLock={false}
    >
      {/* Guide tip: Need to add corresponding bot to group chat first */}
      <Alert
        type="warning"
        content="需要先在群聊中拉入对应机器人"
        className="mb-4"
      />
      <ChatTable ref={tableRef} uid={selectedBot?._id ?? undefined} />
    </Drawer>
  );
};
