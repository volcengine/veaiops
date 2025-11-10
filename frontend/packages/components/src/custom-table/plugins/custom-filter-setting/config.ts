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
 * Default configuration for Custom Filter Setting plugin
 */
import { PluginPriorityEnum } from '@/custom-table/types/core/enums';
import type { ReactNode } from 'react';
import type { CustomFilterSettingConfig } from './types';

export const DEFAULT_FILTER_SETTING_CONFIG: Required<CustomFilterSettingConfig> =
  {
    enabled: true,
    priority: PluginPriorityEnum.MEDIUM,
    enableFilterSetting: false,
    filterSettingProps: {
      fixedOptions: [],
      allOptions: [],
      selectedOptions: [],
      hiddenOptions: [],
      title: 'Search Items Settings',
      mode: ['select'],
      caseSelectText: (key: string) => key,
      saveFun: () => {
        throw new Error('CustomFilterSetting saveFun function not implemented');
      },
    },
    customRender: (_props): ReactNode => null,
  };
