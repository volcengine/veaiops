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

import type { PluginContext } from '@/custom-table/types';
import { devLog } from '@/custom-table/utils/log-utils';
import { logger } from '@veaiops/utils';
import React from 'react';

export interface UseTablePropsHandlerParams<RecordType, QueryType> {
  tableProps: any;
  context: PluginContext<RecordType, QueryType>;
}

export interface UseTablePropsHandlerResult {
  userTableProps: any;
  finalRowKey: string | ((record: any) => React.Key);
}

export function useTablePropsHandler<RecordType, QueryType>({
  tableProps,
  context,
  rowKey: propRowKey,
}: UseTablePropsHandlerParams<RecordType, QueryType> & {
  rowKey?: string | ((record: RecordType) => React.Key);
}): UseTablePropsHandlerResult {
  let userTableProps: any;
  try {
    if (typeof tableProps === 'function') {
      const loadingState = Boolean(context.state?.loading);
      devLog.log({
        component: 'CustomTable',
        message: 'Calling tableProps function',
        data: {
          loading: loadingState,
          hasTableProps: Boolean(tableProps),
        },
      });
      userTableProps = tableProps({ loading: loadingState });
      devLog.log({
        component: 'CustomTable',
        message: 'tableProps function call succeeded',
        data: {
          userTablePropsType: typeof userTableProps,
          hasPagination: Boolean(userTableProps?.pagination),
          rowKey: userTableProps?.rowKey,
        },
      });
    } else {
      userTableProps = tableProps;
      devLog.log({
        component: 'CustomTable',
        message: 'Using static tableProps',
        data: {
          hasPagination: Boolean(userTableProps?.pagination),
          rowKey: userTableProps?.rowKey,
        },
      });
    }
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: 'tableProps call failed',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
        tablePropsType: typeof tableProps,
      },
      source: 'CustomTable',
      component: 'tablePropsHandler',
    });
    userTableProps = {};
  }

  const finalRowKey = React.useMemo(() => {
    const defaultRowKey = propRowKey || 'Id';

    if (defaultRowKey !== 'Id') {
      return defaultRowKey;
    }

    const tablePropsRowKey =
      userTableProps && typeof userTableProps === 'object'
        ? (userTableProps as Record<string, unknown>).rowKey
        : undefined;

    if (
      tablePropsRowKey &&
      (typeof tablePropsRowKey === 'string' ||
        typeof tablePropsRowKey === 'function')
    ) {
      return tablePropsRowKey;
    }

    return defaultRowKey;
  }, [propRowKey, userTableProps]);

  return {
    userTableProps,
    finalRowKey,
  };
}

