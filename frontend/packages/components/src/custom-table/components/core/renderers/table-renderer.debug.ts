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

import type { PaginationProps } from '@arco-design/web-react';
import { logger } from '@veaiops/utils';

interface PaginationDebugParams {
  finalTableProps: Record<string, unknown>;
  current: number;
  pageSize: number;
}

export function buildPaginationDebug({
  finalTableProps,
  current,
  pageSize,
}: PaginationDebugParams): {
  hasPagination: boolean;
  current?: number;
  pageSize?: number;
  total?: number;
  showJumper?: boolean;
  sizeCanChange?: boolean;
  showTotalType?: string;
  showTotalPreview?: string;
} {
  const p = (finalTableProps as { pagination?: PaginationProps })?.pagination;
  if (!p) {
    return { hasPagination: false };
  }

  const showTotalType = typeof p.showTotal;
  let showTotalPreview: string | undefined;

  if (showTotalType === 'function') {
    try {
      showTotalPreview = p.showTotal(p.total ?? 0, [
        (current - 1) * pageSize + 1,
        Math.min(current * pageSize, p.total ?? 0),
      ]);
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      if (process.env.NODE_ENV === 'development') {
        logger.warn({
          message: '[TableRenderer] Preview function execution failed',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'CustomTable',
          component: 'buildPaginationDebug',
        });
      }
    }
  }

  return {
    hasPagination: true,
    current: p.current,
    pageSize: p.pageSize,
    total: p.total,
    showJumper: p.showJumper,
    sizeCanChange: p.sizeCanChange,
    showTotalType,
    showTotalPreview,
  };
}
