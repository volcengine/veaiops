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

import { logger } from '@veaiops/utils';
import React, { type FC, useMemo, useEffect, useRef } from 'react';

// Import type definitions
import type { FiltersComponentProps } from './core/types';

// Import custom hooks
import {
  useFieldRenderer,
  useFilterConfig,
  useFilterForm,
  useFilterReset,
  useFilterStyle,
  usePluginContext,
  usePluginSystem,
} from './core/hooks';

// Import child components
import {
  ActionsArea,
  FieldsArea,
  FilterContainer,
  RightActionsArea,
} from './components';

// Import logging utilities
import { filterLogger } from './utils/logger';
// import { useAutoLogExport } from '@veaiops/utils';

// Export utility functions and constants
export * from './core/constants';
export * from './core/utils';
export * from './core/renderer';

// Export label conversion related types and functions
export type { LabelAsType } from './core/utils';
export { processLabelAsComponentProp } from './core/utils';

// Selectively export plugin system to avoid type conflicts
export {
  filterPluginRegistry,
  initializeCorePlugins,
  getPluginStats,
  pluginExtensionManager,
  corePlugins,
} from './plugins';

// Export core types to avoid duplication with plugin types
export type {
  FiltersComponentProps,
  FilterStyle,
  FieldItem,
} from './core/types';

// Export plugin system types
export type {
  FilterPlugin,
  FilterPluginContext,
  FilterPluginRenderProps,
  PluginConfig,
  FilterEventBus,
} from '@veaiops/types';

/**
 * Filter main component internal implementation
 * Uses plugin-based architecture and componentized structure, supports multiple filter component types
 */
const FiltersInner: FC<FiltersComponentProps> = (props) => {
  // 🚀 New: Auto log export (development only)
  // Note: useAutoLogExport not available in current build context
  const exportLogs = () => Promise.resolve();
  const getLogCount = () => 0;

  const {
    className = '',
    wrapperClassName = '',
    config = [],
    actions = [],
    customActions = [],
    customActionsStyle = {},
    filterStyle,
    query,
    resetFilterValues,
    showReset,
  } = props;

  // 🔧 Use useMemo to stabilize config reference, avoid re-renders caused by object recreation
  const stableConfig = useMemo(() => config, [config]);

  // Initialize plugin system
  const { pluginSystemStats } = usePluginSystem();

  // 🔧 Fix infinite loop: use useRef to track render count, avoid logging on every render
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  const mountTimestamp = useRef(Date.now());
  const componentId = useRef(
    `Filters-${mountTimestamp.current}-${Math.random()
      .toString(36)
      .substr(2, 9)}`,
  );

  // 🚨 Render monitoring
  const now_render = Date.now();
  if (now_render - lastRenderTimeRef.current > 10000) {
    renderCountRef.current = 0;
    lastRenderTimeRef.current = now_render;
  }

  renderCountRef.current++;

  if (renderCountRef.current > 15) {
    logger.error({
      message: '[Filters] 🚨 Render limit exceeded! Possible infinite loop',
      data: {
        renderCount: renderCountRef.current,
        configLength: config?.length,
        queryKeys: Object.keys(query || {}),
      },
      source: 'Filters',
      component: 'RenderMonitor',
    });
  }

  if (renderCountRef.current === 10) {
    logger.warn({
      message: '[Filters] ⚠️ Frequent render warning',
      data: {
        renderCount: renderCountRef.current,
      },
      source: 'Filters',
      component: 'RenderMonitor',
    });
  }

  // 🚀 New: Component mount logging
  useEffect(() => {
    filterLogger.info({
      component: 'Filters',
      message: '🎬 Component mounted',
      data: {
        componentId: componentId.current,
        mountTime: new Date(mountTimestamp.current).toISOString(),
        initialConfigLength: config.length,
        initialQuery: query,
        configFields: config.map((c: any) => ({
          field: c.field,
          type: c.type,
          label: c.label || c.componentProps?.addBefore || c.addBefore,
          placeholder: c.componentProps?.placeholder || c.placeholder,
        })),
      },
    });

    return () => {
      filterLogger.info({
        component: 'Filters',
        message: '🔚 Component unmounted',
        data: {
          componentId: componentId.current,
          lifetime: Date.now() - mountTimestamp.current,
          finalConfigLength: config.length,
        },
      });
    };
  }, []);

  useEffect(() => {
    renderCountRef.current++;
    // Only log first few renders to avoid log explosion
    if (renderCountRef.current <= 5 || renderCountRef.current % 10 === 0) {
      filterLogger.info({
        component: 'Filters',
        message: '🔄 Component rendered',
        data: {
          componentId: componentId.current,
          configLength: config.length,
          hasQuery: Object.keys(query).length > 0,
          renderCount: renderCountRef.current,
          configFields: config.map((c: any) => ({
            field: c.field,
            type: c.type,
            label: c.label || c.componentProps?.addBefore || c.addBefore,
            placeholder: c.componentProps?.placeholder || c.placeholder,
          })),
          query,
        },
      });
    }
  }, [config, query]);

  // 🚀 New: Listen to config changes
  useEffect(() => {
    filterLogger.info({
      component: 'Filters',
      message: '📋 Config changed',
      data: {
        componentId: componentId.current,
        oldLength: renderCountRef.current > 1 ? 'See previous log' : 0,
        newLength: config.length,
        newFields: config.map((c: any) => ({
          field: c.field,
          type: c.type,
          label: c.label || c.componentProps?.addBefore || c.addBefore,
          placeholder: c.componentProps?.placeholder || c.placeholder,
          optionsLength: c.componentProps?.options?.length || 0,
          hasOptions: Boolean(c.componentProps?.options),
        })),
        timestamp: new Date().toISOString(),
      },
    });
  }, [config]);

  // 🚀 New: Listen to query changes
  useEffect(() => {
    filterLogger.info({
      component: 'Filters',
      message: '🔍 Query changed',
      data: {
        componentId: componentId.current,
        query,
        queryKeys: Object.keys(query),
        timestamp: new Date().toISOString(),
      },
    });
  }, [query]);

  // Record plugin system initialization (only once)
  const pluginInitializedRef = useRef(false);
  useEffect(() => {
    if (!pluginInitializedRef.current) {
      filterLogger.info({
        component: 'Filters',
        message: 'Plugin system initialized',
        data: pluginSystemStats,
      });
      pluginInitializedRef.current = true;
    }
  }, [pluginSystemStats]);

  // Manage form state
  const { form } = useFilterForm(query);

  // Get final style configuration
  const finalStyle = useFilterStyle(filterStyle);

  // Create plugin context
  const pluginContext = usePluginContext(form, filterStyle);

  // Get field renderer
  const renderFieldItem = useFieldRenderer(pluginContext);

  // Process filter configuration - use stable config
  const { hasFields, hasVisibleFields } = useFilterConfig(stableConfig);

  // Process reset functionality - use stable config
  const { handleReset, canReset } = useFilterReset(
    resetFilterValues,
    stableConfig,
  );

  // Use useMemo to cache actions area, avoid creating new object on every render - must be before conditional return
  const actionsArea = useMemo(
    () => (
      <ActionsArea
        wrapperClassName={wrapperClassName}
        showReset={showReset}
        canReset={canReset}
        onReset={handleReset}
        customActions={customActions}
        customActionsStyle={customActionsStyle}
      />
    ),
    [
      wrapperClassName,
      showReset,
      canReset,
      handleReset,
      customActions,
      customActionsStyle,
    ],
  );

  // If no field configuration, don't render component (consistent with old code)
  if (!hasFields) {
    return null;
  }

  return (
    <FilterContainer className={className} filterStyle={finalStyle}>
      <FieldsArea
        config={stableConfig}
        renderFieldItem={renderFieldItem}
        actionsArea={actionsArea}
      />

      <RightActionsArea actions={actions} />
    </FilterContainer>
  );
};

