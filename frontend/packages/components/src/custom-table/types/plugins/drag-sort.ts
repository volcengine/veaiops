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
 * Drag and drop sort plugin type definition
 * Based on EPS platform's react-sortable-hoc capability
 */
import type { ReactNode } from 'react';
import type { SortEndHandler } from 'react-sortable-hoc';
import type { PluginPriorityEnum } from '../core/enums';

/**
 * Drag type
 */
export type DragType = 'row' | 'column' | 'both';

/**
 * Drag constraints configuration
 */
export interface DragConstraints {
  /** Draggable row range */
  rowRange?: [number, number];
  /** Draggable column range */
  columnRange?: [number, number];
  /** Disabled row indices */
  disabledRows?: number[];
  /** Disabled column indices */
  disabledColumns?: number[];
  /** Custom drag check function */
  canDrag?: (index: number, type: 'row' | 'column') => boolean;
}

/**
 * Drag style configuration
 */
export interface DragStyleConfig {
  /** Style class name when dragging */
  draggingClassName?: string;
  /** Drag handle icon */
  handleIcon?: ReactNode;
  /** Whether to show drag handle */
  showHandle?: boolean;
  /** Drag preview style */
  previewStyle?: React.CSSProperties;
}

/**
 * Drag and drop sort configuration
 */
export interface DragSortConfig {
  /** Whether plugin is enabled */
  enabled?: boolean;
  /** Plugin priority level */
  priority?: PluginPriorityEnum;
  /** Drag type */
  dragType?: DragType;
  /** Drag constraints */
  constraints?: DragConstraints;
  /** Drag style configuration */
  styleConfig?: DragStyleConfig;
  /** Row drag end callback */
  onRowSortEnd?: SortEndHandler;
  /** Column drag end callback */
  onColumnSortEnd?: SortEndHandler;
  /** Drag start callback */
  onSortStart?: (sort: {
    node: Element;
    index: number;
    collection: string;
  }) => void;
  /** Whether to use virtual scroll */
  useVirtualScroll?: boolean;
}

/**
 * Plugin state
 */
export interface DragSortState {
  /** Whether currently dragging */
  isDragging: boolean;
  /** Current dragging index */
  draggingIndex: number;
  /** Drag type */
  draggingType: 'row' | 'column' | null;
  /** Row sort order */
  rowSortOrder: number[];
  /** Column sort order */
  columnSortOrder: number[];
}
