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

import type {
  PluginConfig,
  FieldItem as PluginFieldItem,
} from '@veaiops/types';
/**
 * Filter Core Type Definitions
 */
import type { CSSProperties, ReactNode } from 'react';

/**
 * Filter Component Props Interface
 */
export interface FiltersComponentProps {
  /** Custom class name */
  className?: string;
  /** Wrapper class name */
  wrapperClassName?: string;
  /** Filter style configuration */
  filterStyle?: FilterStyle;
  /** Field configuration list */
  config?: FieldItem[];
  /** Action buttons list */
  actions?: ReactNode[];
  /** Custom action buttons */
  customActions?: ReactNode[] | ReactNode;
  /** Custom action buttons style */
  customActionsStyle?: CSSProperties;
  /** Reset filter values callback */
  resetFilterValues?: (props: { resetEmptyData?: boolean }) => void;
  /** Query object */
  query: Record<string, unknown>;
  /** Whether to show reset button */
  showReset?: boolean;
}

/**
 * Filter Style Configuration
 */
export interface FilterStyle {
  /** Whether to show background and border */
  isWithBackgroundAndBorder: boolean;
  /** Custom style */
  style?: CSSProperties;
}

/**
 * Field Item Configuration (extends plugin field item)
 */
export interface FieldItem extends PluginFieldItem {
  /** Plugin-specific configuration */
  pluginConfig?: PluginConfig;
  /** Preset configuration */
  preset?: string;
  /**
   * Label conversion target property
   * Specifies which component property the label field should be converted to (addBefore/addAfter/prefix/suffix)
   * If not specified, automatically selects based on component type (Select uses addBefore, Input uses prefix)
   */
  labelAs?: 'addBefore' | 'addAfter' | 'prefix' | 'suffix';
}

/**
 * Fixed filter control class name configuration
 */
export interface FixFilterControlCls {
  className: string;
}

/**
 * Reset filter parameters
 */
export interface ResetFilterParams {
  resetEmptyData?: boolean;
}

// Re-export plugin system types
export * from '../plugins';
