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

import { CellRender } from '@/cell-render';
import {} from '@arco-design/web-react';
import React, { Fragment, type ReactNode } from 'react';
import { type FilterPluginContext, filterPluginRegistry } from '../plugins';
import { filterLogger } from '../utils/logger';
import { ERROR_MESSAGES, commonClassName } from './constants';
import type { FieldItem } from './types';
import { hijackComponentProps, processLabelAsComponentProp } from './utils';

// Destructure CellRender component to avoid repeated calls
const { CustomOutlineTag } = CellRender;

/**
 * Render field component using plugin system
 * @param field - Field configuration
 * @param context - Plugin context
 * @returns - Rendered React node
 */
export const renderField = (
  field: FieldItem,
  context?: FilterPluginContext,
): ReactNode => {
  const { type } = field;

  // ✅ Step 1: Process label to addBefore/prefix conversion
  const processedComponentProps = processLabelAsComponentProp(field);

  // Add detailed logging
  if (process.env.NODE_ENV === 'development') {
    const isSelectType = type === 'select' || type === 'Select';
    const hasOptions =
      processedComponentProps && 'options' in processedComponentProps;
    const options = hasOptions ? processedComponentProps.options : undefined;

    console.info('[Filters/renderField] Rendering field', {
      type,
      field: field.field,
      label: field.label,
      labelAs: field.labelAs,
      hasComponentProps: Boolean(processedComponentProps),
      componentPropsKeys: processedComponentProps
        ? Object.keys(processedComponentProps)
        : [],
      // 🔧 Specifically track label conversion result
      addBefore: processedComponentProps?.addBefore,
      prefix: processedComponentProps?.prefix,
      addAfter: processedComponentProps?.addAfter,
      suffix: processedComponentProps?.suffix,
      // 🔧 Specifically track Select component options
      isSelectType,
      hasOptions,
      optionsLength: Array.isArray(options) ? options.length : 0,
      optionsReference: options,
      optionsHash: options
        ? JSON.stringify(options).substring(0, 150)
        : undefined,
      timestamp: Date.now(),
    });
  }

  // Validate field type
  if (!type) {
    console.error('[Filters/renderField] Field type missing', { field });
    return (
      <CustomOutlineTag>{ERROR_MESSAGES.FIELD_TYPE_REQUIRED}</CustomOutlineTag>
    );
  }

  // ✅ Step 2: Hijack component props (after label conversion)
  const hijackedProps = hijackComponentProps(processedComponentProps);

  // Parse namespaced type (e.g., Select.Account)
  const [mainType, subType] = type.split('.');
  const pluginType = subType ? mainType : type;

  // Try to get plugin from plugin registry
  const plugin = filterPluginRegistry.get(pluginType);

  if (!plugin) {
    console.error('[Filters/renderField] Plugin not found', {
      pluginType,
      type,
      field: field.field,
      availablePlugins: Array.from(filterPluginRegistry.getAll().keys()),
    });

    // Use Unsupported plugin as fallback
    const fallbackPlugin = filterPluginRegistry.get('Unsupported');
    if (fallbackPlugin) {
      const safeComponentProps = processedComponentProps || {};
      return fallbackPlugin.render({
        field,
        componentProps: safeComponentProps,
        hijackedProps,
        context,
      });
    }

    return (
      <CustomOutlineTag>{ERROR_MESSAGES.PLUGIN_NOT_FOUND}</CustomOutlineTag>
    );
  }

  if (process.env.NODE_ENV === 'development') {
    console.info('[Filters/renderField] Plugin found', {
      pluginType,
      pluginName: plugin.name,
      pluginVersion: plugin.version,
    });
  }

  try {
    // ✅ Use processed componentProps (includes label conversion)
    const safeComponentProps = processedComponentProps || {};

    // Validate plugin configuration
    if (plugin.validateConfig && !plugin.validateConfig(safeComponentProps)) {
      return (
        <CustomOutlineTag>{ERROR_MESSAGES.INVALID_CONFIG}</CustomOutlineTag>
      );
    }

    // Render plugin component
    return plugin.render({
      field,
      componentProps: safeComponentProps,
      hijackedProps: { ...hijackedProps, subType },
      context,
    });
  } catch (error) {
    // ✅ Correct: Log error with actual error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    filterLogger.error({
      component: 'renderField',
      message: `Field rendering failed: ${errorMessage}`,
      data: {
        field: field.field,
        fieldType: field.type,
        pluginType,
        error: errorMessage,
        errorStack: error instanceof Error ? error.stack : undefined,
      },
    });
    return <CustomOutlineTag>{ERROR_MESSAGES.RENDER_FAILED}</CustomOutlineTag>;
  }
};

/**
 * Render action buttons list
 * @param actions - Action buttons array
 * @returns - Rendered action buttons container
 */
export const renderActions = (actions: ReactNode[] = []): ReactNode => (
  <div className={commonClassName}>
    {actions.map((actionDom, index) => (
      <Fragment key={`filter-${index}`}>{actionDom}</Fragment>
    ))}
  </div>
);

/**
 * Render single field (includes visibility check)
 * @param field - Field configuration
 * @param context - Plugin context
 * @param key - Field key
 * @returns - Rendered field node or null
 */
export const renderSingleField = (
  field: FieldItem,
  context?: FilterPluginContext,
  key?: string,
): ReactNode => {
  // Check field visibility
  if (field.visible === false) {
    return null;
  }

  return (
    <Fragment key={key || field.field}>{renderField(field, context)}</Fragment>
  );
};

/**
 * Render field list
 * @param fields - Field configuration list
 * @param context - Plugin context
 * @returns - Rendered field list
 */
export const renderFieldList = (
  fields: FieldItem[],
  context?: FilterPluginContext,
): ReactNode[] => {
  return fields
    .map((field, index) =>
      renderSingleField(field, context, field.field || `field-${index}`),
    )
    .filter(Boolean);
};

/**
 * Render error boundary component
 * @param error - Error message
 * @param componentType - Component type
 * @returns - Error display component
 */
export const renderErrorBoundary = (
  error: string,
  componentType?: string,
): ReactNode => {
  const message = componentType ? `${componentType}: ${error}` : error;
  return <CustomOutlineTag>{message}</CustomOutlineTag>;
};

/**
 * Render warning component
 * @param warning - Warning message
 * @param componentType - Component type
 * @returns - Warning display component
 */
export const renderWarning = (
  warning: string,
  componentType?: string,
): ReactNode => {
  const message = componentType ? `${componentType}: ${warning}` : warning;
  return <CustomOutlineTag>{message}</CustomOutlineTag>;
};
