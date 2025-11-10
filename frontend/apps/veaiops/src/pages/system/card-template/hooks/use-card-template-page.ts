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
import { type Form, Message } from '@arco-design/web-react';
import { useCardTemplateTableConfig } from '@card-template';
import type { BaseQuery, CustomTableActionType } from '@veaiops/components';
import { logger } from '@veaiops/utils';
import type {
  AgentTemplate,
  AgentTemplateCreateRequest,
  AgentTemplateUpdateRequest,
} from 'api-generate';
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Card template page Hook return value type
 */
export interface UseCardTemplatePageReturn {
  // Table reference
  tableRef: React.RefObject<CustomTableActionType<AgentTemplate, BaseQuery>>;

  // Guide related state
  showGuide: boolean;
  guideVisible: boolean;
  setGuideVisible: (visible: boolean) => void;
  shouldShowGuide: boolean; // showGuide && guideVisible

  // Management logic (modal, form, event handlers, etc.)
  managementLogic: {
    modalVisible: boolean;
    editingTemplate: AgentTemplate | null;
    form: ReturnType<typeof Form.useForm>[0];
    handleCancel: () => void;
    handleSubmit: (
      values: AgentTemplateCreateRequest | AgentTemplateUpdateRequest,
    ) => Promise<boolean>;
  };

  // Table configuration
  dataSource: Record<string, unknown>;
  tableProps: Record<string, unknown>;
  handleColumns: ReturnType<typeof useCardTemplateTableConfig>['handleColumns'];
  handleFilters: ReturnType<typeof useCardTemplateTableConfig>['handleFilters'];
  queryFormat: ReturnType<typeof useCardTemplateTableConfig>['queryFormat'];

  // Action button configuration
  actions: React.ReactNode[];
}

/**
 * Card template page Hook
 * Encapsulates all page-level logic and state
 */
export const useCardTemplatePage = (): UseCardTemplatePageReturn => {
  // ✅ Fix: tableRef type uses AgentTemplate (single source of truth principle)
  const tableRef =
    useRef<CustomTableActionType<AgentTemplate, BaseQuery>>(null);
  const [, setData] = useState<AgentTemplate[]>([]);
  const [, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guideVisible, setGuideVisible] = useState(false);

  // Table configuration
  // ✅ Use modules version of complete Hook, supports customTableProps return value structure
  // ✅ Fix: Pass tableRef to useCardTemplateTableConfig to ensure same ref is used on refresh
  const {
    customTableProps,
    handleColumns: tableHandleColumns,
    handleFilters: tableHandleFilters,
    queryFormat: tableQueryFormat,
    renderActions,
    modalVisible,
    editingTemplate,
    form,
    handleCancel,
    handleSubmit,
  } = useCardTemplateTableConfig({
    ref: tableRef,
  });

  // ✅ Extract dataSource and tableProps from customTableProps
  const { dataSource, tableProps } = useMemo(() => {
    const extracted = customTableProps as {
      dataSource: Record<string, unknown>;
      tableProps: Record<string, unknown>;
      [key: string]: unknown;
    };
    return {
      dataSource: extracted.dataSource || {},
      tableProps: extracted.tableProps || {},
    };
  }, [customTableProps]);

  // 🔍 Debug: Log useCardTemplateTableConfig return value
  useEffect(() => {
    logger.debug({
      message: '[useCardTemplatePage] useCardTemplateTableConfig return value',
      data: {
        hasCustomTableProps: Boolean(customTableProps),
        customTablePropsKeys: customTableProps
          ? Object.keys(customTableProps)
          : [],
        hasDataSource: Boolean(dataSource),
        dataSourceType: typeof dataSource,
        dataSourceKeys: dataSource ? Object.keys(dataSource) : [],
        hasRequest: Boolean((dataSource as any)?.request),
        requestType: typeof (dataSource as any)?.request,
        hasTableProps: Boolean(tableProps),
      },
      source: 'useCardTemplatePage',
      component: 'useCardTemplatePage',
    });
  }, [customTableProps, dataSource, tableProps]);

  // 🔍 Debug: Log destructured dataSource
  useEffect(() => {
    logger.debug({
      message: '[useCardTemplatePage] Destructured dataSource',
      data: {
        hasDataSource: Boolean(dataSource),
        dataSourceType: typeof dataSource,
        dataSourceKeys: dataSource ? Object.keys(dataSource) : [],
        hasRequest: Boolean((dataSource as any)?.request),
        requestType: typeof (dataSource as any)?.request,
        ready: (dataSource as any)?.ready,
        manual: (dataSource as any)?.manual,
        isServerPagination: (dataSource as any)?.isServerPagination,
      },
      source: 'useCardTemplatePage',
      component: 'useCardTemplatePage',
    });
  }, [dataSource]);

  // Action button configuration
  const actions = renderActions({});

  // Check if guide page should be displayed
  useEffect(() => {
    const checkInitialState = async () => {
      try {
        setLoading(true);
        const response =
          await apiClient.agentTemplate.getApisV1ManagerEventCenterAgentTemplate(
            {
              limit: 10,
              skip: 0,
            },
          );

        if (response.data && response.data.length === 0) {
          setShowGuide(true);
          setGuideVisible(true);
        }
        setData(response.data || []);
      } catch (error: unknown) {
        // ✅ Correct: expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || '获取模版列表失败，请重试';
        Message.error(errorMessage);
        logger.error({
          message: 'Failed to check initial state',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'useCardTemplatePage',
          component: 'checkInitialState',
        });
      } finally {
        setLoading(false);
      }
    };

    checkInitialState();
  }, []);

  // ✅ Calculate whether guide page should be displayed
  const shouldShowGuide = useMemo(
    () => showGuide && guideVisible,
    [showGuide, guideVisible],
  );

  // ✅ Use useMemo to stabilize return value, avoid creating new object references on each render
  return useMemo(
    () => ({
      // Table reference
      tableRef,

      // Guide related state
      showGuide,
      guideVisible,
      setGuideVisible,
      shouldShowGuide,

      // Management logic (includes modal state and handlers)
      managementLogic: {
        modalVisible,
        editingTemplate,
        form,
        handleCancel,
        handleSubmit,
      },

      // Table configuration
      dataSource,
      tableProps,
      handleColumns: tableHandleColumns,
      handleFilters: tableHandleFilters,
      queryFormat: tableQueryFormat,

      // Action button configuration
      actions,
    }),
    [
      tableRef,
      showGuide,
      guideVisible,
      setGuideVisible,
      shouldShowGuide,
      modalVisible,
      editingTemplate,
      form,
      handleCancel,
      handleSubmit,
      dataSource,
      tableProps,
      tableHandleColumns,
      tableHandleFilters,
      tableQueryFormat,
      actions,
    ],
  );
};
