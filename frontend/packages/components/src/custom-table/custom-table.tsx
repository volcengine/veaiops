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

/**
 * CustomTable main component
 * Highly customizable table component based on plugin architecture - modular refactored version
 *
 * @date 2025-12-19
 */

import { logger } from '@veaiops/utils';
import React, { forwardRef } from 'react';
import { MainContent } from './components/core/main-content';
import { createTableRenderer } from './components/core/renderers';
import type { TableRenderConfig } from './components/core/renderers/table-renderer.types';
import { CustomTableContext } from './context';
import {
  useAutoScrollYWithCalc,
  useCustomTable,
  useImperativeHandle as useCustomTableImperativeHandle,
  useCustomTableRenderers,
  useEnhancedTableContext,
  usePluginManager,
  usePluginWrapper,
  useRenderMonitor,
  useTablePropsHandler,
  useTableRenderConfig,
  useTableStateMonitor,
} from './hooks';
import type { CustomTableActionType } from './types/api/action-type';
import type { BaseQuery, BaseRecord, ServiceRequestType } from './types/core';
import type { CustomTableProps, PluginContext } from './types/index';
import { devLog, useCustomTableAutoLogExport } from './utils/log-utils';
import { usePerformanceLogging } from './utils/performance-logger';
import { resetLogCollector } from './utils/reset-log-collector';
/**
 * CustomTable component implementation
 */
function CustomTableInner<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
  ServiceType extends ServiceRequestType = ServiceRequestType,
  FormatRecordType extends BaseRecord = RecordType,
