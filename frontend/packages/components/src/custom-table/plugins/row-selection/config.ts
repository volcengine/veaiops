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
 * Row selection plugin default configuration
 */
import { PluginPriorityEnum } from '@/custom-table/types/core/enums';
import type { RowSelectionConfig } from './types';

export const DEFAULT_ROW_SELECTION_CONFIG: RowSelectionConfig = {
  enabled: true,
  priority: PluginPriorityEnum.HIGH,
  type: 'checkbox',
  checkAll: true,
  checkStrictly: false,
  checkCrossPage: false,
  strategy: 'page',
  preserveAcrossPages: false,
  batchActions: [],
  selectionStat: {
    show: true,
    position: 'header',
    render: (_selectedCount: number) => null,
  },
  maxSelection: 0,
  getRowKey: (_record) => {
    throw new Error('RowSelection getRowKey is required but was not provided');
  },
  onChange: () => {
    // Default empty implementation
  },
  beforeBatchAction: () => true,
};
