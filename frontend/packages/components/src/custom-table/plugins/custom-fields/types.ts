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

import type { BaseRecord, ModernTableColumnProps } from '@/custom-table/types';
import type { PluginPriorityEnum } from '@/custom-table/types/core/enums';
/**
 * Custom Fields plugin type definitions
 */
import type { ReactElement } from 'react';

/**
 * CustomFields component props
 */
export interface CustomFieldsProps<T extends BaseRecord = BaseRecord> {
  /** Disabled fields */
  disabledFields: Map<string, string | undefined>;
  /** Base columns */
  columns: ModernTableColumnProps<T>[];
  /** Currently selected value */
  value: string[] | undefined;
  /** Initial fields */
  initialFields?: string[];
  /** Confirm callback */
  confirm: (value: string[]) => void;
}

/**
 * Custom Fields plugin configuration
 */
export interface CustomFieldsConfig {
  /** Whether to enable plugin */
  enabled?: boolean;
  /** Plugin priority */
  priority?: PluginPriorityEnum;
  /** Whether to enable custom fields functionality */
  enableCustomFields?: boolean;
  /** CustomFields component props */
  customFieldsProps?: Partial<CustomFieldsProps>;
  /** Custom render function */
  customRender?: (props: CustomFieldsProps) => ReactElement | null;
}

/**
 * Plugin state
 */
export interface CustomFieldsState<T extends BaseRecord = BaseRecord> {
  /** Whether to show CustomFields */
  showCustomFields: boolean;
  /** Currently selected fields */
  selectedFields: string[];
  /** Available columns */
  availableColumns: ModernTableColumnProps<T>[];
  /** Disabled fields */
  disabledFields: string[];
}
