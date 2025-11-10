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
 * Table alert plugin type definition
 */

import type { ReactNode } from 'react';
import type { PluginBaseConfig } from './core';

/**
 * Table alert configuration
 */
export interface TableAlertConfig extends PluginBaseConfig {
  enabled?: boolean;
  showIcon?: boolean;
  closable?: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  message?: ReactNode;
  description?: ReactNode;
}

/**
 * Table alert state
 */
export interface TableAlertState {
  visible: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  message?: ReactNode;
  description?: ReactNode;
}

/**
 * Table alert methods
 */
export interface TableAlertMethods {
  show: (config: Partial<TableAlertConfig>) => void;
  hide: () => void;
  update: (config: Partial<TableAlertConfig>) => void;
}
