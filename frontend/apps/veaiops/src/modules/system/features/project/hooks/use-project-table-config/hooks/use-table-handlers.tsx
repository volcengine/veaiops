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

import { Button } from '@arco-design/web-react';
import { IconPlus, IconUpload } from '@arco-design/web-react/icon';
import type {
  BaseQuery,
  FieldItem,
  HandleFilterProps,
  ModernTableColumnProps,
} from '@veaiops/components';
import type { Project } from 'api-generate';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { getProjectTableColumns } from '../columns';
import type { GetProjectTableColumnsParams } from '../types';

interface UseTableHandlersParams {
  onEdit?: (record: Project) => Promise<boolean>;
  onDelete?: (projectId: string) => Promise<boolean>;
  onToggleStatus?: (projectId: string, status: boolean) => Promise<boolean>;
  onCreate?: () => void;
  onImport?: () => void;
}

/**
 * Table handler configuration Hook
 */
export const useTableHandlers = ({
  onEdit,
  onDelete,
  onToggleStatus,
  onCreate,
  onImport,
}: UseTableHandlersParams) => {
  // 🎯 Column configuration
  const handleColumns = useCallback(
    (_props?: Record<string, unknown>): ModernTableColumnProps<Project>[] =>
      getProjectTableColumns({
        onEdit,
        onDelete,
        onToggleStatus,
      }),
    [onEdit, onDelete, onToggleStatus],
  );

  // 🎯 Filter configuration
  // Note: Backend only supports name parameter filtering (veaiops/handler/routers/apis/v1/system_config/project.py)
  // Does not support project_id and is_active parameters, so only keep name filter
  const handleFilters = useCallback(
    (props: HandleFilterProps<BaseQuery>): FieldItem[] => {
      const { query, handleChange } = props;
      return [
        {
          field: 'name',
          label: '项目名称',
          type: 'Input',
          componentProps: {
            placeholder: '请输入项目名称',
            allowClear: true,
            value: query.name as string | undefined,
            onChange: (v: string) => {
              handleChange({ key: 'name', value: v });
            },
          },
        },
      ];
    },
    [],
  );

  // 🎯 Action configuration
  const renderActions = useCallback(
    (_props?: Record<string, unknown>) => {
      const actions: React.ReactNode[] = [];

      if (onCreate) {
        actions.push(
          <Button
            key="create"
            type="primary"
            htmlType="button"
            icon={<IconPlus />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCreate();
            }}
          >
            新建项目
          </Button>,
        );
      }

      if (onImport) {
        actions.push(
          <Button
            key="import"
            htmlType="button"
            icon={<IconUpload />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onImport();
            }}
          >
            导入项目
          </Button>,
        );
      }

      return actions;
    },
    [onCreate, onImport],
  );

  // 🎯 Convert renderActions to actions
  const actions = useMemo(() => {
    return renderActions({});
  }, [renderActions]);

  return {
    handleColumns,
    handleFilters,
    renderActions,
    actions,
  };
};
