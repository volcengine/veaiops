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

// Copyright 2025 Beijing Volcano Technology Co., Ltd. and/or its affiliates
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

import { IntelligentThresholdTaskVersion } from 'api-generate';
import type React from 'react';
import { ErrorTooltipContent } from '../../components/table-columns';

/**
 * Get corresponding color based on status value
 */
export const getStatusColor = (statusValue: string): string | undefined => {
  switch (statusValue) {
    case IntelligentThresholdTaskVersion.status.SUCCESS:
      return 'green'; // Success - green
    case IntelligentThresholdTaskVersion.status.FAILED:
      return 'red'; // Failed - red
    case IntelligentThresholdTaskVersion.status.RUNNING:
      return 'blue'; // Running - blue
    case IntelligentThresholdTaskVersion.status.LAUNCHING:
      return 'arcoblue'; // Launching - light blue
    case IntelligentThresholdTaskVersion.status.STOPPED:
      return 'gray'; // Stopped - gray
    default:
      return undefined; // Unknown status uses default style
  }
};

/**
 * Generate corresponding Tooltip based on task status and button type
 */
export const getTooltipByStatusAndAction = (
  status: string,
  action: 'view' | 'create',
  errorMessage?: string,
): React.ReactNode | string => {
  switch (status) {
    case IntelligentThresholdTaskVersion.status.FAILED:
      // If viewing task result and error message exists, show detailed failure reason
      if (action === 'view' && errorMessage) {
        // Return error message Tooltip content (ReactNode)
        return <ErrorTooltipContent errorMessage={errorMessage} />;
      }
      // If no error message, return prompt for user to view failure reason
      if (action === 'view') {
        return '任务执行失败，无法查看任务结果。请将鼠标悬停在此按钮上查看失败原因';
      }
      // Create alarm rule operation
      return '任务执行失败，无法创建告警规则';
    case IntelligentThresholdTaskVersion.status.RUNNING:
      return action === 'view'
        ? '任务正在运行中，请等待执行完成后查看结果'
        : '任务正在运行中，请等待执行完成后创建告警规则';
    case IntelligentThresholdTaskVersion.status.LAUNCHING:
      return action === 'view'
        ? '任务正在启动中，请等待执行完成后查看结果'
        : '任务正在启动中，请等待执行完成后创建告警规则';
    case IntelligentThresholdTaskVersion.status.STOPPED:
      return action === 'view'
        ? '任务已停止，无法查看任务结果'
        : '任务已停止，无法创建告警规则';
    default:
      return '';
  }
};
