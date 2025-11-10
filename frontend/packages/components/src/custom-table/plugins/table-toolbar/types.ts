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
 * Table toolbar plugin type definition
 * Provides common table operation toolbar
 */
import type { ReactNode } from 'react';

/**
 * Toolbar position
 */
export type ToolbarPosition = 'top' | 'bottom' | 'both';

/**
 * Toolbar alignment
 */
export type ToolbarAlign = 'left' | 'center' | 'right' | 'space-between';

/**
 * Toolbar button configuration
 */
export interface ToolbarButtonConfig {
  /** Button unique identifier */
  key: string;
  /** Button title */
  title: string;
  /** Button icon */
  icon?: ReactNode;
  /** Button type */
  type?: 'primary' | 'secondary' | 'dashed' | 'text' | 'outline';
  /** Whether danger button */
  danger?: boolean;
  /** Whether disabled */
  disabled?: boolean | (() => boolean);
  /** Whether visible */
  visible?: boolean | (() => boolean);
  /** Button click event */
  onClick: () => void | Promise<void>;
  /** Custom render */
  render?: () => ReactNode;
}

/**
 * Search box configuration
 */
export interface SearchConfig {
  /** Whether to show search box */
  show?: boolean;
  /** Search box placeholder */
  placeholder?: string;
  /** Whether to allow clear */
  allowClear?: boolean;
  /** Search callback */
  onSearch?: (value: string) => void;
  /** Search box style */
  style?: React.CSSProperties;
  /** Search box width */
  width?: number | string;
}

/**
 * Refresh button configuration
 */
export interface RefreshConfig {
  /** Whether to show refresh button */
  show?: boolean;
  /** Refresh button title */
  title?: string;
  /** Refresh callback */
  onRefresh?: () => void | Promise<void>;
  /** Whether to show loading state */
  showLoading?: boolean;
}

/**
 * Density setting configuration
 */
export interface DensityConfig {
  /** Whether to show density setting */
  show?: boolean;
  /** Default density */
  defaultDensity?: 'default' | 'middle' | 'small';
  /** Density change callback */
  onDensityChange?: (density: 'default' | 'middle' | 'small') => void;
}

/**
 * Table toolbar configuration
 */
export interface TableToolbarConfig {
  /** Whether plugin is enabled */
  enabled?: boolean;
  /** Plugin priority level */
  priority?: number;
  /** Toolbar position */
  position?: ToolbarPosition;
  /** Toolbar alignment */
  align?: ToolbarAlign;
  /** Left button configuration */
  leftButtons?: ToolbarButtonConfig[];
  /** Right button configuration */
  rightButtons?: ToolbarButtonConfig[];
  /** Search configuration */
  search?: SearchConfig;
  /** Refresh configuration */
  refresh?: RefreshConfig;
  /** Density setting configuration */
  density?: DensityConfig;
  /** Toolbar style */
  style?: React.CSSProperties;
  /** Toolbar class name */
  className?: string;
  /** Custom toolbar render */
  render?: () => ReactNode;
}

/**
 * Plugin state
 */
export interface TableToolbarState {
  /** Current density setting */
  currentDensity: 'default' | 'middle' | 'small';
  /** Search value */
  searchValue: string;
  /** Whether currently refreshing */
  isRefreshing: boolean;
  /** Whether toolbar is visible */
  isVisible: boolean;
}
