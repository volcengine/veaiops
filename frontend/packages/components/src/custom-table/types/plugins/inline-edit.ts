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
 * Inline edit plugin type definitions
 * Based on EPS platform's editable table capabilities and Arco Table type system
 */
import type { CSSProperties, ComponentType, Key, ReactNode } from 'react';
import type { BaseRecord } from '../core/common';
import type { PluginPriorityEnum } from '../core/enums';
import type { PluginBaseConfig } from './core';

/**
 * Editor type
 */
export type EditorType =
  | 'input'
  | 'textarea'
  | 'select'
  | 'date-picker'
  | 'number'
  | 'date'
  | 'switch'
  | 'custom';

/**
 * Edit trigger method
 */
export type EditTrigger = 'click' | 'doubleClick' | 'focus' | 'manual';

/**
 * Edit mode
 */
export type EditMode = 'cell' | 'row' | 'modal';

/**
 * Custom editor component props (based on Arco Table rendering mode)
 */
export interface CustomEditorProps<RecordType extends BaseRecord = BaseRecord> {
  /** Current value (from record[dataIndex]) */
  value: unknown;
  /** Value change callback */
  onChange: (value: unknown) => void;
  /** Finish edit callback */
  onFinish: () => void;
  /** Cancel edit callback */
  onCancel: () => void;
  /** Row data */
  record: RecordType;
  /** Field name */
  fieldName: string;
  /** Row index */
  rowIndex: number;
  /** Column index */
  columnIndex: number;
  /** Editor properties */
  editorProps?: Record<string, unknown>;
}

/**
 * Editor options
 */
export interface EditorOption {
  label: string;
  value: unknown;
  disabled?: boolean;
  [key: string]: unknown;
}

/**
 * Editor validation rules
 */
export interface EditorValidationRule<
  RecordType extends BaseRecord = BaseRecord,
> {
  required?: boolean;
  message?: string;
  validator?: (
    value: unknown,
    record: RecordType,
  ) => boolean | string | Promise<boolean | string>;
}

/**
 * Editor configuration
 */
export interface EditorConfig<RecordType extends BaseRecord = BaseRecord> {
  /** Editor type */
  type: EditorType;
  /** Custom editor component */
  component?: ComponentType<CustomEditorProps<RecordType>>;
  /** Editor properties */
  props?: Record<string, unknown>;
  /** Options data (for select type) */
  options?:
    | EditorOption[]
    | ((record: RecordType) => EditorOption[] | Promise<EditorOption[]>);
  /** Validation rules */
  rules?: EditorValidationRule<RecordType>[];
}

/**
 * Field edit configuration
 */
export interface FieldEditConfig<RecordType extends BaseRecord = BaseRecord> {
  /** Field name */
  fieldName: string;
  /** Data index */
  dataIndex: string;
  /** Whether editable */
  editable: boolean;
  /** Whether disabled */
  disabled?: boolean;
  /** Whether read-only */
  readOnly?: boolean;
  /** Editor configuration */
  editor: EditorConfig<RecordType>;
  /** Whether required */
  required?: boolean;
  /** Validation function */
  validate?: (
    value: unknown,
    record: RecordType,
  ) => Promise<string | null> | string | null;
  /** Custom render function */
  render?: (
    value: unknown,
    record: RecordType,
    editing: boolean,
    rowIndex: number,
  ) => ReactNode;
  /** Permission check function */
  canEdit?: (
    record: RecordType,
    fieldName: string,
  ) => boolean | Promise<boolean>;
  /** Value format function (used when displaying) */
  formatValue?: (value: unknown, record: RecordType) => unknown;
  /** Value parse function (used when saving) */
  parseValue?: (value: unknown, record: RecordType) => unknown;
  /** Style when editing */
  editingStyle?: CSSProperties;
  /** Class name when editing */
  editingClassName?: string;
  /** Whether to show edit icon */
  showEditIcon?: boolean;
  /** Confirm edit on Tab key */
  confirmOnTab?: boolean;
  /** Exit edit on blur */
  exitOnBlur?: boolean;
}

/**
 * Edit event callbacks
 */
export interface EditEventCallbacks<
  RecordType extends BaseRecord = BaseRecord,
> {
  /** Before starting edit */
  beforeEdit?: (
    record: RecordType,
    fieldName: string,
    rowIndex: number,
  ) => boolean | Promise<boolean>;
  /** After starting edit */
  afterEdit?: (record: RecordType, fieldName: string, rowIndex: number) => void;
  /** Validate before save */
  beforeSave?: (
    value: unknown,
    record: RecordType,
    fieldName: string,
    rowIndex: number,
  ) => boolean | Promise<boolean>;
  /** After save */
  afterSave?: (
    newValue: unknown,
    oldValue: unknown,
    record: RecordType,
    fieldName: string,
    rowIndex: number,
  ) => void;
  /** Cancel edit */
  onCancel?: (record: RecordType, fieldName: string, rowIndex: number) => void;
  /** Edit error */
  onError?: (
    error: Error,
    record: RecordType,
    fieldName: string,
    rowIndex: number,
  ) => void;
  /** When value changes */
  onChange?: (
    value: unknown,
    record: RecordType,
    fieldName: string,
    rowIndex: number,
  ) => void;
}

