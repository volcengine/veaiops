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
 * CellRender component type definitions
 * @description Type definitions for cell rendering components
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Base cell rendering property interface
 * @description Defines properties for base cell rendering components
 */
export interface BaseCellRenderProps {
  /** Cell content */
  children?: ReactNode;
  /** Custom style class name */
  className?: string;
  /** Custom style */
  style?: CSSProperties;
  /** Whether clickable */
  clickable?: boolean;
  /** Click callback */
  onClick?: () => void;
}

/**
 * Ellipsis cell rendering property interface
 * @description Defines properties for ellipsis cell rendering components
 */
export interface EllipsisProps extends BaseCellRenderProps {
  /** Display text */
  text: string;
  /** Maximum length */
  maxLength?: number;
  /** Ellipsis symbol */
  ellipsis?: string;
  /** Whether to show tooltip */
  showTooltip?: boolean;
  /** Tooltip content */
  tooltipContent?: string;
}

/**
 * Employee cell rendering property interface
 * @description Defines properties for employee cell rendering components
 */
export interface EmployeeProps extends BaseCellRenderProps {
  /** Employee ID */
  employeeId: string;
  /** Employee name */
  name?: string;
  /** Employee avatar */
  avatar?: string;
  /** Employee department */
  department?: string;
  /** Whether to show department */
  showDepartment?: boolean;
  /** Whether to show avatar */
  showAvatar?: boolean;
  /** Avatar size */
  avatarSize?: 'small' | 'medium' | 'large';
}

/**
 * Info with code cell rendering property interface
 * @description Defines properties for info with code cell rendering components
 */
export interface InfoWithCodeProps extends BaseCellRenderProps {
  /** Info title */
  title: string;
  /** Info code */
  code?: string;
  /** Info description */
  description?: string;
  /** Whether to show code */
  showCode?: boolean;
  /** Code style */
  codeStyle?: CSSProperties;
  /** Title style */
  titleStyle?: CSSProperties;
  /** Description style */
  descriptionStyle?: CSSProperties;
}

/**
 * Timestamp cell rendering property interface
 * @description Defines properties for timestamp cell rendering components
 */
export interface StampTimeProps extends BaseCellRenderProps {
  /** Time value */
  time: string | number | Date;
  /** Time format */
  format?: string;
  /** Whether to show relative time */
  showRelative?: boolean;
  /** Relative time threshold (milliseconds) */
  relativeThreshold?: number;
  /** Timezone */
  timezone?: string;
  /** Whether to show timezone */
  showTimezone?: boolean;
}
