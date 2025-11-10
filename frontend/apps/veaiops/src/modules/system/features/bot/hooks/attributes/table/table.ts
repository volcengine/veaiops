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

import type { BotAttributeFiltersQuery } from '@bot/lib';
import type { BotAttributeFormData } from '@bot/types';
import type { CustomTableActionType } from '@veaiops/components';
import type { BotAttribute } from 'api-generate';
import type React from 'react';
import { useCallback, useRef } from 'react';
import { useBotAttributesTableConfig } from './config';
import { useBotAttributesTableLogic } from './logic';

/**
 * Bot attributes table Hook parameters
 */
export interface UseBotAttributesTableParams {
  botId?: string;
  channel?: string;
}

/**
 * Bot attributes table Hook return value
 */
export interface UseBotAttributesTableReturn {
  // Business logic
  logic: ReturnType<typeof useBotAttributesTableLogic>;

  // Table configuration
  tableRef: React.RefObject<
    CustomTableActionType<BotAttribute, BotAttributeFiltersQuery>
  >;
  handleColumns: () => ReturnType<
    ReturnType<typeof useBotAttributesTableConfig>['handleColumns']
  >;
  handleFilters: ReturnType<
    typeof useBotAttributesTableConfig
  >['handleFilters'];
  initQuery: BotAttributeFiltersQuery;
  dataSource: {
    request: (params?: Record<string, unknown>) => Promise<unknown>;
    ready: boolean;
    responseItemsKey: string;
  };
  tableProps: ReturnType<typeof useBotAttributesTableConfig>['tableProps'];

  // Wrapped event handlers (automatically pass tableRef)
  handleDelete: (attribute: BotAttribute) => Promise<boolean>;
  handleFormSubmit: (values: BotAttributeFormData) => Promise<boolean>;
}

/**
 * Bot attributes table aggregation Hook
 * Integrates business logic, table configuration, and tableRef to provide unified table-related functionality
 */
export const useBotAttributesTable = ({
  botId,
  channel,
}: UseBotAttributesTableParams): UseBotAttributesTableReturn => {
  // 🎯 Business logic and state management
  const logic = useBotAttributesTableLogic({ botId, channel });

  // 🎯 Create tableRef for refresh operations
  const tableRef =
    useRef<CustomTableActionType<BotAttribute, BotAttributeFiltersQuery>>(null);

  // ✅ Fix infinite loop: use ref to stabilize method references in logic, avoid depending on entire logic object
  // According to spec: avoid depending on entire object, only extract necessary configuration fields
  // Use ref pattern: use ref in useCallback callback to store latest value, create stable wrapper function
  const logicRef = useRef(logic);
  logicRef.current = logic;

  // 🎯 Create wrapped delete handler function, automatically pass tableRef
  const handleDelete = useCallback(
    async (attribute: BotAttribute): Promise<boolean> => {
      try {
        await logicRef.current.handleDelete(attribute, tableRef);
        return true;
      } catch (error) {
        // Error already handled in Hook
        return false;
      }
    },
    [], // ✅ Empty dependency array to ensure function reference stability
  );

  // 🎯 Create wrapped form submit function, refresh table after success
  const handleFormSubmit = useCallback(
    async (values: BotAttributeFormData): Promise<boolean> => {
      const success = await logicRef.current.handleFormSubmit(values);
      // If successful, refresh table
      if (success) {
        const refreshSuccess = await logicRef.current.refreshTable(tableRef);
        return refreshSuccess;
      }
      return false;
    },
    [], // ✅ Empty dependency array to ensure function reference stability
  );

  // 🎯 Table configuration (using wrapped handleDelete)
  const config = useBotAttributesTableConfig({
    botId,
    channel,
    onDelete: handleDelete,
    tableRef,
  });

  return {
    logic,
    tableRef: config.tableRef,
    handleColumns: config.handleColumns,
    handleFilters: config.handleFilters,
    initQuery: config.initQuery,
    dataSource: config.dataSource,
    tableProps: config.tableProps,
    handleDelete,
    handleFormSubmit,
  };
};
