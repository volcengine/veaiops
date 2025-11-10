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

import type { TablePaginationConfig } from '@/custom-table/types';
/**
 * Pagination management Hook
 */
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_TABLE_PAGINATION_CONFIG } from '../config';

export interface UsePaginationProps {
  total?: number;
  isPaginationInCache?: boolean;
  config?: TablePaginationConfig;
}

export const usePagination = ({
  total = 0,
  isPaginationInCache = false,
  config = {},
}: UsePaginationProps) => {
  const {
    defaultPageSize = 10,
    defaultCurrent = 1,
    autoReset = true,
  } = { ...DEFAULT_TABLE_PAGINATION_CONFIG, ...config };

  // Pagination state
  const [current, setCurrent] = useState(defaultCurrent);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [isChanging, setIsChanging] = useState(false);

  // Reset pagination
  const reset = useCallback(() => {
    if (!isPaginationInCache) {
      setCurrent(defaultCurrent);
      setPageSize(defaultPageSize);
    }
  }, [isPaginationInCache, defaultCurrent, defaultPageSize]);

  // Go to next page
  const goToNext = useCallback(() => {
    const maxPage = Math.ceil(total / pageSize);
    if (current < maxPage) {
      setCurrent(current + 1);
    }
  }, [current, pageSize, total]);

  // Go to previous page
  const goToPrevious = useCallback(() => {
    if (current > 1) {
      setCurrent(current - 1);
    }
  }, [current]);

  // Go to first page
  const goToFirst = useCallback(() => {
    if (current !== 1) {
      setCurrent(1);
    }
  }, [current]);

  // Go to last page
  const goToLast = useCallback(() => {
    const maxPage = Math.ceil(total / pageSize);
    if (current !== maxPage) {
      setCurrent(maxPage);
    }
  }, [current, pageSize, total]);

  // Handle page number or page size change
  const handleChange = useCallback(
    (page: number, size: number) => {
      setIsChanging(true);

      if (page !== current) {
        setCurrent(page);
      }

      if (size !== pageSize) {
        setPageSize(size);

        // If page size changes, recalculate appropriate page number
        if (autoReset) {
          const newMaxPage = Math.ceil(total / size);
          if (current > newMaxPage) {
            setCurrent(newMaxPage || 1);
          }
        }
      }

      setTimeout(() => {
        setIsChanging(false);
      }, 0);
    },
    [current, pageSize, total, autoReset],
  );

  // Listen for query condition changes, reset pagination
  useEffect(() => {
    if (autoReset && !isPaginationInCache) {
      setCurrent(defaultCurrent);
    }
  }, [autoReset, isPaginationInCache, defaultCurrent]);

  return {
    current,
    pageSize,
    total,
    isChanging,
    setCurrent,
    setPageSize,
    goToFirst,
    goToLast,
    goToNext,
    goToPrevious,
    reset,
    handleChange,
  };
};
