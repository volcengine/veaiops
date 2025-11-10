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
 * TitleInputSearch Table Title Input Search Component
 * @description Table title component that provides input search functionality
 * (Migrated from apps/meta-web)
 */

import { type FC, useMemo } from 'react';

// Common components
import { Input, Popover } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { selectColor, unselectColor } from '@veaiops/constants';
import type { TableColumnTitleProps } from '@veaiops/types';
import { get } from 'lodash-es';

// Utilities

// Styles
import styles from '../title-search/base.module.less';

// Get constants and components from namespace
import { Tip } from '@/tip';

/**
 * Input search title
 * @param title Title
 * @param dataIndex Data index
 * @param filters Filters
 * @param onChange Filter change callback
 * @param tip Tip
 */
const TitleInputSearch: FC<TableColumnTitleProps> = ({
  title,
  dataIndex,
  filters,
  onChange,
  tip,
}) => {
  const value = useMemo(
    () => get(filters, dataIndex) as string | undefined,
    [filters, dataIndex],
  );

  const handleChange = (nextValue: string) => {
    if (nextValue?.trim()) {
      onChange('filters', {
        [dataIndex]: [nextValue.trim()],
      });
    } else {
      onChange('filters', {
        [dataIndex]: null,
      });
    }
  };

  return (
    <div className={styles.columnTitle}>
      <span className={styles.columnText}>
        {title}
        <Tip content={tip} />
      </span>
      <span className={styles.columnAction}>
        <Popover
          trigger={'click'}
          content={
            <Input
              value={value}
              onChange={handleChange}
              allowClear
              placeholder={'Please enter'}
              style={{ width: 200 }}
            />
          }
        >
          <IconSearch
            className={styles.icon}
            style={{
              color: value ? selectColor : unselectColor,
              marginLeft: 2,
            }}
          />
        </Popover>
      </span>
    </div>
  );
};

export { TitleInputSearch };
