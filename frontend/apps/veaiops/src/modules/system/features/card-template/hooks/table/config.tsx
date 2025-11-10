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
import { Button } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import {
  type BaseQuery,
  type CustomTableActionType,
  type FieldItem,
  type HandleFilterProps,
  type ModernTableColumnProps,
  type QueryFormat,
  useBusinessTable,
} from '@veaiops/components';
import {
  type StandardApiResponse,
  createServerPaginationDataSource,
  createStandardTableProps,
  createTableRequestWithResponseHandler,
  logger,
  queryArrayFormat,
  queryBooleanFormat,
} from '@veaiops/utils';
import type {
  AgentTemplate,
  AgentTemplateCreateRequest,
  AgentTemplateUpdateRequest,
} from 'api-generate';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { getCardTemplateColumns, getCardTemplateFilters } from '../../lib';
import { useCardTemplateCRUD } from '../crud';
import type {
  UseCardTemplateTableConfigOptions,
  UseCardTemplateTableConfigReturn,
} from '../types';

// Re-export types
export type {
  UseCardTemplateTableConfigOptions,
  UseCardTemplateTableConfigReturn,
} from './types';

/**
 * Parameters interface for getting card template table column configuration
 */
export interface GetCardTemplateTableColumnsParams {
  onEdit?: (record: AgentTemplate) => Promise<boolean>;
  onDelete?: (templateId: string) => Promise<boolean>;
  onToggleStatus?: (templateId: string, status: boolean) => Promise<boolean>;
}

/**
 * Get card template table column configuration
 */
export const getCardTemplateTableColumns = ({
  onEdit,
  onDelete,
}: GetCardTemplateTableColumnsParams): ModernTableColumnProps<AgentTemplate>[] => {
  return getCardTemplateColumns({
    onEdit,
    onDelete,
  });
};

/**
 * Card Template table configuration aggregation Hook
 *
 * 🎯 Hook aggregation pattern + auto-refresh mechanism
 * - Use useBusinessTable to centrally manage table logic
 * - Implement auto-refresh through operationWrapper
 * - Centrally manage data source, table configuration, column configuration, etc.
 *
 * @param options - Hook configuration options
 * @returns Table configuration and handlers
 */
