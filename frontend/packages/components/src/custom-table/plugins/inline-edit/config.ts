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

import type { BaseRecord } from '@/custom-table/types';
/**
 * Default configuration for Inline Edit plugin
 */
import { PluginPriorityEnum } from '@/custom-table/types/core/enums';
import type { Key } from 'react';
import type { InlineEditConfig } from './types';

export const DEFAULT_INLINE_EDIT_CONFIG: Required<InlineEditConfig> = {
  enabled: false,
  priority: PluginPriorityEnum.MEDIUM,
  autoInstall: true,
  dependencies: [],
  conflicts: [],
  mode: 'cell',
  trigger: 'click' as const,
  fields: [],
  batchEdit: false,
  allowBatchEdit: false,
  autoSaveDelay: 1000,
  autoSave: false,
  validateOnChange: true,
  onBeforeEdit: () => true,
  onAfterEdit: () => {
    // Default empty implementation
  },
  onEditCancel: () => {
    // Default empty implementation
  },
  onValidationError: () => {
    // Default empty implementation
  },
  onSave: async () => {
    // Default empty implementation
  },
  callbacks: {
    beforeEdit: async () => true,
    afterEdit: () => {
      // Default empty implementation
    },
    beforeSave: async () => true,
    afterSave: () => {
      // Default empty implementation
    },
    onCancel: () => {
      // Default empty implementation
    },
    onError: () => {
      // Default empty implementation
    },
    onChange: () => {
      // Default empty implementation
    },
  },
  getRowKey: (_record: BaseRecord): Key => {
    throw new Error('InlineEdit getRowKey is required but was not provided');
  },
  style: {},
};
