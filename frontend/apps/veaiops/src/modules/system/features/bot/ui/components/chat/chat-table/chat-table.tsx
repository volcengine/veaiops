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
import { CHAT_TABLE_QUERY_FORMAT } from '@bot/lib';
import { CustomTable, type CustomTableActionType } from '@veaiops/components';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';
import type { Chat } from 'api-generate';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { useChatTableConfigWrapper } from './config';
import { useChatTableHandlers } from './handlers';
import { type ChatTableRef, useChatTableRefHandler } from './ref-handlers';

interface ChatTableProps {
  uid?: string;
}

export type { ChatTableRef };

/**
 * Chat management table component
 *
 * Split explanation:
 * - chat-table/ref-handlers.ts: Ref handling (useImperativeHandle)
 * - chat-table/config.ts: Configuration retrieval (useChatTableConfig call and logging)
 * - chat-table/handlers.ts: handleColumns and handleFilters handler functions
 * - chat-table/chat-table.tsx: Main component, responsible for assembly and rendering
 */
export const ChatTable = forwardRef<ChatTableRef, ChatTableProps>(
  ({ uid }, ref) => {
    // ✅ Add component render start log - Keep Chinese error message in code string
    logger.info({
      message: '[ChatTable] 组件开始渲染', // Keep Chinese error message in code string
      data: {
        uid,
        uidType: typeof uid,
      },
      source: 'ChatTable',
      component: 'ChatTable',
    });

    // CustomTable ref for calling refresh method
    const tableRef = useRef<CustomTableActionType<Chat>>(null);

    // Ref handling
    useChatTableRefHandler({ ref, tableRef });

    // Function to update a single configuration field
    const handleUpdateConfig = useCallback(
      async (params: {
        chatId: string;
        field: 'enable_func_interest' | 'enable_func_proactive_reply';
        value: boolean;
        currentRecord: Chat;
      }): Promise<boolean> => {
        try {
          // Build update configuration, keeping other fields unchanged
          const config = {
            enable_func_proactive_reply:
              params.field === 'enable_func_proactive_reply'
                ? params.value
                : (params.currentRecord.enable_func_proactive_reply ?? false),
            enable_func_interest:
              params.field === 'enable_func_interest'
                ? params.value
                : (params.currentRecord.enable_func_interest ?? false),
          };

          // Call API to update configuration
          const response = await apiClient.chats.putApisV1ConfigChatsConfig({
            uid: params.chatId,
            requestBody: config,
          });

          if (response.code === API_RESPONSE_CODE.SUCCESS) {
            Message.success('配置更新成功');
            // Refresh table
            if (tableRef.current?.refresh) {
              await tableRef.current.refresh();
            }
            return true;
          } else {
            throw new Error(response.message || '更新配置失败');
          }
        } catch (error: unknown) {
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          const errorMessage = errorObj.message || '更新配置失败，请重试';
          Message.error(errorMessage);

          logger.error({
            message: '更新配置失败',
            data: {
              error: errorMessage,
              stack: errorObj.stack,
              errorObj,
              params,
            },
            source: 'ChatTable',
            component: 'handleUpdateConfig',
          });
          return false;
        }
      },
      [],
    );

    // Table configuration
    const { customTableProps } = useChatTableConfigWrapper({
      tableRef,
    });

    // Handler functions
    const { handleColumns, handleFilters } = useChatTableHandlers({
      onUpdateConfig: handleUpdateConfig,
    });

    // ✅ Use useMemo to stabilize initQuery object, avoid creating new reference on each render
    // ✅ Default query for is_active=true chats (deleted ones are no longer shown by default)
    const initQuery = useMemo(
      () => ({
        force_refresh: false,
        uid,
        is_active: true, // Only show active chats by default
      }),
      [uid],
    );

    // ✅ Add pre-render log
    logger.info({
      message: '[ChatTable] 准备渲染 CustomTable',
      data: {
        hasCustomTableProps: Boolean(customTableProps),
        customTablePropsKeys: customTableProps
          ? Object.keys(customTableProps)
          : [],
        customTablePropsHasTableProps: Boolean(customTableProps?.tableProps),
        customTablePropsTablePropsType: typeof customTableProps?.tableProps,
        hasHandleColumns: Boolean(handleColumns),
        hasHandleFilters: Boolean(handleFilters),
        hasInitQuery: Boolean(initQuery),
        initQuery,
      },
      source: 'ChatTable',
      component: 'render',
    });

    // ✅ Add error boundary to catch rendering errors
    // Note: React component rendering errors cannot be caught with try-catch, need to use Error Boundary
    // But we can add detailed logs here to help locate issues
    return (
      <div className="chat-table-container">
        <CustomTable<Chat>
          {...customTableProps}
          ref={tableRef}
          handleColumns={handleColumns}
          handleFilters={handleFilters}
          initQuery={initQuery}
          queryFormat={CHAT_TABLE_QUERY_FORMAT}
        />
      </div>
    );
  },
);

ChatTable.displayName = 'ChatTable';

export default ChatTable;
