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

import { createStandardTableProps } from '@veaiops/utils';
import { useCallback, useMemo } from 'react';

/**
 * Table properties configuration Hook
 *
 * ✅ Utility functions used:
 * - createStandardTableProps: Creates standard table properties configuration
 */
export const useChatTableProps = () => {
  // ✅ Use utility function to create table properties configuration
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: 'chat_id',
        pageSize: 10,
        scrollX: 1000,
        // Note: stripe property is not supported by createStandardTableProps
        // If stripe is needed, should be configured directly in CustomTable's tableProps
      }),
    [],
  );

  // ✅ Use useCallback to stabilize tableProps function, avoid creating new reference on each render
  // Note: CustomTable will pass { loading: boolean } parameter, function needs to receive this parameter
  const memoizedTableProps = useCallback(
    (ctx?: { loading?: boolean }) => ({
      ...tableProps,
      pagination: {
        pageSize: 10,
        sizeCanChange: true,
        showJumper: true,
        showTotal: true, // Use default pagination display format
      },
      // Can adjust other properties based on loading state (if needed)
      ...(ctx?.loading !== undefined && {}),
    }),
    [tableProps],
  );

  return {
    tableProps,
    memoizedTableProps,
  };
};
