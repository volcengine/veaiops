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

import { CustomPagination } from '@/custom-table/components';
import type { CustomPaginationProps } from '@/custom-table/components';
/**
 * Table pagination plugin render methods
 */
import { devLog } from '@/custom-table/utils';
import type { ExtendedPaginationConfig } from './types';
import { getStateNumber, isCallableFunction } from './utils';

/**
 * renderPagination parameters interface
 */
export interface RenderPaginationParams {
  context: any;
  finalConfig: ExtendedPaginationConfig;
}

/**
 * Render pagination component
 */
export function renderPagination({
  context,
  finalConfig,
}: RenderPaginationParams) {
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

  // Use position from pagination props or config default
  const paginationPosition =
    pagination && typeof pagination === 'object' && 'position' in pagination
      ? (pagination as { position?: string }).position
      : finalConfig.position;

  const position = ['top', 'bottom', 'both'].includes(paginationPosition || '')
    ? (paginationPosition as 'top' | 'bottom' | 'both')
    : (finalConfig.position as 'top' | 'bottom' | 'both');

  if (tableTotal === 0) {
    return null;
  }

  // Build pagination props using type-safe approach
  const basePaginationProps: Partial<CustomPaginationProps> = {
    position,
    total: tableTotal,
    showJumper: finalConfig.showJumper === true,
    sizeCanChange: finalConfig.showPageSize === true,
    current,
    pageSize,
    onChange: (page: number, size: number) => {
      if (isCallableFunction(setCurrent)) {
        setCurrent(page);
      }
      if (isCallableFunction(setPageSize)) {
        setPageSize(size);
      }
    },
  };

  // Safely spread pagination props, excluding incompatible properties and showTotal
  const extraProps: Record<string, unknown> = {};
  if (
    typeof pagination === 'object' &&
    pagination !== null &&
    !Array.isArray(pagination)
  ) {
    const paginationRecord = pagination as Record<string, unknown>;
    Object.keys(paginationRecord).forEach((key) => {
      if (!['position', 'className', 'showTotal'].includes(key)) {
        extraProps[key] = paginationRecord[key];
      }
    });
  }

  const paginationProps: CustomPaginationProps = {
    ...basePaginationProps,
    ...extraProps,
    // Ensure key properties are not overridden
    total: tableTotal,
    current,
    pageSize,
  } as CustomPaginationProps;

  devLog.log({
    component: 'TablePaginationPlugin',
    message: 'paginationProps before render:',
    data: {
      tableTotal,
      total: paginationProps.total,
      current: paginationProps.current,
      pageSize: paginationProps.pageSize,
    },
  });

  return <CustomPagination {...paginationProps} />;
}
