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

import { useChatTableConfig } from '@bot/hooks';
import type { CustomTableActionType } from '@veaiops/components';
import { logger } from '@veaiops/utils';
import type { Chat } from 'api-generate';
import type { RefObject } from 'react';

/**
 * Chat management table configuration retrieval Hook
 */
export const useChatTableConfigWrapper = ({
  tableRef,
}: {
  tableRef: RefObject<CustomTableActionType<Chat>>;
}) => {
  // ✅ Note: Cannot wrap Hook calls in try-catch, violates React Hooks rules
  // ✅ Add logging, but don't catch errors (errors handled by Error Boundary)
  logger.info({
    message: '[ChatTable] 开始调用 useChatTableConfig',
    data: {
      hasTableRef: Boolean(tableRef),
    },
    source: 'ChatTable',
    component: 'useChatTableConfig',
  });

  const configResult = useChatTableConfig({
    ref: tableRef,
  });

  logger.info({
    message: '[ChatTable] useChatTableConfig 调用成功',
    data: {
      hasCustomTableProps: Boolean(configResult.customTableProps),
      hasOperations: Boolean(configResult.operations),
      customTablePropsKeys: configResult.customTableProps
        ? Object.keys(configResult.customTableProps)
        : [],
      customTablePropsHasTableProps: Boolean(
        configResult.customTableProps?.tableProps,
      ),
      customTablePropsTablePropsType:
        typeof configResult.customTableProps?.tableProps,
    },
    source: 'ChatTable',
    component: 'useChatTableConfig',
  });

  return configResult;
};
