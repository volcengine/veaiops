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
 * Metric search component
 * @description Handles metric name search functionality
 */

import { Input } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import type React from 'react';
import styles from '../../../datasource-wizard.module.less';
import type { MetricSearchProps } from '../types';

export const MetricSearch: React.FC<MetricSearchProps> = ({
  searchText,
  onSearchChange,
}) => {
  return (
    <div className={styles.searchContainer}>
      <Input
        prefix={<IconSearch />}
        placeholder="搜索指标名称..."
        value={searchText}
        onChange={onSearchChange}
        allowClear
      />
    </div>
  );
};
