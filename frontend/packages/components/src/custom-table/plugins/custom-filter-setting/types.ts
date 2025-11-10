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

import type { PluginPriorityEnum } from '@/custom-table/types/core/enums';
import type { DrawerProps } from '@arco-design/web-react';
/**
 * Custom Filter Setting plugin type definitions
 */
import type { ReactNode } from 'react';

/**
 * Text display function type
 */
export type CaseSelectText = (key: string, utcOffset?: number) => string;

/**
 * CustomFilterSetting component props
 */
export interface CustomFilterSettingProps
  extends Omit<DrawerProps, 'visible' | 'onOk' | 'onCancel'> {
  /** Child component (trigger button) */
  children?: ReactNode;
  /** Fixed options */
  fixedOptions?: string[];
  /** All available options */
  allOptions?: string[];
  /** Selected options (excluding fixed ones) */
  selectedOptions?: string[];
  /** Hidden options */
  hiddenOptions?: string[];
  /** Configuration title */
  title?: string;
  /** Layout change callback */
  onChange?: (props: {
    fixed_fields: string[];
    hidden_fields?: string[];
  }) => void;
  /** Save callback */
  saveFun: (props: {
    fixed_fields: string[];
    selected_fields: string[];
    hidden_fields: string[];
  }) => void;
  /** Text display function */
  caseSelectText: CaseSelectText;
  /** Configuration type - only supports select, or both select and fixed */
  mode?: Array<'select' | 'fixed'>;
}

/**
 * Custom Filter Setting plugin configuration
 */
export interface CustomFilterSettingConfig {
  /** Whether to enable plugin */
  enabled?: boolean;
  /** Plugin priority */
  priority?: PluginPriorityEnum;
  /** Whether to enable filter setting functionality */
  enableFilterSetting?: boolean;
  /** CustomFilterSetting component props */
  filterSettingProps?: Partial<CustomFilterSettingProps>;
  /** Custom render function */
  customRender?: (props: CustomFilterSettingProps) => ReactNode;
}

/**
 * Plugin state
 */
export interface CustomFilterSettingState {
  /** Whether to show filter setting */
  showFilterSetting: boolean;
  /** Fixed fields */
  fixedFields: string[];
  /** Selected fields */
  selectedFields: string[];
  /** Hidden fields */
  hiddenFields: string[];
  /** All available fields */
  allFields: string[];
  /** Filter configuration */
  filters?: Record<string, unknown>;
  /** Whether visible */
  visible?: boolean;
}