/**
 * 🔧 Use React.memo to optimize Filters component re-rendering
 *
 * 🎯 Key optimization: Ignore onChange and other functions when comparing config (they are new every time)
 */
export const Filters = React.memo(FiltersInner, (prevProps, nextProps) => {
  // 🔧 Compare config: only compare structure and data, ignore functions
  const compareConfig = (
    prev: any[] | undefined,
    next: any[] | undefined,
  ): boolean => {
    if (prev === next) {
      return true;
    }
    if (!prev || !next || prev.length !== next.length) {
      return false;
    }

    for (let i = 0; i < prev.length; i++) {
      // Compare field definitions
      if (prev[i].type !== next[i].type) {
        return false;
      }
      if (prev[i].field !== next[i].field) {
        return false;
      }

      // Compare componentProps, skip functions
      const prevComp = prev[i].componentProps || {};
      const nextComp = next[i].componentProps || {};

      for (const key of Object.keys(prevComp)) {
        if (typeof prevComp[key] === 'function') {
          continue;
        } // Skip functions
        if (JSON.stringify(prevComp[key]) !== JSON.stringify(nextComp[key])) {
          return false;
        }
      }
    }
    return true;
  };

  // Compare config
  if (!compareConfig(prevProps.config, nextProps.config)) {
    logger.info({
      message: '[Filters] 🔄 Config changed, need to re-render',
      data: {
        prevLength: prevProps.config?.length,
        nextLength: nextProps.config?.length,
      },
      source: 'Filters',
      component: 'ReactMemo',
    });
    return false;
  }

  // Compare query object
  if (JSON.stringify(prevProps.query) !== JSON.stringify(nextProps.query)) {
    logger.info({
      message: '[Filters] 🔄 Query changed, need to re-render',
      data: { prevQuery: prevProps.query, nextQuery: nextProps.query },
      source: 'Filters',
      component: 'ReactMemo',
    });
    return false;
  }

  // Compare other key props
  const keysToCompare: (keyof FiltersComponentProps)[] = [
    'className',
    'wrapperClassName',
    'showReset',
  ];

  for (const key of keysToCompare) {
    if (prevProps[key] !== nextProps[key]) {
      logger.info({
        message: `[Filters] 🔄 ${String(key)} changed, need to re-render`,
        data: { prevValue: prevProps[key], nextValue: nextProps[key] },
        source: 'Filters',
        component: 'ReactMemo',
      });
      return false;
    }
  }

  logger.debug({
    message: '[Filters] ⏭️ Props unchanged, skip rendering',
    data: {},
    source: 'Filters',
    component: 'ReactMemo',
  });
  return true; // Props are the same, don't re-render
});

// Default export
export default Filters;
