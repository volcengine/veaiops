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

import { renderEventShowStatus } from '@/modules/event-center/features/history/config/columns';
import { Button, Space } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { IconEye, IconRedo } from '@arco-design/web-react/icon';
import { CellRender } from '@veaiops/components';
import { AGENT_TYPE_MAP, EMPTY_CONTENT } from '@veaiops/constants';
import { ModuleType } from '@veaiops/types';
import { formatDateTime } from '@veaiops/utils';
import type { Event } from 'api-generate';
import { useMemo } from 'react';
import type { TableColumnsProps } from './types';
import { truncateText } from './utils';

// Destructure CellRender component to avoid repeated calls
const { CustomOutlineTag } = CellRender;

/**
 * Get historical event table column configuration
 */
export const useTableColumns = ({
  customActions,
  onRetry,
  moduleType,
  onViewDetail,
}: TableColumnsProps & {
  moduleType?: ModuleType;
}): ColumnProps<Event>[] => {
  return useMemo(() => {
    const baseColumns: ColumnProps<Event>[] = [
      {
        title: 'ID',
        dataIndex: '_id',
        key: '_id',
        fixed: 'left',
        width: 250,
        render: (value) => <div style={truncateText(250)}>{value}</div>,
      },
      {
        title: '智能体',
        dataIndex: 'agent_type',
        key: 'agent_type',
        width: 150,
        render: (value: string) => {
          return value ? (
            <CustomOutlineTag>
              {(AGENT_TYPE_MAP as Record<string, { label: string }>)[value]
                ?.label || value}
            </CustomOutlineTag>
          ) : (
            EMPTY_CONTENT
          );
        },
      },
      {
        title: '状态',
        dataIndex: 'show_status',
        key: 'show_status',
        width: 120,
        render: renderEventShowStatus,
      },
      {
        title: '事件级别',
        dataIndex: 'event_level',
        key: 'event_level',
        width: 100,
        render: (value: string) => {
          return value ? <CustomOutlineTag>{value}</CustomOutlineTag> : '-';
        },
      },
      // {
      //   title: 'Region',
      //   dataIndex: 'region',
      //   key: 'region',
      //   width: 150,
      //   render: (value: string[]) =>
      //     value?.length > 0 ? value.join(', ') : 'All',
      // },
      // {
      //   title: 'Followed Projects',
      //   dataIndex: 'project',
      //   key: 'project',
      //   width: 150,
      //   render: (value: string[]) =>
      //     value?.length > 0 ? value.join(', ') : 'All',
      // },
      // {
      //   title: 'Followed Products',
      //   dataIndex: 'product',
      //   key: 'product',
      //   width: 150,
      //   render: (value: string[]) =>
      //     value?.length > 0 ? value.join(', ') : 'All',
      // },
      // {
      //   title: 'Followed Customers',
      //   dataIndex: 'customer',
      //   key: 'customer',
      //   width: 150,
      //   render: (value: string[]) =>
      //     value?.length > 0 ? value.join(', ') : 'All',
      // },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 180,
        sorter: true,
        // Set default descending sort (latest records first)
        defaultSortOrder: 'descend',
        render: (value: string) => formatDateTime(value, true),
      },
      {
        title: '更新时间',
        dataIndex: 'updated_at',
        key: 'updated_at',
        width: 180,
        render: (value: string) => formatDateTime(value, true),
      },
    ];
    // Add action column
    baseColumns.push({
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_: unknown, record: Event) => {
        if (customActions) {
          return <Space>{customActions(record)}</Space>;
        }

        const isOncallOrIntelligentThreshold =
          moduleType === ModuleType.ONCALL ||
          moduleType === ModuleType.INTELLIGENT_THRESHOLD;

        return (
          <Space>
            {isOncallOrIntelligentThreshold ? (
              // Oncall and intelligent threshold modules: Show view detail button
              <Button
                type="text"
                size="small"
                icon={<IconEye />}
                onClick={() => onViewDetail?.(record)}
              >
                查看详情
              </Button>
            ) : (
              // Other modules: Show retry button
              <Button
                type="text"
                size="small"
                icon={<IconRedo />}
                disabled={!(record.status === 0 && onRetry)}
                onClick={() => record._id && onRetry?.(record._id)}
              >
                重试
              </Button>
            )}
          </Space>
        );
      },
    });

    return baseColumns;
  }, [customActions, onRetry, moduleType, onViewDetail]);
};
