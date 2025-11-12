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

// 解构CellRender组件，避免重复调用
const { CustomOutlineTag } = CellRender;

/**
 * 使用插件系统渲染字段组件
 * @param field 字段配置
 * @param context 插件上下文
 * @returns 渲染的React节点
 */
export const renderField = (
  field: FieldItem,
  context?: FilterPluginContext,
): ReactNode => {
  const { type } = field;

  // ✅ 步骤 1: 处理 label 到 addBefore/prefix 的转换
  const processedComponentProps = processLabelAsComponentProp(field);

  // ✅ Silent mode: Remove console output, logs are collected via filterLogger

  // 验证字段类型
  if (!type) {
    // ✅ Silent mode: Field type missing (error collected via filterLogger)
    return (
      <CustomOutlineTag>{ERROR_MESSAGES.FIELD_TYPE_REQUIRED}</CustomOutlineTag>
    );
  }

  // ✅ 步骤 2: 劫持组件属性（在 label 转换之后）
  const hijackedProps = hijackComponentProps(processedComponentProps);

  // 解析命名空间类型（如 Select.Account）
  const [mainType, subType] = type.split('.');
  const pluginType = subType ? mainType : type;

  // 尝试从插件注册器获取插件
  const plugin = filterPluginRegistry.get(pluginType);

  if (!plugin) {
    // ✅ Silent mode: Plugin not found (error collected via filterLogger)

    // 使用 Unsupported 插件作为 fallback
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

  // ✅ Silent mode: Remove console output, logs are collected via filterLogger

  try {
    // ✅ 使用处理后的 componentProps（已包含 label 转换）
    const safeComponentProps = processedComponentProps || {};

    // 验证插件配置
    if (plugin.validateConfig && !plugin.validateConfig(safeComponentProps)) {
      return (
        <CustomOutlineTag>{ERROR_MESSAGES.INVALID_CONFIG}</CustomOutlineTag>
      );
    }

    // 渲染插件组件
    return plugin.render({
      field,
      componentProps: safeComponentProps,
      hijackedProps: { ...hijackedProps, subType },
      context,
    });
  } catch (error) {
    // ✅ 正确：记录错误日志，透出实际错误信息
    const errorMessage = error instanceof Error ? error.message : String(error);
    filterLogger.error({
      component: 'renderField',
      message: `字段渲染失败: ${errorMessage}`,
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
 * 渲染操作按钮列表
 * @param actions 操作按钮数组
 * @returns 渲染的操作按钮容器
 */
export const renderActions = (actions: ReactNode[] = []): ReactNode => (
  <div className={commonClassName}>
    {actions.map((actionDom, index) => (
      <Fragment key={`filter-${index}`}>{actionDom}</Fragment>
    ))}
  </div>
);

/**
 * 渲染单个字段（包含可见性检查）
 * @param field 字段配置
 * @param context 插件上下文
 * @param key 字段键
 * @returns 渲染的字段节点或null
 */
export const renderSingleField = (
  field: FieldItem,
  context?: FilterPluginContext,
  key?: string,
): ReactNode => {
  // 检查字段可见性
  if (field.visible === false) {
    return null;
  }

  return (
    <Fragment key={key || field.field}>{renderField(field, context)}</Fragment>
  );
};

/**
 * 渲染字段列表
 * @param fields 字段配置列表
 * @param context 插件上下文
 * @returns 渲染的字段列表
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
 * 渲染错误边界组件
 * @param error 错误信息
 * @param componentType 组件类型
 * @returns 错误显示组件
 */
export const renderErrorBoundary = (
  error: string,
  componentType?: string,
): ReactNode => {
  const message = componentType ? `${componentType}: ${error}` : error;
  return <CustomOutlineTag>{message}</CustomOutlineTag>;
};

/**
 * 渲染警告组件
 * @param warning 警告信息
 * @param componentType 组件类型
 * @returns 警告显示组件
 */
export const renderWarning = (
  warning: string,
  componentType?: string,
): ReactNode => {
  const message = componentType ? `${componentType}: ${warning}` : warning;
  return <CustomOutlineTag>{message}</CustomOutlineTag>;
};
