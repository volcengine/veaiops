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

import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import { PROJECT_MANAGEMENT_CONFIG } from '@project';
import {
  type BaseQuery,
  type FieldItem,
  type HandleFilterProps,
  useBusinessTable,
} from '@veaiops/components';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import {
  createServerPaginationDataSource,
  createStandardTableProps,
  createTableRequestWithResponseHandler,
} from '@veaiops/utils';
import type { Project } from 'api-generate';
import { useCallback, useMemo } from 'react';
import type {
  UseProjectTableConfigOptions,
  UseProjectTableConfigReturn,
} from '../types';
import { useProjectCRUD } from '../use-project-crud';
import {
  getProjectTableActions,
  getProjectTableColumns,
  getProjectTableFilters,
} from './lib';

/**
 * Project 表格配置聚合 Hook
 *
 * 🎯 Hook 聚合模式 + 自动刷新机制
 * - 使用 useBusinessTable 统一管理表格逻辑
 * - 通过 operationWrapper 实现自动刷新
 * - 集中管理数据源、表格配置、列配置等
 *
 * @param options - Hook 配置选项
 * @returns 表格配置和处理器
 */
export const useProjectTableConfig = ({
  onEdit,
  onDelete,
  onCreate,
  onImport,
  onToggleStatus,
  ref, // ✅ 接收 ref 参数
}: UseProjectTableConfigOptions): UseProjectTableConfigReturn => {
  // 🎯 使用 CRUD Hook 管理业务逻辑
  const crud = useProjectCRUD();

  // 🎯 数据请求逻辑 - 使用工具函数
  // ✅ 关键修复：使用 useMemo 稳定化 request 函数引用
  const request = useMemo(
    () =>
      createTableRequestWithResponseHandler<Project[]>({
        apiCall: async ({ skip, limit, name }) => {
          console.log('[ProjectTableConfig] 🔵 API 请求开始', {
            skip,
            limit,
            name,
            timestamp: Date.now(),
          });

          const response =
            await apiClient.projects.getApisV1ManagerSystemConfigProjects({
              skip,
              limit,
              name: name as string | undefined,
            });

          console.log('[ProjectTableConfig] ✅ API 请求成功', {
            dataLength: response.data?.length,
            total: response.total,
            timestamp: Date.now(),
          });

          // 强制类型兼容：PaginatedAPIResponseProjectList -> StandardApiResponse<Project[]>
          // 保证 code 为 number，满足 StandardApiResponse 要求
          return {
            code: response.code ?? API_RESPONSE_CODE.SUCCESS,
            data: response.data ?? [],
            total:
              response.total ??
              (Array.isArray(response.data) ? response.data.length : 0),
            message: response.message ?? '',
          };
        },
        options: {
          errorMessagePrefix: '获取项目列表失败',
          defaultLimit: PROJECT_MANAGEMENT_CONFIG.pageSize,
          onError: (error) => {
            console.error('[ProjectTableConfig] ❌ API 请求失败', {
              error: error instanceof Error ? error.message : String(error),
              timestamp: Date.now(),
            });
            const errorMessage =
              error instanceof Error
                ? error.message
                : '获取项目列表失败，请重试';
            Message.error(errorMessage);
          },
        },
      }),
    [], // ✅ 空依赖数组，request 函数保持稳定
  );

  // 🎯 数据源配置 - 使用工具函数
  const dataSource = useMemo(() => {
    return createServerPaginationDataSource({ request });
  }, [request]);

  // 🎯 表格配置 - 使用工具函数
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: '_id',
        pageSize: PROJECT_MANAGEMENT_CONFIG.pageSize,
        scrollX: 1400,
      }),
    [],
  );

  // 🎯 业务操作包装 - 自动刷新
  // ✅ 使用 handlers 模式，让 useBusinessTable 自动包装操作函数
  const { customTableProps, wrappedHandlers } = useBusinessTable<
    Record<string, unknown>,
    Project,
    BaseQuery
  >({
    dataSource,
    tableProps,
    handlers: {
      delete: async (id: string) => {
        console.log('[ProjectTableConfig] 🗑️ 执行删除操作（包装前）', {
          projectId: id,
          timestamp: Date.now(),
        });
        if (onDelete) {
          const result = await onDelete(id);
          console.log('[ProjectTableConfig] ✅ 删除操作完成', {
            projectId: id,
            success: result,
            timestamp: Date.now(),
          });
          return result;
        }
        return false;
      },
    },
    refreshConfig: {
      enableRefreshFeedback: true,
      successMessage: '操作成功',
      errorMessage: '操作失败，请重试',
    },
    ref,
  });

  // 🎯 使用包装后的删除函数
  const wrappedOnDelete = useCallback(
    async (id: string): Promise<boolean> => {
      if (wrappedHandlers?.delete) {
        return await wrappedHandlers.delete(id);
      }
      return false;
    },
    [wrappedHandlers],
  );

  // 🎯 列配置 - 使用包装后的删除函数
  const handleColumns = useCallback(
    (_props?: Record<string, unknown>) =>
      getProjectTableColumns({
        onEdit,
        onDelete: wrappedOnDelete, // ✅ 使用包装后的函数
        onToggleStatus,
      }),
    [onEdit, wrappedOnDelete, onToggleStatus],
  );

  // 🎯 筛选配置
  const handleFilters = useCallback(
    (props: HandleFilterProps<BaseQuery>): FieldItem[] => {
      return getProjectTableFilters(props);
    },
    [],
  );

  // 🎯 操作配置
  const renderActions = useCallback(
    (_props?: Record<string, unknown>) => {
      return getProjectTableActions({ onCreate, onImport });
    },
    [onCreate, onImport],
  );

  // 🎯 转换 renderActions 为 actions
  const actions = useMemo(() => {
    return renderActions({});
  }, [renderActions]);

  return {
    // 表格配置
    customTableProps,
    wrappedHandlers,
    handleColumns,
    handleFilters,
    renderActions,
    actions,

    // 业务逻辑状态
    modalVisible: crud.modalVisible,
    editingProject: crud.editingProject,
    submitting: crud.submitting,
    form: crud.form,

    // 导入相关状态
    importDrawerVisible: crud.importDrawerVisible,
    uploading: crud.uploading,

    // 新建项目相关状态
    createDrawerVisible: crud.createDrawerVisible,
    creating: crud.creating,

    // 业务逻辑处理器
    handleCancel: crud.handleCancel,
    handleSubmit: crud.handleSubmit,
    handleDelete: crud.handleDelete,
    checkDeletePermission: crud.checkDeletePermission,

    // 导入相关处理器
    handleImport: crud.handleImport,
    handleOpenImportDrawer: crud.handleOpenImportDrawer,
    handleCloseImportDrawer: crud.handleCloseImportDrawer,

    // 新建项目相关处理器
    handleCreate: crud.handleCreate,
    handleOpenCreateDrawer: crud.handleOpenCreateDrawer,
    handleCloseCreateDrawer: crud.handleCloseCreateDrawer,
  };
};
