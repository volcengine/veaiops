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

import type { VirtualListHandle } from '@arco-design/web-react/es/_class/VirtualList';
/**
 * Virtual scroll plugin type definitions
 * Based on Arco Table VirtualList capability
 */
import type { RefObject } from 'react';

/**
 * Virtual scroll configuration
 */
export interface VirtualScrollConfig {
  /** Whether to enable plugin */
  enabled?: boolean;
  /** Plugin priority */
  priority?: number;
  /** Virtual scroll container height */
  height?: number | string;
  /** Height of each item */
  itemHeight?: number | ((index: number) => number);
  /** Buffer size */
  buffer?: number;
  /** Whether to enable horizontal virtual scroll */
  horizontal?: boolean;
  /** Threshold, virtual scroll is only enabled when exceeding this count */
  threshold?: number;
  /** Callback when scrolling to specified position */
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  /** Callback when scrolling to top */
  onScrollToTop?: () => void;
  /** Callback when scrolling to bottom */
  onScrollToBottom?: () => void;
}

/**
 * Virtual scroll methods
 */
export interface VirtualScrollMethods {
  /** Scroll to specified index */
  scrollToIndex: (index: number) => void;
  /** Scroll to specified position */
  scrollTo: (scrollTop: number) => void;
  /** Get current scroll offset */
  getScrollOffset: () => { scrollTop: number; scrollLeft: number };
  /** Refresh virtual list */
  refresh: () => void;
}

/**
 * Plugin state
 */
export interface VirtualScrollState {
  /** Whether virtual scroll is enabled */
  isVirtualEnabled: boolean;
  /** Virtual list reference */
  virtualListRef: RefObject<VirtualListHandle>;
  /** Visible range */
  visibleRange: {
    start: number;
    end: number;
  };
  /** Current scroll offset */
  scrollOffset: {
    top: number;
    left: number;
  };
  /** Total data count */
  totalCount: number;
  /** Visible data count */
  visibleCount: number;
}
