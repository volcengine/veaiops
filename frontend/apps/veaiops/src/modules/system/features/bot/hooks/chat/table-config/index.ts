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

import type { CustomTableActionType } from '@veaiops/components';
import { useBusinessTable } from '@veaiops/components';
import type { Chat } from 'api-generate';
import type React from 'react';
import { useChatTableRequest } from './request';
import { useChatTableProps } from './table-props';

/**
 * Chat management table configuration Hook parameter interface
 */
export interface UseChatTableConfigParams {
  ref?: React.Ref<CustomTableActionType<Chat>>;
}

/**
 * Chat management table configuration Hook
 *
 * Split explanation:
 * - request.ts: API request configuration (request function and dataSource)
 * - table-props.ts: Table property configuration (tableProps and memoizedTableProps)
 * - index.ts: Unified export, combines all logic, uses useBusinessTable to automatically handle refresh
 *
 * ✅ Tools used:
 * - createTableRequestWithResponseHandler: Automatically handles pagination parameters and responses
 * - createServerPaginationDataSource: Creates server-side pagination data source
 * - createStandardTableProps: Creates standard table property configuration
 * - useBusinessTable: Automatically handles refresh logic
 */
export const useChatTableConfig = ({ ref }: UseChatTableConfigParams) => {
  // API request configuration
  const { dataSource } = useChatTableRequest();

  // Table property configuration
  const { memoizedTableProps } = useChatTableProps();

  // 🎯 Use useBusinessTable to automatically handle refresh logic
  // ✅ Pass function-form tableProps to useBusinessTable
  const { customTableProps, operations } = useBusinessTable({
    dataSource,
    tableProps: memoizedTableProps, // ✅ Pass function instead of object
    refreshConfig: {
      enableRefreshFeedback: false, // ChatTable does not use refresh feedback
    },
    // ref type already supports generic parameters, no type assertion needed
    ref,
  });

  return {
    customTableProps,
    operations,
  };
};
