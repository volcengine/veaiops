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
import { CellRender } from '@veaiops/components';
import type { FlattenedVersion } from './types';

const { Ellipsis, RowSpan } = CellRender;

/**
 * Window size column configuration
 */
export const getWindowSizeColumn = (): ColumnProps<FlattenedVersion> => ({
  title: '窗口大小',
  dataIndex: 'n_count',
  align: 'center',
  width: 120,
  render: (col: unknown, record: FlattenedVersion) =>
    RowSpan({
      record,
      children: (
        <Ellipsis
          text={
            typeof col === 'string' || typeof col === 'number'
              ? String(col)
              : ''
          }
          center
        />
      ),
    }),
});