/**
 * Inline edit configuration
 */
export interface InlineEditConfig<RecordType extends BaseRecord = BaseRecord>
  extends PluginBaseConfig {
  /** Edit mode */
  mode?: EditMode;
  /** Edit trigger method */
  trigger?: EditTrigger;
  /** Field edit configuration */
  fields?: FieldEditConfig<RecordType>[];
  /** Whether supports batch edit */
  batchEdit?: boolean;
  /** Whether allows batch edit */
  allowBatchEdit?: boolean;
  /** Auto save delay (milliseconds) */
  autoSaveDelay?: number;
  /** Whether auto save */
  autoSave?: boolean;
  /** Whether to validate on value change */
  validateOnChange?: boolean;
  /** Before edit callback */
  onBeforeEdit?: (
    field: string,
    record: RecordType,
  ) => boolean | Promise<boolean>;
  /** After edit callback */
  onAfterEdit?: (field: string, value: unknown, record: RecordType) => void;
  /** Cancel edit callback */
  onEditCancel?: (field: string, record: RecordType) => void;
  /** Validation error callback */
  onValidationError?: (
    field: string,
    error: string,
    record: RecordType,
  ) => void;
  /** Save callback */
  onSave?: (field: string, value: unknown, record: RecordType) => Promise<void>;
  /** Edit event callbacks */
  callbacks?: EditEventCallbacks<RecordType>;
  /** Function to get row unique key */
  getRowKey?: (record: RecordType) => Key;
  /** Style configuration */
  style?: {
    editingClassName?: string;
    editingStyle?: CSSProperties;
    errorClassName?: string;
    errorStyle?: CSSProperties;
    cellEditingClassName?: string;
    rowEditingClassName?: string;
  };
}

/**
 * Editing cell information
 */
export interface EditingCellInfo<RecordType extends BaseRecord = BaseRecord> {
  rowKey: Key;
  field: string;
  fieldName: string;
  rowIndex: number;
  columnIndex: number;
  originalValue: unknown;
  currentValue: unknown;
  record: RecordType;
}

/**
 * Edit state
 */
export interface EditState<RecordType extends BaseRecord = BaseRecord> {
  /** Currently editing cells */
  editingCells: Map<string, EditingCellInfo<RecordType>>;
  /** Currently editing rows */
  editingRows: Set<Key>;
  /** Edit value cache key: rowKey_fieldName */
  editingValues: Map<string, unknown>;
  /** Edit error information key: rowKey_fieldName */
  editingErrors: Map<string, string>;
  /** Whether has unsaved changes */
  hasUnsavedChanges: boolean;
  /** Validation state */
  validationState: Map<string, boolean>;
  /** Original value cache (for rollback) */
  originalValues: Map<string, unknown>;
  /** Validation error information */
  validationErrors: Map<string, string>;
  /** Whether has changes */
  hasChanges: boolean;
  /** Whether has any editing state */
  isAnyEditing: boolean;
}

/**
 * Plugin method parameter types
 */
export interface StartEditParams {
  rowKey: Key;
  field: string;
}

export interface IsEditingParams {
  rowKey: Key;
  field?: string;
}

export interface GetEditingValueParams {
  rowKey: Key;
  field: string;
}

export interface SetEditingValueParams {
  rowKey: Key;
  field: string;
  value: unknown;
}

export interface GetEditingErrorsParams {
  rowKey?: Key;
  field?: string;
}

/**
 * Plugin methods
 */
export interface InlineEditMethods<RecordType extends BaseRecord = BaseRecord> {
  /** Start editing specified cell */
  startEdit: (params: StartEditParams) => Promise<void>;
  /** Finish editing specified cell */
  finishEdit: (value: unknown) => Promise<void>;
  /** Cancel editing specified cell */
  cancelEdit: () => void;
  /** Start editing entire row */
  startRowEdit: (rowKey: Key) => Promise<void>;
  /** Finish editing entire row */
  finishRowEdit: (rowKey: Key) => Promise<boolean>;
  /** Cancel editing entire row */
  cancelRowEdit: (rowKey: Key) => void;
  /** Save all edits */
  saveAll: () => Promise<boolean>;
  /** Cancel all edits */
  cancelAll: () => void;
  /** Validate edit content */
  validate: (params?: GetEditingErrorsParams) => Promise<boolean>;
  /** Get editing value */
  getEditingValue: (params: GetEditingValueParams) => unknown;
  /** Set editing value */
  setEditingValue: (params: SetEditingValueParams) => void;
  /** Check if cell is editing */
  isEditing: (params: IsEditingParams) => boolean;
  /** Get all editing data */
  getEditingData: () => Map<Key, Partial<RecordType>>;
  /** Get editing error information */
  getEditingErrors: (params?: GetEditingErrorsParams) => string[];
  /** Start batch edit */
  startBatchEdit: (rowKeys: Key[]) => Promise<void>;
  /** Get field edit configuration */
  getFieldEditConfig: (field: string) => FieldEditConfig<RecordType> | null;
}
