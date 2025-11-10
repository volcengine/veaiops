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
 * Table pagination plugin hook functions
 */
import { createPaginationStateManager } from '@/custom-table/types/utils/state-managers';
import { getStateNumber, isCallableFunction } from './utils';

/**
 * Get current pagination information
 */
export function getPaginationInfo(...args: unknown[]) {
  const context = args[0] as any;
  const current = getStateNumber({
    value: context.state.current,
    defaultValue: 1,
  });
  const pageSize = getStateNumber({
    value: context.state.pageSize,
    defaultValue: 10,
  });
  const total = getStateNumber({
    value: context.state.tableTotal,
    defaultValue: 0,
  });

  return {
    current,
    pageSize,
    total,
  };
}

/**
 * Get pagination configuration
 */
export function getPaginationConfig(...args: unknown[]) {
  const context = args[0] as any;
  const current = getStateNumber({
    value: context.state.current,
    defaultValue: 1,
  });
  const pageSize = getStateNumber({
    value: context.state.pageSize,
    defaultValue: 10,
  });
  const tableTotal = getStateNumber({
    value: context.state.tableTotal,
    defaultValue: 0,
  });

  const pagination = context.props.pagination || {};
  const { setCurrent } = context.helpers;
  const { setPageSize } = context.helpers;

  return {
    total: tableTotal,
    showTotal: (total: number) => `Total ${total} items`,
    showJumper: true,
    sizeCanChange: true,
    current,
    pageSize,
    onChange: (newCurrent: number, newPageSize: number) => {
      if (isCallableFunction(setCurrent)) {
        setCurrent(newCurrent);
      }
      if (isCallableFunction(setPageSize)) {
        setPageSize(newPageSize);
      }
    },
    size: 'default' as const,
    ...(typeof pagination === 'object' && pagination !== null
      ? pagination
      : {}),
  };
}

/**
 * Reset pagination
 */
export function resetPagination(...args: unknown[]) {
  const context = args[0] as any;
  const paginationManager = createPaginationStateManager();
  // Type assertion to be compatible with different PluginContext generic parameters
  paginationManager.resetPaginationState(context);
}
