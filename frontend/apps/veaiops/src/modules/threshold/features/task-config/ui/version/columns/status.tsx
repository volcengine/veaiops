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

import { Tag } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { CellRender } from '@veaiops/components';
import { taskStatusOptions } from '../filters';
import type { FlattenedVersion } from './types';
import { getStatusColor } from './utils';

const { CustomOutlineTag, RowSpan } = CellRender;

/**
 * Status column configuration
 */
export const getStatusColumn = (): ColumnProps<FlattenedVersion> => ({
  title: '状态',
  dataIndex: 'status',
  align: 'center',
  width: 120,
  render: (col: unknown, record: FlattenedVersion) => {
    const status = col as string;
    const statusLabel =
      taskStatusOptions.find((item) => item.value === col)?.label ||
      (typeof col === 'string' || typeof col === 'number' ? String(col) : '');

    const statusColor = getStatusColor(status);

    // All statuses use Tag component, display different colors based on status
    const statusElement = statusColor ? (
      <Tag color={statusColor}>{statusLabel}</Tag>
    ) : (
      <CustomOutlineTag>{statusLabel}</CustomOutlineTag>
    );

    return RowSpan({
      record,
      children: statusElement,
    });
  },
});
