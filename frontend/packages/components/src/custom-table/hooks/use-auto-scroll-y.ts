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

import type { ScrollConfig } from '@/custom-table/types/core/common';
import { useMemo } from 'react';

/**
 * Auto-calculate scroll.y configuration
 */
export interface AutoScrollYConfig {
  /** Whether to enable auto-calculation, default true */
  enabled?: boolean;
  /** Fixed height offset (pixels), default 350 */
  offset?: number;
  /** Minimum height (pixels), prevents table from being too small, default 300 */
  minHeight?: number;
  /** Maximum height (pixels), prevents table from being too large, default undefined */
  maxHeight?: number;
}

/**
 * Calculate scroll.y using CSS calc() expression
 *
 * @description
 * Advantages of using CSS calc() expression:
 * 1. Native browser support, better performance
 * 2. Automatically responds to viewport changes, no resize listener needed
 * 3. Avoids additional reflow/repaint
 * 4. Supports CSS min/max/clamp functions for boundary constraints
 */
export const useAutoScrollYWithCalc = (
  config: AutoScrollYConfig = {},
  userScroll?: ScrollConfig,
): ScrollConfig => {
  const { offset = 350, enabled = true, minHeight = 300, maxHeight } = config;

  return useMemo<ScrollConfig>(() => {
    if (!enabled) {
      return userScroll || {};
    }

    const baseScroll: ScrollConfig = {
      x: userScroll?.x !== undefined ? userScroll.x : 'max-content',
    };

    // If user has set scroll.y, prioritize user configuration
    if (userScroll?.y !== undefined) {
      return {
        ...baseScroll,
        y: userScroll.y,
      };
    }

    // Build calc() expression
    let calcExpression = `calc(100vh - ${offset}px)`;

    // Use CSS math functions to implement boundary constraints
    if (minHeight !== undefined && maxHeight !== undefined) {
      // Both min and max constraints: clamp(min, preferred, max)
      calcExpression = `clamp(${minHeight}px, calc(100vh - ${offset}px), ${maxHeight}px)`;
    } else if (minHeight !== undefined) {
      // Only min constraint: max(min, preferred)
      calcExpression = `max(${minHeight}px, calc(100vh - ${offset}px))`;
    } else if (maxHeight !== undefined) {
      // Only max constraint: min(preferred, max)
      calcExpression = `min(calc(100vh - ${offset}px), ${maxHeight}px)`;
    }

    return {
      ...baseScroll,
      y: calcExpression,
    };
  }, [enabled, userScroll, offset, minHeight, maxHeight]);
};

/**
 * Simplified version: Directly return auto-calculated scroll configuration
 */
export const useAutoScrollY = useAutoScrollYWithCalc;