export const useCardTemplateTableConfig = ({
  onEdit,
  onDelete,
  onCreate,
  onToggleStatus,
  ref: externalRef,
}: UseCardTemplateTableConfigOptions = {}): UseCardTemplateTableConfigReturn => {
  // 🔍 Log: Hook execution entry point
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  logger.info({
    message: '🟢 [useCardTemplateTableConfig] Hook executed',
    data: {
      renderCount: renderCountRef.current,
      timestamp: Date.now(),
      hasOnEdit: Boolean(onEdit),
      hasOnDelete: Boolean(onDelete),
      hasOnCreate: Boolean(onCreate),
      hasOnToggleStatus: Boolean(onToggleStatus),
      hasExternalRef: Boolean(externalRef),
    },
    source: 'useCardTemplateTableConfig',
    component: 'entry',
  });

  // 🎯 Use external ref or create a new ref
  // ✅ Fix: Prioritize external ref to ensure using the same ref as the page component
  const internalRef =
    useRef<CustomTableActionType<AgentTemplate, BaseQuery>>(null);
  const tableActionRef = externalRef || internalRef;

  // 🎯 Use CRUD Hook to manage business logic
  const crud = useCardTemplateCRUD();

  // 🔍 Log: Monitor modalVisible changes
  useEffect(() => {
    logger.info({
      message: '🔵 [useCardTemplateTableConfig] modalVisible changed',
      data: {
        modalVisible: crud.modalVisible,
        hasEditingTemplate: Boolean(crud.editingTemplate),
        editingTemplateId: crud.editingTemplate?._id,
        timestamp: Date.now(),
      },
      source: 'useCardTemplateTableConfig',
      component: 'modalVisible-effect',
    });
  }, [crud.modalVisible, crud.editingTemplate]);

  // 🎯 Data request logic - use utility functions
  // ✅ Fix: Use useMemo to stabilize request function, avoiding creating new reference on every render
  const request = useMemo(() => {
    logger.info({
      message: '🟡 [useCardTemplateTableConfig] request function created',
      data: {
        timestamp: Date.now(),
        renderCount: renderCountRef.current,
      },
      source: 'useCardTemplateTableConfig',
      component: 'request-useMemo',
    });

    return createTableRequestWithResponseHandler({
      apiCall: async ({ skip, limit, ...otherParams }) => {
        // 🔍 Log: Record API call
        logger.info({
          message: '🔴 [useCardTemplateTableConfig] API request called',
          data: {
            skip,
            limit,
            otherParams,
            timestamp: Date.now(),
            stack: new Error().stack?.split('\n').slice(1, 5).join('\n'), // Call stack
          },
          source: 'useCardTemplateTableConfig',
          component: 'request',
        });

        const response =
          await apiClient.agentTemplate.getApisV1ManagerEventCenterAgentTemplate(
            {
              skip,
              limit,
              ...otherParams,
            },
          );

        // 🔍 Log: Record API response
        logger.info({
          message: '🟢 [useCardTemplateTableConfig] API response returned',
          data: {
            dataCount: response.data?.length || 0,
            total: response.total,
            code: response.code,
            timestamp: Date.now(),
          },
          source: 'useCardTemplateTableConfig',
          component: 'request',
        });

        // handleApiResponse internally handles optional code (supports PaginatedApiResponse)
        // PaginatedAPIResponseAgentTemplateList is compatible with StandardApiResponse structure
        return response as unknown as StandardApiResponse<AgentTemplate[]>;
      },
      options: {
        errorMessagePrefix: 'Failed to get card template list',
        defaultLimit: 10,
      },
    });
  }, []); // ✅ Empty dependency array, as API call logic does not depend on any props or state

  // 🔍 Log: Monitor request reference changes
  const requestRef = useRef(request);
  useEffect(() => {
    if (requestRef.current !== request) {
      logger.warn({
        message: '⚠️ [useCardTemplateTableConfig] request reference changed',
        data: {
          timestamp: Date.now(),
          renderCount: renderCountRef.current,
        },
        source: 'useCardTemplateTableConfig',
        component: 'request-ref-change',
      });
      requestRef.current = request;
    }
  }, [request]);

  // 🎯 Data source configuration - use utility functions
  const dataSource = useMemo(() => {
    logger.info({
      message: '🔵 [useCardTemplateTableConfig] dataSource created',
      data: {
        timestamp: Date.now(),
        renderCount: renderCountRef.current,
      },
      source: 'useCardTemplateTableConfig',
      component: 'dataSource-useMemo',
    });
    return createServerPaginationDataSource({ request });
  }, [request]);

  // 🔍 Log: Monitor dataSource reference changes
  const dataSourceRef = useRef(dataSource);
  useEffect(() => {
    if (dataSourceRef.current !== dataSource) {
      logger.warn({
        message: '⚠️ [useCardTemplateTableConfig] dataSource reference changed',
        data: {
          timestamp: Date.now(),
          renderCount: renderCountRef.current,
          hasRequest: Boolean((dataSource as any)?.request),
        },
        source: 'useCardTemplateTableConfig',
        component: 'dataSource-ref-change',
      });
      dataSourceRef.current = dataSource;
    }
  }, [dataSource]);

  // 🎯 Table configuration - use utility functions
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: '_id',
        pageSize: 10,
        scrollX: 1200,
      }),
    [],
  );

  // 🎯 Business operation wrapper - auto-refresh
  // ✅ Fix: Use handlers mechanism to ensure auto-refresh after handleSubmit success
  // Note: handleAdd and handleEdit only open modal, should not trigger refresh
  // Refresh should be triggered after handleSubmit (form submission success)

  // 🔍 Log: Record handlers creation
  // Note: handlers.delete is no longer needed, as useBusinessTable will automatically wrap through wrappedHandlers
  // But to maintain backward compatibility, we still provide an empty handlers object
  // Delete operation refresh logic has been moved to handleDeleteWithRefresh
  const handlers = useMemo(() => {
    logger.info({
      message: '🟡 [useCardTemplateTableConfig] handlers created (deprecated)',
      data: {
        timestamp: Date.now(),
        renderCount: renderCountRef.current,
        note: 'handlers no longer used for delete operation, delete logic moved to handleDeleteWithRefresh',
      },
      source: 'useCardTemplateTableConfig',
      component: 'handlers-useMemo',
    });

    return {
      // ✅ Create operation: auto-refresh after form submission success
      create: async () => {
        logger.info({
          message: '🟢 [useCardTemplateTableConfig] handlers.create called',
          data: { timestamp: Date.now() },
          source: 'useCardTemplateTableConfig',
          component: 'handlers.create',
        });
        // Actual create logic is handled in handleSubmit
        // This is just a placeholder, actual refresh will be triggered through afterCreate after handleSubmit success
      },
      // ✅ Update operation: auto-refresh after form submission success
      update: async () => {
        logger.info({
          message: '🟢 [useCardTemplateTableConfig] handlers.update called',
          data: { timestamp: Date.now() },
          source: 'useCardTemplateTableConfig',
          component: 'handlers.update',
        });
        // Actual update logic is handled in handleSubmit
        // This is just a placeholder, actual refresh will be triggered through afterUpdate after handleSubmit success
      },
      // ✅ Delete operation moved to handleDeleteWithRefresh, no longer used here
    };
  }, []);

  // 🔍 Log: Monitor handlers reference changes
  const handlersRef = useRef(handlers);
  useEffect(() => {
    if (handlersRef.current !== handlers) {
      logger.warn({
        message: '⚠️ [useCardTemplateTableConfig] handlers reference changed',
        data: {
          timestamp: Date.now(),
          renderCount: renderCountRef.current,
        },
        source: 'useCardTemplateTableConfig',
        component: 'handlers-ref-change',
      });
      handlersRef.current = handlers;
    }
  }, [handlers]);

  const { customTableProps, operations } = useBusinessTable({
    dataSource,
    tableProps,
    handlers,
    refreshConfig: {
      enableRefreshFeedback: true,
      successMessage: 'Operation successful',
      errorMessage: 'Operation failed, please retry',
    },
    ref: tableActionRef, // ✅ Pass ref to make operations.afterDelete work properly
  });

  // 🔍 Log: Monitor customTableProps changes
  useEffect(() => {
    logger.info({
      message: '🔵 [useCardTemplateTableConfig] customTableProps changed',
      data: {
        timestamp: Date.now(),
        renderCount: renderCountRef.current,
        hasDataSource: Boolean(customTableProps.dataSource),
        hasTableProps: Boolean(customTableProps.tableProps),
      },
      source: 'useCardTemplateTableConfig',
      component: 'customTableProps-effect',
    });
  }, [customTableProps]);

  // ✅ Wrap crud.handleDelete with refresh logic
  // Note: If external onDelete is provided, prioritize it (already includes refresh logic)
  const handleDeleteWithRefresh = useCallback(
    async (templateId: string): Promise<boolean> => {
      // If external onDelete is provided, use it directly (assume external has handled refresh logic)
      if (onDelete) {
        return await onDelete(templateId);
      }

      // Use internal crud.handleDelete + refresh logic
      try {
        const success = await crud.handleDelete(templateId);
        if (success && operations.afterDelete) {
          // Refresh table after successful deletion
          const refreshResult = await operations.afterDelete();
          if (!refreshResult.success && refreshResult.error) {
            // ✅ Correct: Use logger to record warning with complete error information
            const errorObj = refreshResult.error;
            logger.warn({
              message: 'Failed to refresh table after deletion',
              data: {
                error: errorObj.message,
                stack: errorObj.stack,
                errorObj,
              },
              source: 'CardTemplate',
              component: 'handleDeleteWithRefresh',
            });
          }
        }
        return success;
      } catch (error) {
        // ✅ Correct: Extract actual error message and log with logger
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage =
          errorObj.message || 'Deletion failed, please retry';
        logger.error({
          message: 'Deletion failed',
          data: {
            error: errorMessage,
            stack: errorObj.stack,
            errorObj,
            templateId,
          },
          source: 'CardTemplate',
          component: 'handleDeleteWithRefresh',
        });
        return false;
      }
    },
    [onDelete, crud.handleDelete, operations.afterDelete],
  );

  // 🎯 Column configuration
  // ✅ Fix: Use handleDeleteWithRefresh that includes refresh logic
  // Note: crud.handleEdit returns void, needs to be wrapped as Promise<boolean> to meet type requirements
  const handleColumns = useCallback(
    (_props?: Record<string, unknown>) => {
      const editHandler =
        onEdit ??
        (async (record: AgentTemplate) => {
          crud.handleEdit(record);
          return true;
        });
      return getCardTemplateTableColumns({
        onEdit: editHandler,
        onDelete: handleDeleteWithRefresh,
        onToggleStatus,
      });
    },
    [onEdit, onToggleStatus, crud.handleEdit, handleDeleteWithRefresh],
  );

  // 🎯 Filter configuration
  const handleFilters = useCallback(
    (props: HandleFilterProps<BaseQuery>): FieldItem[] => {
      return getCardTemplateFilters({
        query: props.query,
        handleChange: props.handleChange,
      });
    },
    [],
  );

  // 🎯 Action configuration
  const renderActions = useCallback(
    (_props?: Record<string, unknown>) => {
      // Prioritize external onCreate, otherwise use internal crud.handleAdd
      const createHandler =
        onCreate ||
        (() => {
          logger.info({
            message:
              '🟢 [useCardTemplateTableConfig] handleAdd called (create button clicked)',
            data: {
              timestamp: Date.now(),
              modalVisible: crud.modalVisible,
            },
            source: 'useCardTemplateTableConfig',
            component: 'createHandler',
          });
          crud.handleAdd();
        });
      return [
        <Button
          key="create"
          type="primary"
          icon={<IconPlus />}
          onClick={createHandler}
        >
          Create Template
        </Button>,
      ];
    },
    [onCreate, crud.handleAdd, crud.modalVisible],
  );

  // 🎯 Query format configuration
  const queryFormat: QueryFormat = useMemo(
    () => ({
      channels: queryArrayFormat,
      agents: queryArrayFormat,
      isActive: (params: { pre: unknown; value: unknown }) =>
        queryBooleanFormat({ value: params.value }),
    }),
    [],
  );

  // ✅ Fix: Wrap handleSubmit to ensure auto-refresh after success
  const handleSubmit = useCallback(
    async (
      values: AgentTemplateCreateRequest | AgentTemplateUpdateRequest,
    ): Promise<boolean> => {
      // ✅ Save editingTemplate value first, as it may be cleared after handleSubmit execution
      const isUpdate = Boolean(crud.editingTemplate);

      logger.info({
        message: `🔵 [useCardTemplateTableConfig] Starting ${isUpdate ? 'update' : 'create'} card template`,
        data: {
          isUpdate,
          hasEditingTemplate: Boolean(crud.editingTemplate),
          timestamp: Date.now(),
        },
        source: 'CardTemplate',
        component: 'handleSubmit',
      });

      const success = await crud.handleSubmit(values);

      if (success) {
        // Determine if it's create or update based on whether editingTemplate exists
        if (isUpdate) {
          const refreshResult = await operations.afterUpdate();
          if (!refreshResult.success && refreshResult.error) {
            // ✅ Correct: Use logger to record warning with complete error information
            const errorObj = refreshResult.error;
            logger.warn({
              message: 'Failed to refresh table after update',
              data: {
                error: errorObj.message,
                stack: errorObj.stack,
                errorObj,
              },
              source: 'CardTemplate',
              component: 'handleSubmit',
            });
          } else {
            logger.info({
              message: '✅ Update successful, table refreshed',
              data: { timestamp: Date.now() },
              source: 'CardTemplate',
              component: 'handleSubmit',
            });
          }
        } else {
          const refreshResult = await operations.afterCreate();
          if (!refreshResult.success && refreshResult.error) {
            // ✅ Correct: Use logger to record warning with complete error information
            const errorObj = refreshResult.error;
            logger.warn({
              message: 'Failed to refresh table after create',
              data: {
                error: errorObj.message,
                stack: errorObj.stack,
                errorObj,
              },
              source: 'CardTemplate',
              component: 'handleSubmit',
            });
          } else {
            logger.info({
              message: '✅ Create successful, table refreshed',
              data: { timestamp: Date.now() },
              source: 'CardTemplate',
              component: 'handleSubmit',
            });
          }
        }
      }
      return success;
    },
    [crud.handleSubmit, crud.editingTemplate, operations],
  );

  // ✅ Fix: Explicit return type to ensure correct type inference
  const result: UseCardTemplateTableConfigReturn = {
    // Table configuration
    customTableProps,
    customOperations: operations,
    handleColumns,
    handleFilters,
    renderActions,
    queryFormat,

    // Business logic state
    modalVisible: crud.modalVisible,
    editingTemplate: crud.editingTemplate,
    form: crud.form,

    // Business logic handlers
    handleEdit: crud.handleEdit,
    handleAdd: crud.handleAdd,
    handleCancel: crud.handleCancel,
    handleSubmit,
    handleDelete: handleDeleteWithRefresh, // ✅ Use delete handler that includes refresh logic
  };

  return result;
};
