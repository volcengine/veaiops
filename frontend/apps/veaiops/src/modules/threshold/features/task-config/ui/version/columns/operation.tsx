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

import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { IconInfoCircle } from '@arco-design/web-react/icon';
import {
  type ButtonConfiguration,
  ButtonGroupRender,
} from '@veaiops/components';
import { IntelligentThresholdTaskVersion } from 'api-generate';
import type { FlattenedVersion } from './types';
import { getTooltipByStatusAndAction } from './utils';

/**
 * Operation column configuration
 */
export const getOperationColumn = ({
  onCreateAlarm,
  onViewCleaningResult,
  onRerunOpen,
}: {
  onCreateAlarm: (data: FlattenedVersion) => void;
  onViewCleaningResult?: (data: FlattenedVersion) => void;
  onRerunOpen: (data: FlattenedVersion) => void;
}): ColumnProps<FlattenedVersion> => ({
  title: '操作',
  dataIndex: 'operation',
  fixed: 'right',
  width: 250,
  render: (_: unknown, record: FlattenedVersion) => {
    const buttonConfigurations: ButtonConfiguration[] = [
      {
        text: '重新执行',
        dataTestId: 're-execute-task-btn',
        onClick: () => {
          onRerunOpen(record);
        },
      },
      {
        text: '查看任务结果',
        disabled:
          record?.status !== IntelligentThresholdTaskVersion.status.SUCCESS,
        tooltip:
          record?.status !== IntelligentThresholdTaskVersion.status.SUCCESS
            ? getTooltipByStatusAndAction(
                record?.status,
                'view',
                record?.error_message,
              )
            : undefined,
        // Set higher zIndex for error message tooltip to ensure it's not blocked
        tooltipProps:
          record?.status !== IntelligentThresholdTaskVersion.status.SUCCESS &&
          record?.error_message
            ? {
                position: 'left',
              }
            : undefined,
        // In failed state, add icon hint to button, inform user can hover to view error message
        buttonProps:
          record?.status !== IntelligentThresholdTaskVersion.status.SUCCESS &&
          record?.error_message
            ? {
                icon: (
                  <IconInfoCircle
                    style={{
                      color: 'var(--color-warning-6, #ff7d00)',
                      fontSize: '14px',
                      marginRight: '4px',
                    }}
                  />
                ),
              }
            : undefined,
        dataTestId: 'view-task-result-btn',
        onClick: () => {
          // Even if button is disabled, if task failed, should allow user to view failure reason
          // But here keep original logic, only allow success state to view results
          if (
            record?.status === IntelligentThresholdTaskVersion.status.SUCCESS
          ) {
            onViewCleaningResult?.(record);
          }
        },
      },
      {
        text: '创建告警规则',
        disabled:
          record?.status !== IntelligentThresholdTaskVersion.status.SUCCESS,
        tooltip:
          record?.status !== IntelligentThresholdTaskVersion.status.SUCCESS
            ? getTooltipByStatusAndAction(
                record?.status,
                'create',
                record?.error_message,
              )
            : undefined,
        dataTestId: 'create-alert-rule-btn',
        onClick: () => {
          if (onCreateAlarm) {
            onCreateAlarm(record);
          }
        },
      },
    ];

    return (
      <ButtonGroupRender
        buttonConfigurations={buttonConfigurations}
        className="flex-nowrap"
      />
    );
  },
});
