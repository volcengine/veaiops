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

import type { ReactNode } from 'react';

/**
 * Component base type definitions
 * @description Provides base common types for the component library
 */

// ===== Base Type Definitions =====

/** Common option type, supports extended data */
export type Option<T = Record<string, any>> = {
  /** Display label, supports React nodes */
  label: ReactNode;
  /** Option value */
  value: string | number;
  /** Whether disabled */
  disabled?: boolean;
  /** Extended data */
  extra?: T;
};

/** Event handler type */
export type EventHandler = (...args: unknown[]) => void;

/** Form instance type - Compatible with Arco Design's FormInstance */
export interface FormInstance {
  setFieldsValue: (values: Record<string, unknown>) => void;
  getFieldsValue: () => Record<string, unknown>;
  resetFields: () => void;
  validateFields?: () => Promise<Record<string, unknown>>;
  // Add other methods from Arco Design FormInstance
  [key: string]: unknown;
}

/** Global configuration type */
export interface GlobalConfig {
  filterStyle?: {
    isWithBackgroundAndBorder?: boolean;
    style?: React.CSSProperties;
  };
  commonClassName?: string;
  [key: string]: unknown;
}
