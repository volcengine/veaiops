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
 * Table resize event type definitions
 * Supports column width adjustment and table container size change events
 */

import type { BaseRecord } from '../core/common';

/**
 * Resize event type
 */
export type ResizeEventType = 'column' | 'container' | 'viewport';

/**
 * Column resize event
 */
export interface ColumnResizeEvent {
  /** Event type */
  type: 'column';
  /** Column identifier */
  dataIndex: string;
  /** Width before adjustment */
  oldWidth: number;
  /** Width after adjustment */
  newWidth: number;
  /** Width change amount */
  deltaWidth: number;
  /** Trigger timestamp */
  timestamp: number;
  /** Whether manually adjusted by user */
  isManual: boolean;
  /** Adjustment reason */
  reason?: 'user_drag' | 'auto_fit' | 'responsive' | 'programmatic';
}

/**
 * Container resize event
 */
export interface ContainerResizeEvent {
  /** Event type */
  type: 'container';
  /** Size before adjustment */
  oldSize: {
    width: number;
    height: number;
  };
  /** Size after adjustment */
  newSize: {
    width: number;
    height: number;
  };
  /** Size change amount */
  deltaSize: {
    width: number;
    height: number;
  };
  /** Trigger timestamp */
  timestamp: number;
  /** Adjustment reason */
  reason?: 'window_resize' | 'layout_change' | 'container_change';
}

/**
 * Viewport resize event
 */
export interface ViewportResizeEvent {
  /** Event type */
  type: 'viewport';
  /** Viewport size before adjustment */
  oldViewport: {
    width: number;
    height: number;
  };
  /** Viewport size after adjustment */
  newViewport: {
    width: number;
    height: number;
  };
  /** Viewport change amount */
  deltaViewport: {
    width: number;
    height: number;
  };
  /** Trigger timestamp */
  timestamp: number;
  /** Screen orientation */
  orientation?: 'portrait' | 'landscape';
}

/**
 * Resize event union type
 */
export type ResizeEvent =
  | ColumnResizeEvent
  | ContainerResizeEvent
  | ViewportResizeEvent;

/**
 * Resize event listener
 */
export interface ResizeEventListener {
  /** Column resize listener */
  onColumnResize?: (event: ColumnResizeEvent) => void;
  /** Container resize listener */
  onContainerResize?: (event: ContainerResizeEvent) => void;
  /** Viewport resize listener */
  onViewportResize?: (event: ViewportResizeEvent) => void;
  /** Generic resize listener */
  onResize?: (event: ResizeEvent) => void;
}

/**
 * Resize configuration
 */
export interface ResizeConfig {
  /** Whether to enable resize detection */
  enabled?: boolean;
  /** Debounce delay (ms) */
  debounceDelay?: number;
  /** Whether to detect column resize */
  detectColumnResize?: boolean;
  /** Whether to detect container resize */
  detectContainerResize?: boolean;
  /** Whether to detect viewport resize */
  detectViewportResize?: boolean;
  /** Minimum change threshold */
  threshold?: {
    width?: number;
    height?: number;
  };
  /** Event listeners */
  listeners?: ResizeEventListener;
}

/**
 * Resize utility functions
 */
export interface ResizeHelpers {
  /** Create resize event */
  createResizeEvent: {
    column: (
      params: Omit<ColumnResizeEvent, 'type' | 'timestamp' | 'deltaWidth'>,
    ) => ColumnResizeEvent;
    container: (
      params: Omit<ContainerResizeEvent, 'type' | 'timestamp' | 'deltaSize'>,
    ) => ContainerResizeEvent;
    viewport: (
      params: Omit<ViewportResizeEvent, 'type' | 'timestamp' | 'deltaViewport'>,
    ) => ViewportResizeEvent;
  };

  /** Debounce resize handler */
  debounceResize: <T extends ResizeEvent>(
    handler: (event: T) => void,
    delay: number,
  ) => (event: T) => void;

  /** Detect size changes */
  detectSizeChange: (
    oldSize: { width: number; height: number },
    newSize: { width: number; height: number },
    threshold?: { width?: number; height?: number },
  ) => boolean;

  /** Calculate responsive breakpoint */
  getResponsiveBreakpoint: (
    width: number,
  ) => 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

  /** Get container size */
  getContainerSize: (element: HTMLElement) => { width: number; height: number };

  /** Get viewport size */
  getViewportSize: () => { width: number; height: number };
}

/**
 * Resize observer state
 */
export interface ResizeObserverState {
  /** Whether currently observing */
  isObserving: boolean;
  /** Element being observed */
  targetElement: HTMLElement | null;
  /** Current size */
  currentSize: {
    width: number;
    height: number;
  };
  /** Last resize time */
  lastResizeTime: number;
  /** Resize history */
  resizeHistory: ResizeEvent[];
}
