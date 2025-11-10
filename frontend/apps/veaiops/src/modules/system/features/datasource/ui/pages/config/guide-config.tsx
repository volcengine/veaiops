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

import type { IStep } from '@veaiops/components';
import {
  AddMonitorConfigGuideContent,
  ConnectionManagementGuideContent,
} from '../components/guide-content';

/**
 * Monitor data source management page guide steps configuration
 */
export const MONITOR_MANAGEMENT_GUIDE_STEPS: IStep[] = [
  {
    selector: '#monitor-connection-manage-btn',
    title: '第一步：连接管理',
    content: <ConnectionManagementGuideContent />,
    placement: 'bottom',
  },
  {
    selector: '#new-datasource-btn',
    title: '第二步：新增数据源',
    content: <AddMonitorConfigGuideContent />,
    placement: 'left-top',
  },
];

/**
 * Guide configuration constants
 */
export const GUIDE_CONFIG_CONSTANTS = {
  LOCAL_KEY: 'monitor-access-management-guide',
  TYPE: 'tip' as const,
  THEME: 'bits-light' as const,
  NEXT_TEXT: '下一步',
  PREV_TEXT: '上一步',
  OK_TEXT: '完成',
} as const;
