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
 * Enhanced row callback props type definition
 * Extended based on Arco Design Table RowCallbackProps
 */

import type { ReactNode } from 'react';
import type { BaseRecord } from '../core/common';

/**
 * Original row callback props (based on Arco Design Table)
 */
export interface RowCallbackProps {
  onClick?: (event: React.MouseEvent) => void;
  onDoubleClick?: (event: React.MouseEvent) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
  onHandleSave?: (row: BaseRecord) => void;
  [name: string]: unknown;
}

/**
 * Enhanced row callback props
 * Provides richer row interaction capabilities
 */
export interface EnhancedRowCallbackProps<
  RecordType extends BaseRecord = BaseRecord,
> extends RowCallbackProps {
  /** Row data */
  record?: RecordType;
  /** Row index */
  index?: number;
  /** Whether selected */
  selected?: boolean;
  /** Whether expanded */
  expanded?: boolean;
  /** Row state */
  rowState?: {
    loading?: boolean;
    error?: boolean;
    disabled?: boolean;
    highlighted?: boolean;
  };

  // === Extended event callbacks ===
  /** Row focus callback */
  onFocus?: (
    event: React.FocusEvent,
    record: RecordType,
    index: number,
  ) => void;
  /** Row blur callback */
  onBlur?: (event: React.FocusEvent, record: RecordType, index: number) => void;
  /** Row keyboard event callback */
  onKeyDown?: (
    event: React.KeyboardEvent,
    record: RecordType,
    index: number,
  ) => void;
  /** Row drag start callback */
  onDragStart?: (
    event: React.DragEvent,
    record: RecordType,
    index: number,
  ) => void;
  /** Row drag end callback */
  onDragEnd?: (
    event: React.DragEvent,
    record: RecordType,
    index: number,
  ) => void;
  /** Row drop callback */
  onDrop?: (event: React.DragEvent, record: RecordType, index: number) => void;

  // === Business extended callbacks ===
  /** Row edit save callback */
  onSave?: (
    record: RecordType,
    changes: Partial<RecordType>,
  ) => Promise<boolean>;
  /** Row edit cancel callback */
  onCancel?: (record: RecordType) => void;
  /** Row delete callback */
  onDelete?: (record: RecordType, index: number) => Promise<boolean>;
  /** Row copy callback */
  onCopy?: (record: RecordType, index: number) => void;
  /** Row details view callback */
  onViewDetails?: (record: RecordType, index: number) => void;

  // === Style and rendering related ===
  /** Custom row class name */
  className?: string | ((record: RecordType, index: number) => string);
  /** Custom row style */
  style?:
    | React.CSSProperties
    | ((record: RecordType, index: number) => React.CSSProperties);
  /** Row tooltip information */
  title?: string | ((record: RecordType, index: number) => string);
  /** Row icon */
  icon?: ReactNode | ((record: RecordType, index: number) => ReactNode);
}

/**
 * Row callback configuration
 */
export interface RowCallbackConfig<RecordType extends BaseRecord = BaseRecord> {
  /** Whether to enable row callback enhancement */
  enabled?: boolean;
  /** Default row callback properties */
  defaultProps?: Partial<EnhancedRowCallbackProps<RecordType>>;
  /** Row callback generation function */
  getRowProps?: (
    record: RecordType,
    index: number,
  ) => EnhancedRowCallbackProps<RecordType>;
  /** Global row event handlers */
  globalHandlers?: {
    onClick?: (record: RecordType, index: number) => void;
    onDoubleClick?: (record: RecordType, index: number) => void;
    onContextMenu?: (record: RecordType, index: number) => void;
  };
}

/**
 * Row callback utility function types
 */
export interface RowCallbackHelpers<
  RecordType extends BaseRecord = BaseRecord,
> {
  /** Merge row callback properties */
  mergeRowProps: (
    defaultProps: Partial<EnhancedRowCallbackProps<RecordType>>,
    customProps: Partial<EnhancedRowCallbackProps<RecordType>>,
  ) => EnhancedRowCallbackProps<RecordType>;

  /** Create row event handler */
  createRowHandler: <EventType extends React.SyntheticEvent>(
    handler: (event: EventType, record: RecordType, index: number) => void,
  ) => (event: EventType) => void;

  /** Bind row data to event */
  bindRowData: (
    record: RecordType,
    index: number,
    props: Partial<EnhancedRowCallbackProps<RecordType>>,
  ) => EnhancedRowCallbackProps<RecordType>;
}
