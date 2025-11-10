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

import type { ColumnProps } from '@arco-design/web-react/es/Table/interface';
/**
 * Column freeze plugin type definitions
 * Based on Arco Table sticky capability and EPS platform freeze functionality
 */
import type { ReactNode } from 'react';

/**
 * Freeze position
 */
export type FreezePosition = 'left' | 'right';

/**
 * Freeze column configuration
 */
export interface FreezeColumnConfig {
  /** Column's dataIndex */
  dataIndex: string;
  /** Freeze position */
  position: FreezePosition;
  /** Freeze priority, smaller numbers are closer to edge */
  priority?: number;
}

/**
 * Freeze style configuration
 */
export interface FreezeStyleConfig {
  /** Frozen column background color */
  backgroundColor?: string;
  /** Frozen column shadow */
  boxShadow?: string;
  /** Frozen column z-index */
  zIndex?: number;
  /** Custom freeze style class name */
  freezeClassName?: string;
}

/**
 * Column freeze configuration
 */
export interface ColumnFreezeConfig {
  /** Whether to enable plugin */
  enabled?: boolean;
  /** Plugin priority */
  priority?: number;
  /** Default frozen columns */
  defaultFrozenColumns?: FreezeColumnConfig[];
  /** Whether to allow user to dynamically freeze */
  allowUserFreeze?: boolean;
  /** Freeze style configuration */
  styleConfig?: FreezeStyleConfig;
  /** Maximum frozen column count */
  maxFrozenColumns?: {
    left?: number;
    right?: number;
  };
  /** Freeze change callback */
  onFreezeChange?: (frozenColumns: FreezeColumnConfig[]) => void;
  /** Custom freeze action render */
  renderFreezeAction?: <RecordType = Record<string, unknown>>(
    column: ColumnProps<RecordType>,
    isFrozen: boolean,
  ) => ReactNode;
}

/**
 * Plugin state
 */
export interface ColumnFreezeState {
  /** Left frozen columns */
  leftFrozenColumns: FreezeColumnConfig[];
  /** Right frozen columns */
  rightFrozenColumns: FreezeColumnConfig[];
  /** All frozen columns */
  allFrozenColumns: FreezeColumnConfig[];
  /** Frozen column offsets */
  frozenOffsets: {
    left: Record<string, number>;
    right: Record<string, number>;
  };
}
