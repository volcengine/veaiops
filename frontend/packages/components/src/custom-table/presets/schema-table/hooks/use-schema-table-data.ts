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

import { Message } from '@arco-design/web-react';
import { useCallback, useEffect, useState } from 'react';

import type {
  BaseRecord,
  RequestConfig,
  TableSchema,
} from '@/custom-table/types';

interface UseSchemaTableDataOptions {
  schema: TableSchema<BaseRecord>;
}

interface UseSchemaTableDataReturn {
  dataSource: BaseRecord[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  filters: Record<string, unknown>;
  setDataSource: React.Dispatch<React.SetStateAction<BaseRecord[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setPagination: React.Dispatch<
    React.SetStateAction<{
      current: number;
      pageSize: number;
      total: number;
    }>
  >;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  loadData: (params?: Record<string, unknown>) => Promise<void>;
}

/**
 * Schema Table data management Hook
 */
export const useSchemaTableData = ({
  schema,
}: UseSchemaTableDataOptions): UseSchemaTableDataReturn => {
  const [dataSource, setDataSource] = useState<BaseRecord[]>(
    schema.dataSource || [],
  );
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    ...(typeof schema.features?.pagination === 'object'
      ? schema.features.pagination
      : {}),
  });

  // Data loading
  const loadData = useCallback(
    async (params?: Record<string, unknown>) => {
      if (!schema.request) {
        return;
      }

      try {
        setLoading(true);

        const requestParams = {
          current: pagination.current,
          pageSize: pagination.pageSize,
          ...filters,
          ...params,
        };

        let result;
        if (typeof schema.request === 'function') {
          result = await schema.request(requestParams);
        } else {
          // Handle URL request configuration
          const response = await fetch(schema.request.url || '', {
            method: schema.request.method || 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            body:
              schema.request.method === 'POST'
                ? JSON.stringify(requestParams)
                : undefined,
          });

          const data = await response.json();
          result = schema.request.transform
            ? schema.request.transform(data)
            : data;
        }

        if (result.success !== false) {
          setDataSource(result.data || []);
          setPagination(
            (prev: { current: number; pageSize: number; total: number }) => ({
              ...prev,
              total: result.total || result.data?.length || 0,
            }),
          );

          (schema.request as RequestConfig<BaseRecord>)?.onSuccess?.(
            result.data || [],
          );
        }
      } catch (error: unknown) {
        // ✅ Correct: Pass through actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || 'Data loading failed';
        Message.error(errorMessage);
        (schema.request as RequestConfig<BaseRecord>)?.onError?.(errorObj);
      } finally {
        setLoading(false);
      }
    },
    [schema.request, pagination.current, pagination.pageSize, filters],
  );

  // Initialize data loading
  useEffect(() => {
    if (schema.request && !schema.dataSource) {
      loadData();
    }
  }, [loadData, schema.request, schema.dataSource]);

  return {
    dataSource,
    loading,
    pagination,
    filters,
    setDataSource,
    setLoading,
    setPagination,
    setFilters,
    loadData,
  };
};
