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

// Custom Fields component type definitions
import type { ModernTableColumnProps } from '../shared/types';

export interface CustomFieldsProps<T = any> {
  /** Fields that cannot be selected */
  disabledFields: Map<string, string | undefined>;
  /** Base columns */
  columns: ModernTableColumnProps<T>[];
  /** Current value */
  value: string[] | undefined;
  /** Initial value */
  initialFields?: string[];
  /** Confirm callback */
  confirm: (value: string[]) => void;
  /** Button text */
  buttonText?: string;
  /** Drawer title */
  drawerTitle?: string;
}

export interface CheckBoxDrawerProps<T = any> {
  /** Fields that cannot be selected */
  disabledFields: Map<string, string | undefined>;
  /** Base columns */
  columns: ModernTableColumnProps<T>[];
  /** Show/hide */
  visible: boolean;
  /** Close */
  close: () => void;
  /** Confirm */
  confirm: (value: string[]) => void;
  /** Current value */
  value: string[] | undefined;
  /** Initial value */
  initialValue?: string[];
  /** Title */
  title: string;
}
