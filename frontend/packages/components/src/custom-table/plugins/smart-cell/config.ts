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

import { PluginPriorityEnum } from '@/custom-table/types/core/enums';
/**
 * Smart cell plugin default configuration
 */
import type { BaseRecord } from '@veaiops/types';
import type { SmartCellConfig } from './types';

export const DEFAULT_SMART_CELL_CONFIG: SmartCellConfig = {
  enabled: false,
  priority: PluginPriorityEnum.LOW,
  defaultEmptyConfig: {
    strategy: 'text' as const,
    text: '--',
    showTooltip: false,
    allowEdit: false,
  },
  fieldConfigs: {},
  permissionConfig: {
    fieldName: '',
  },
  globalContext: {},
  userRole: 'viewer',
  showPermissionHints: true,
  enableContextualDisplay: true,
  onEdit: async (_fieldName: string, _record: BaseRecord): Promise<boolean> => {
    // Default empty implementation
    return false;
  },
  onEmptyClick: () => {
    // Default empty implementation
  },
  onCellRender: () => undefined,
  onEmptyValueClick: () => {
    // Default empty implementation
  },
};
