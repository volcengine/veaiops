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
 * Smart cell plugin type definition
 * Based on EPS platform's smart empty value handling capability
 */
import type { ReactNode } from 'react';
import type { BaseRecord } from '../core/common';
import type { PluginPriorityEnum } from '../core/enums';
import type { PluginBaseConfig } from './core';

/**
 * Empty value display strategy
 */
export type EmptyValueStrategy =
  | 'text'
  | 'placeholder'
  | 'button'
  | 'icon'
  | 'contextual'
  | 'hide';

/**
 * User role type
 */
export type UserRole = 'admin' | 'editor' | 'viewer' | 'owner';

/**
 * Empty value context information
 */
export interface EmptyValueContext {
  /** Field name */
  fieldName: string;
  /** Entity type */
  entityType?: string;
  /** User role */
  userRole?: UserRole;
  /** Whether has permission */
  hasPermission?: boolean;
  /** Whether required */
  isRequired?: boolean;
  /** Whether editable */
  canEdit?: boolean;
  /** Related data */
  relatedData?: BaseRecord;
  /** Custom context */
  [key: string]: unknown;
}

/**
 * Empty value processing configuration
 */
export interface EmptyValueConfig {
  /** Display strategy */
  strategy?: EmptyValueStrategy;
  /** Display text */
  text?: string;
  /** Icon */
  icon?: ReactNode;
  /** Custom component */
  component?: React.ComponentType<Record<string, unknown>>;
  /** Whether editing is allowed */
  allowEdit?: boolean;
  /** Whether to show tooltip */
  showTooltip?: boolean;
  /** Tooltip content */
  tooltip?: string;
  /** Permission configuration */
  permission?: {
    hint?: string;
    allowedRoles?: UserRole[];
  };
  /** Click event */
  onClick?: (params: Record<string, unknown>) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Interactive hint text */
  interactiveText?: string;
  /** Custom render function */
  customRender?: (context: EmptyValueContext) => ReactNode;
  /** Style configuration */
  style?: {
    className?: string;
    style?: React.CSSProperties;
    interactiveClassName?: string;
    placeholderClassName?: string;
  };
}

/**
 * Field permission configuration
 */
export interface FieldPermissionConfig {
  /** Field name */
  fieldName: string;
  /** Read-only field list */
  readonlyFields?: string[];
  /** Sensitive field list */
  sensitiveFields?: string[];
  /** Required field list */
  requiredFields?: string[];
  /** Permission check function */
  checkPermission?: (
    fieldName: string,
    record: BaseRecord,
    userRole?: UserRole,
  ) => boolean;
  /** Edit permission check function */
  canEdit?: (
    fieldName: string,
    record: BaseRecord,
    userRole?: UserRole,
  ) => boolean;
}

/**
 * Smart cell configuration
 */
export interface SmartCellConfig extends PluginBaseConfig {
  /** Default empty value configuration */
  defaultEmptyConfig?: EmptyValueConfig;
  /** Field-specific configuration */
  fieldConfigs?: Record<string, EmptyValueConfig>;
  /** Permission configuration */
  permissionConfig?: FieldPermissionConfig;
  /** Global context */
  globalContext?: Partial<EmptyValueContext>;
  /** User role */
  userRole?: UserRole;
  /** Whether to show permission hints */
  showPermissionHints?: boolean;
  /** Whether to enable contextual display */
  enableContextualDisplay?: boolean;
  /** Edit callback */
  onEdit?: (fieldName: string, record: BaseRecord) => Promise<boolean>;
  /** Empty value click callback */
  onEmptyClick?: (
    fieldName: string,
    record: BaseRecord,
    context: EmptyValueContext,
  ) => void;
  /** Empty value click callback (extended version) */
  onEmptyValueClick?: (params: Record<string, unknown>) => void;
  /** Cell render callback */
  onCellRender?: (
    params: CellRenderParams,
    fieldConfig: EmptyValueConfig,
    contextInfo: EmptyValueContext,
  ) => ReactNode | undefined;
}

/**
 * Cell render parameters
 */
export interface CellRenderParams<RecordType extends BaseRecord = BaseRecord> {
  /** Cell value */
  value: unknown;
  /** Row record */
  record: RecordType;
  /** Field name */
  field: string;
  /** Field name (alias) */
  fieldName?: string;
  /** Whether value is empty */
  isEmpty?: boolean;
  /** Column index */
  columnIndex?: number;
  /** Row index */
  rowIndex?: number;
  /** Context information */
  context?: EmptyValueContext;
  /** User role */
  userRole?: UserRole;
}

/**
 * Smart cell render function
 */
export type SmartCellRenderer<RecordType extends BaseRecord = BaseRecord> = (
  params: CellRenderParams<RecordType>,
) => ReactNode;

/**
 * Plugin state
 */
export interface SmartCellState {
  /** Empty value field set */
  emptyFields?: Set<string>;
  /** Field statistics */
  fieldStats?: Map<string, { total: number; empty: number }>;
  /** Total row count */
  totalRows?: number;
  /** User role */
  userRole?: UserRole;
  /** Current user role */
  currentUserRole: UserRole;
  /** Field permission mapping */
  fieldPermissions: Map<string, boolean>;
  /** Empty value statistics */
  emptyValueStats: {
    totalEmptyCount: number;
    fieldEmptyCounts: Record<string, number>;
    interactiveEmptyCount: number;
  };
}

/**
 * Plugin methods
 */
export interface SmartCellMethods<RecordType extends BaseRecord = BaseRecord> {
  /** Render smart cell */
  renderSmartCell: SmartCellRenderer<RecordType>;
  /** Check field permission */
  checkFieldPermission: (fieldName: string, record: RecordType) => boolean;
  /** Check edit permission */
  checkEditPermission: (fieldName: string, record: RecordType) => boolean;
  /** Get empty value configuration */
  getEmptyConfig: (fieldName: string) => EmptyValueConfig;
  /** Handle empty value click */
  handleEmptyClick: (fieldName: string, record: RecordType) => void;
  /** Update user role */
  updateUserRole: (role: UserRole) => void;
  /** Get empty value statistics */
  getEmptyStats: () => SmartCellState['emptyValueStats'];
}
