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
 * CustomTable Hooks unified exports
 * Reference pro-components design, providing unified external API
 */

// Core hooks
export { useCustomTable } from './use-custom-table';
export {
  useStableCallback,
  useStableObject,
  useStableHandler,
  useStableProps,
} from './use-stable-props';
// export { useTableState } from './use-table-state'; // Commented out to avoid duplicate exports with internal

// Business table unified hook
export {
  useBusinessTable,
  type BusinessTableConfigOptions,
  type BusinessTableConfigResult,
  type OperationWrappers,
} from './use-business-table';

// Refresh integration hook
export {
  useTableRefreshIntegration,
  type TableRefreshIntegrationOptions,
  type TableRefreshIntegrationReturn,
} from './use-table-refresh-integration';

// Ready-to-use refresh handler hooks
export {
  useTableRefreshHandlers,
  useSimpleTableRefresh,
  type RefreshHandlers,
  type UseTableRefreshHandlersOptions,
  type UseTableRefreshHandlersReturn,
} from './use-table-refresh-handlers';

// Plugin-related hooks
export { useDataSource } from './use-data-source';
export { useAlert } from './use-alert';
export { useAutoScrollYWithCalc } from './use-auto-scroll-y';
export { useTableColumns } from './use-table-columns';
export { useQuerySync } from './use-query-sync';
export { usePluginManager } from './use-plugin-manager';

// Column configuration management Hook
export { useColumns as useColumnConfig } from './use-column-config';

// Renderer hooks
export { useCustomTableRenderers } from './use-custom-table-renderers';

// Context hooks
export {
  useCustomTableContext,
  useEnhancedTableContext,
} from './use-custom-table-context';

// Lifecycle hooks
export { useLifecycleManager } from './use-lifecycle-manager';

// Subscription mechanism hooks
export { SubscriptionProvider, useSubscription } from './use-subscription';

// Utility hooks
export { useImperativeHandle } from './use-imperative-handle';
export { useRenderMonitor } from './use-render-monitor';
export { useTablePropsHandler } from './use-table-props-handler';
export { useTableRenderConfig } from './use-table-render-config';
export { useTableStateMonitor } from './use-table-state-monitor';
export { usePluginWrapper } from './use-plugin-wrapper';

// Internal hooks
export * from './internal';

// Imperative hooks
export * from './imperative';
