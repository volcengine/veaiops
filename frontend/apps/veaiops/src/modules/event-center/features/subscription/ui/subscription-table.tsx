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

import { ModuleType } from '@/types/module';
// ✅ Optimization: Use shortest path, merge imports from same source
import {
  getSubscriptionColumns,
  getSubscriptionFilters,
  useSubscriptionActionConfig,
  useSubscriptionTableConfig,
} from '@ec/subscription';
import {
  type BaseQuery,
  CustomTable,
  type HandleFilterProps,
  type ModernTableColumnProps,
} from '@veaiops/components';
import { logger, queryArrayFormat, queryBooleanFormat } from '@veaiops/utils';
import { AgentType, type SubscribeRelationWithAttributes } from 'api-generate';
import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';

/**
 * Subscription relation table data type
 */
interface SubscriptionTableData extends SubscribeRelationWithAttributes {
  key: string;
  [key: string]: any; // Add index signature to satisfy BaseRecord constraint
}

/**
 * Subscription relation table component props interface
 */
interface SubscriptionTableProps {
  onEdit: (subscription: SubscribeRelationWithAttributes) => void;
  onDelete: (subscriptionId: string) => Promise<boolean>;
  onAdd: () => void;
  onView: (subscription: SubscribeRelationWithAttributes) => void; // Add onView prop
  moduleType?: ModuleType;
}

// Configuration object
const SUBSCRIPTION_MANAGEMENT_CONFIG = {
  title: 'Event Subscription',
};

const queryFormat = {
  // Project name list - array format
  projects: queryArrayFormat,
  // Product name list - array format
  products: queryArrayFormat,
  // Customer name list - array format
  customers: queryArrayFormat,
  eventLevels: queryArrayFormat,
  // Task ID list - array format
  agents: queryArrayFormat,
  statuses: queryArrayFormat,
  // Auto update - boolean format
  enableWebhook: queryBooleanFormat,
};

/**
 * Subscription relation table component
 * Encapsulates table rendering logic, provides clear interface
 */
export const SubscriptionTable = forwardRef<any, SubscriptionTableProps>(
  ({ onEdit, onDelete, onAdd, onView, moduleType }, ref) => {
    // 🔍 Render count and reference tracking (for debugging)
    const renderCountRef = useRef(0);
    const prevDataSourceRef = useRef<unknown>(null);
    const prevHandleColumnsRef = useRef<unknown>(null);
    const prevHandleFiltersRef = useRef<unknown>(null);

    renderCountRef.current++;

    // Table configuration
    const { dataSource, tableProps } = useSubscriptionTableConfig({
      handleEdit: onEdit,
      handleDelete: onDelete,
    });

    // 🔍 Track dataSource reference changes
    useEffect(() => {
      if (prevDataSourceRef.current !== dataSource) {
        logger.debug({
          message: '[SubscriptionTable] dataSource reference changed',
          data: {
            renderCount: renderCountRef.current,
            prevDataSource: prevDataSourceRef.current,
            currentDataSource: dataSource,
            dataSourceChanged:
              prevDataSourceRef.current !== null &&
              prevDataSourceRef.current !== dataSource,
          },
          source: 'SubscriptionTable',
          component: 'useEffect',
        });
        prevDataSourceRef.current = dataSource;
      }
    }, [dataSource]);

    // Action button configuration
    const { actions } = useSubscriptionActionConfig(onAdd);

    // Create handleColumns function, pass action callbacks to column configuration
    // 🔧 Use useCallback to stabilize function reference, avoid triggering unnecessary table refresh
    const handleColumns = useCallback(
      (
        props: Record<string, unknown>,
      ): ModernTableColumnProps<SubscriptionTableData>[] => {
        // CustomTable passes props containing query, handleChange, etc.
        // Need to ensure type conversion is correct
        const filterProps = props as HandleFilterProps<BaseQuery>;
        return getSubscriptionColumns({
          ...filterProps,
          onEdit,
          onDelete,
          onView,
        });
      },
      [onEdit, onDelete, onView],
    );

    // 🔍 Track handleColumns reference changes
    useEffect(() => {
      if (prevHandleColumnsRef.current !== handleColumns) {
        logger.debug({
          message: '[SubscriptionTable] handleColumns reference changed',
          data: {
            renderCount: renderCountRef.current,
            prevHandleColumns: prevHandleColumnsRef.current,
            currentHandleColumns: handleColumns,
          },
          source: 'SubscriptionTable',
          component: 'useEffect',
        });
        prevHandleColumnsRef.current = handleColumns;
      }
    }, [handleColumns]);

    // Create handleFilters function
    // 🔧 Use useCallback to stabilize function reference, avoid triggering unnecessary table refresh
    const handleFilters = useCallback(
      (props: HandleFilterProps<BaseQuery>) =>
        getSubscriptionFilters({
          query: props.query,
          handleChange: props.handleChange,
          moduleType,
        }),
      [moduleType],
    );

    // 🔍 Track handleFilters reference changes
    useEffect(() => {
      if (prevHandleFiltersRef.current !== handleFilters) {
        logger.debug({
          message: '[SubscriptionTable] handleFilters reference changed',
          data: {
            renderCount: renderCountRef.current,
            prevHandleFilters: prevHandleFiltersRef.current,
            currentHandleFilters: handleFilters,
          },
          source: 'SubscriptionTable',
          component: 'useEffect',
        });
        prevHandleFiltersRef.current = handleFilters;
      }
    }, [handleFilters]);

    // 🔍 Log component render (development only)
    useEffect(() => {
      logger.debug({
        message: '[SubscriptionTable] component render',
        data: {
          renderCount: renderCountRef.current,
          moduleType,
          hasDataSource: Boolean(dataSource),
          hasHandleColumns: Boolean(handleColumns),
          hasHandleFilters: Boolean(handleFilters),
        },
        source: 'SubscriptionTable',
        component: 'useEffect',
      });
    });

    // Set default filter agent based on module type
    const initQuery = useMemo(() => {
      // Intelligent threshold module: default filter intelligent threshold agent
      if (moduleType === ModuleType.INTELLIGENT_THRESHOLD) {
        return { agents: [AgentType.INTELLIGENT_THRESHOLD_AGENT] };
      }
      // Oncall module: default filter content recognition agent
      if (moduleType === ModuleType.ONCALL) {
        return { agents: [AgentType.CHATOPS_INTEREST_AGENT] };
      }
      // Event center module: default filter content recognition agent + intelligent threshold agent
      return {
        agents: [
          AgentType.CHATOPS_INTEREST_AGENT,
          AgentType.INTELLIGENT_THRESHOLD_AGENT,
        ],
      };
    }, [moduleType]);

    return (
      <CustomTable<SubscriptionTableData>
        ref={ref}
        title={SUBSCRIPTION_MANAGEMENT_CONFIG.title}
        actions={actions}
        initQuery={initQuery}
        handleColumns={handleColumns}
        handleFilters={handleFilters}
        dataSource={dataSource}
        tableProps={tableProps}
        syncQueryOnSearchParams
        useActiveKeyHook
        // Table configuration
        tableClassName="subscription-management-table"
        queryFormat={queryFormat}
      />
    );
  },
);

export default SubscriptionTable;
