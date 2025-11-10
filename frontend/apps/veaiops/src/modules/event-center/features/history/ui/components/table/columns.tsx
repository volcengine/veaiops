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
 * History event table column configuration
 *
 * Abstract column configuration logic separately to improve code maintainability
 * Business side can customize column configuration by modifying this file
 */

import { Button } from '@arco-design/web-react';
import { IconEye } from '@arco-design/web-react/icon';
import { CellRender } from '@veaiops/components';
import type { Event } from 'api-generate';
import { useCallback } from 'react';

// Destructure CellRender components to avoid repeated calls
const { InfoWithCode, StampTime, CustomOutlineTag } = CellRender;

/**
 * View detail parameter interface
 */
interface HandleViewDetailParams {
  record: Event;
}

/**
 * History event table column configuration parameters
 */
export interface HistoryTableColumnsConfig {
  /** View detail handler */
  onViewDetail?: (params: HandleViewDetailParams) => void;
}

/**
 * History event table column configuration Hook
 *
 * @param config Column configuration parameters
 * @returns Column configuration function
 */
export const useHistoryTableColumns = ({
  onViewDetail,
}: HistoryTableColumnsConfig) => {
  return useCallback(
    (_props: Record<string, unknown>) => [
      {
        title: '事件级别',
        dataIndex: 'event_level',
        key: 'event_level',
        width: 120,
        ellipsis: true,
        render: (title: string, record: Event) => (
          <InfoWithCode name={title} code={record._id} />
        ),
      },
      {
        title: '数据源类型',
        dataIndex: 'datasource_type',
        key: 'datasource_type',
        width: 120,
        render: (level: string) => (
          <CustomOutlineTag>{level || '未设置'}</CustomOutlineTag>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: string) => {
          let displayText = '未知';
          if (status === 'resolved') {
            displayText = '已解决';
          } else if (status === 'active') {
            displayText = '活跃';
          } else if (status) {
            displayText = status;
          }
          return <CustomOutlineTag>{displayText}</CustomOutlineTag>;
        },
      },
      {
        title: '触发时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 180,
        sorter: true,
        render: (createdAt: string) => (
          <StampTime time={createdAt} template="YYYY-MM-DD HH:mm:ss" />
        ),
      },
      {
        title: '操作',
        key: 'actions',
        width: 100,
        fixed: 'right',
        render: (_: string | undefined, record: Event) => (
          <div className="flex gap-2">
            {onViewDetail && (
              <Button
                type="text"
                size="small"
                icon={<IconEye />}
                onClick={() => onViewDetail({ record })}
              >
                查看
              </Button>
            )}
          </div>
        ),
      },
    ],
    [onViewDetail],
  );
};
