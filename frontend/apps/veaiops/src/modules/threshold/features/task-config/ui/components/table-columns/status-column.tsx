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

import { Tag, Tooltip } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import type { MetricThresholdResult } from 'api-generate';
import { ErrorTooltipContent } from './error-tooltip-content';

/**
 * Get status column configuration
 *
 * Status determination logic:
 * - Has error_message means failed status
 * - No error_message means success status
 *
 * Note: Although Python backend defines a status field, actual data may not include this field,
 * therefore status is determined based on the presence or absence of error_message
 */
export const getStatusColumn = (): ColumnProps<MetricThresholdResult> => ({
  title: '状态',
  dataIndex: 'status',
  key: 'status',
  width: 120,
  align: 'center' as const,
  render: (_: unknown, record: MetricThresholdResult) => {
    const errorMessage = record?.error_message;

    // Determine status based on error_message: has error_message means failed, no error_message means success
    const isFailed = Boolean(errorMessage);

    // If no error message, show success status
    if (!isFailed) {
      return <Tag color="green">成功</Tag>;
    }

    // If has error message, show failed status and error details Tooltip
    return (
      <Tooltip
        content={<ErrorTooltipContent errorMessage={errorMessage || ''} />}
        triggerProps={{
          popupStyle: {
            zIndex: 2000,
          },
        }}
      >
        <Tag color="red">失败</Tag>
      </Tooltip>
    );
  },
});