>(
  props: CustomTableProps<RecordType, QueryType, ServiceType, FormatRecordType>,
  ref: React.Ref<CustomTableActionType<FormatRecordType, QueryType>>,
) {
  // 🔍 Debug: Record props received by CustomTable component (component entry)
  logger.debug({
    message: '[CustomTable] Component received props',
    data: {
      hasDataSource: Boolean(props.dataSource),
      dataSourceType: typeof props.dataSource,
      dataSourceKeys: props.dataSource ? Object.keys(props.dataSource) : [],
      hasRequest: Boolean((props.dataSource as any)?.request),
      requestType: typeof (props.dataSource as any)?.request,
      ready: (props.dataSource as any)?.ready,
      manual: (props.dataSource as any)?.manual,
      isServerPagination: (props.dataSource as any)?.isServerPagination,
      propsKeys: Object.keys(props),
    },
    source: 'CustomTable',
    component: 'CustomTableInner',
  });

  useRenderMonitor({ title: props.title });

  // 🚀 New: Auto log export (development only)
  const {
    exportLogs: _exportLogs,
    isExporting,
    clearLogs: _clearLogs,
  } = useCustomTableAutoLogExport({
    autoStart: process.env.NODE_ENV === 'development',
    exportOnUnload: process.env.NODE_ENV === 'development',
  });

  // Performance monitoring
  const performance = usePerformanceLogging('CustomTable');
  const renderStartTime = performance.startTimer();

  // Enable reset log collection in development environment
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      resetLogCollector.enable();
      devLog.lifecycle({
        component: 'CustomTable',
        event: 'Component initialization completed',
        data: {
          componentId: 'CustomTableInner',
          logCollectionEnabled: true,
          isExporting,
        },
      });
    }
  }, [isExporting]);

  React.useEffect(() => {
    const duration = performance.endTimer(renderStartTime);
    const durationValue = typeof duration === 'number' ? duration : 0;
    devLog.performance({
      component: 'CustomTable',
      operation: 'Complete render cycle',
      duration: durationValue,
      data: {
        componentId: 'CustomTableInner',
        hasPlugins: Boolean(pluginManager),
        pluginsReady,
      },
    });
  });

  // Phase 1: Create base context (without enhanced properties)
  const baseContext = useCustomTable<
    RecordType,
    QueryType,
    ServiceType,
    FormatRecordType
  >(props);

  // Base context created - data integrity check
  devLog.log({
    component: 'CustomTable',
    message: 'Base context created:',
    data: {
      hasData: Boolean(baseContext.state?.formattedTableData),
      dataLength: baseContext.state?.formattedTableData?.length,
      loading: baseContext.state?.loading,
      total: baseContext.state?.tableTotal,
    },
  });

  // Phase 2: Create plugin manager
  const { pluginManager, pluginsReady } = usePluginManager<
    RecordType,
    QueryType
  >(
    {
      features: props.features,
      plugins: props.plugins,
    },
    baseContext as any,
  );

  // 🚀 New: Plugin manager creation log
  React.useEffect(() => {
    if (pluginManager) {
      devLog.lifecycle({
        component: 'PluginManager',
        event: 'Plugin manager creation completed',
        data: {
          pluginsCount: pluginManager.getPlugins().length,
          features: props.features,
          pluginsReady,
        },
      });
    }
  }, [pluginManager, props.features, pluginsReady]);

  // Phase 3: Apply plugin property enhancements
  const context = useEnhancedTableContext(baseContext, pluginManager);

  const { userTableProps, finalRowKey } = useTablePropsHandler({
    tableProps: props.tableProps,
    context,
    rowKey: props.rowKey,
  });

  const _autoScrollConfig = useAutoScrollYWithCalc(
    {
      offset: props.autoScrollY?.offset ?? 350, // Configurable offset
      enabled:
        props.autoScrollY?.enabled !== false &&
        props.stickyConfig?.enableHeaderSticky !== false, // Enabled by default
      minHeight: props.autoScrollY?.minHeight ?? 300,
      maxHeight: props.autoScrollY?.maxHeight,
    },
    userTableProps?.scroll,
  );

  // Enhanced context created - plugin enhancement check
  devLog.log({
    component: 'CustomTable',
    message: 'Enhanced context created:',
    data: {
      hasEnhancedData: Boolean(context.state?.formattedTableData),
      enhancedDataLength: (context.state?.formattedTableData as any[])?.length,
      enhancedLoading: context.state?.loading,
      enhancedTotal: context.state?.tableTotal,
      hasColumns: Boolean(context.props?.baseColumns),
      columnsCount: (context.props?.baseColumns as any[])?.length,
    },
  });

  // Phase 4: Create renderer collection (only executed after plugins are ready)
  // Use BaseRecord to avoid object constraint issues
  const {
    NoDataElement,
    TableFilterComponent,
    AlertComponent,
    renderTableContent,
    renderFooterContent,
  } = useCustomTableRenderers<BaseRecord, any>(
    context as any,
    pluginManager,
    props.dataSource as any,
    pluginsReady, // Pass plugin ready state
  );

  // 🚀 New: Renderer collection creation log
  React.useEffect(() => {
    if (pluginsReady) {
      devLog.lifecycle({
        component: 'Renderers',
        event: 'Renderer collection creation completed',
        data: {
          hasNoDataElement: Boolean(NoDataElement),
          hasTableFilterComponent: Boolean(TableFilterComponent),
          hasAlertComponent: Boolean(AlertComponent),
          hasRenderTableContent: Boolean(renderTableContent),
          hasRenderFooterContent: Boolean(renderFooterContent),
        },
      });
    }
  }, [
    pluginsReady,
    NoDataElement,
    TableFilterComponent,
    AlertComponent,
    renderTableContent,
    renderFooterContent,
  ]);

  // Get data and state from context
  const {
    state: {
      formattedTableData,
      loading,
      tableTotal,
      current,
      pageSize,
      sorter,
      filters,
    },
    helpers: { setCurrent, setPageSize },
    props: {
      // Title-related configuration
      title,
      titleClassName,
      titleStyle,
      actions,

      // Table core configuration
      // rowKey will be handled by finalRowKey for compatibility
      pagination = {},
      tableClassName = '',
      baseColumns,

      // Loading state related configuration
      useCustomLoading = false,
      loadingTip = 'Loading...', // UI text
      customLoading = false,
    },
  } = context;

  const tableRenderConfig = useTableRenderConfig<RecordType>({
    tableClassName,
    rowKey: finalRowKey,
    baseColumns: baseColumns || [],
    formattedData: formattedTableData,
    total: tableTotal,
    emptyStateElement: NoDataElement,
    current,
    pageSize,
    pagination,
    onPageChange: setCurrent as (page: number) => void,
    onPageSizeChange: setPageSize as (size: number) => void,
    loading,
    useCustomLoader: useCustomLoading,
  });

  // Table renderer - based on semantic configuration
  const tableComponent: React.ReactNode = createTableRenderer<
    RecordType,
    QueryType
  >(pluginManager, context, tableRenderConfig);

  // Use type-safe converter to handle generic covariance
  const convertedContext = context as unknown as PluginContext<
    FormatRecordType,
    QueryType
  >;
  const safeFormattedData = formattedTableData as unknown as FormatRecordType[];

  // Expose instance API - use type-safe conversion
  useCustomTableImperativeHandle<FormatRecordType, QueryType>(
    ref,
    convertedContext,
    {
      formattedTableData: safeFormattedData,
      filters,
      sorter: sorter as any,
      current,
      pageSize,
      tableTotal,
    },
    pluginManager,
  );

  useTableStateMonitor({
    formattedTableData,
    loading,
    tableTotal,
    current,
    pageSize,
    sorter,
    filters,
    title,
    actions,
    AlertComponent,
  });

  const mainContent = (
    <MainContent
      title={title}
      actions={actions}
      titleClassName={titleClassName}
      titleStyle={titleStyle}
      actionClassName={props.actionClassName}
      AlertComponent={AlertComponent}
      TableFilterComponent={TableFilterComponent}
      useCustomLoading={useCustomLoading}
      loading={loading}
      customLoading={customLoading}
      loadingTip={loadingTip}
      renderTableContent={renderTableContent}
      renderFooterContent={renderFooterContent}
      tableComponent={tableComponent}
    />
  );

  // ✅ React Hooks must be called before any early returns
  // Call usePluginWrapper before conditional return to comply with React Hooks rules
  const wrappedContent = usePluginWrapper<RecordType, QueryType>({
    pluginManager,
    mainContent,
    context,
  });

  // Final render validation - only log in development
  devLog.log({
    component: 'CustomTable',
    message: 'About to render:',
    data: {
      hasMainContent: Boolean(mainContent),
      hasContext: Boolean(context),
      contextDataLength: (context.state?.formattedTableData as any[])?.length,
      contextLoading: context.state?.loading,
      hasPluginManager: Boolean(pluginManager),
      pluginsReady,
    },
  });

  // If plugins are not ready yet, show loading state
  if (!pluginsReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <div>Initializing plugin system...</div>
      </div>
    );
  }

  // 🐛 Deep debug Context Provider (avoid recording circular reference objects)
  devLog.log({
    component: 'CustomTable',
    message: 'Context Provider debug',
    data: {
      // ✅ Only record safe information, avoid recording context objects containing circular references
      contextKeys: Object.keys(context || {}),
      hasContextProps: Boolean(context?.props),
      hasContextState: Boolean(context?.state),
      hasContextHelpers: Boolean(context?.helpers),
      contextStateKeys: context?.state ? Object.keys(context.state) : [],
      pluginManagerType: typeof pluginManager,
      mainContentType: typeof mainContent,
    },
  });

  // ✅ Add error capture for Context Provider rendering
  try {
    return (
      <div className="custom-table-wrapper">
        <CustomTableContext.Provider value={context as any}>
          {wrappedContent}
        </CustomTableContext.Provider>
      </div>
    );
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: 'CustomTable Context Provider render failed',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
        hasContext: Boolean(context),
        hasWrappedContent: Boolean(wrappedContent),
        wrappedContentType: typeof wrappedContent,
      },
      source: 'CustomTable',
      component: 'ContextProvider',
    });
    // Fallback: directly return wrappedContent without Context Provider
    return <div className="custom-table-wrapper">{wrappedContent}</div>;
  }
}

const CustomTable = forwardRef(CustomTableInner) as <
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
  ServiceType extends ServiceRequestType = ServiceRequestType,
  FormatRecordType extends BaseRecord = RecordType,
>(
  props: CustomTableProps<
    RecordType,
    QueryType,
    ServiceType,
    FormatRecordType
  > & {
    ref?: React.Ref<CustomTableActionType<FormatRecordType>>;
  },
) => React.ReactElement;

export { CustomTable };
