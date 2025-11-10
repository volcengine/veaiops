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
 * Grouping dimension selector component
 * @description Handles selection of metric grouping dimensions
 */

import { Checkbox, Space, Typography } from '@arco-design/web-react';
import type React from 'react';
import type { GroupBySelectorProps } from '../types';

const { Text } = Typography;
const CheckboxGroup = Checkbox.Group;

export const GroupBySelector: React.FC<GroupBySelectorProps> = ({
  dimensionKeys,
  selectedGroupBy,
  onGroupByChange,
}) => {
  return (
    <div
      style={{
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px solid var(--color-border-2)',
      }}
      onClick={(e) => e.stopPropagation()} // Prevent triggering outer metric selection when clicking checkbox
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: 500,
          display: 'block',
          marginBottom: 8,
          color: 'var(--color-text-1)',
        }}
      >
        分组维度（GroupBy）
      </Text>
      <Text
        type="secondary"
        style={{
          display: 'block',
          marginBottom: 10,
          fontSize: 12,
        }}
      >
        选择用于数据分组的维度，默认全部选中。这些维度将用于获取实例列表和数据分组。
      </Text>
      <CheckboxGroup
        value={selectedGroupBy}
        onChange={(values) => onGroupByChange(values)}
      >
        <Space wrap size="small">
          {dimensionKeys.map((key) => (
            <Checkbox
              key={key}
              value={key}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 13 }}>{key}</Text>
            </Checkbox>
          ))}
        </Space>
      </CheckboxGroup>
      <Text
        type="secondary"
        style={{
          display: 'block',
          marginTop: 10,
          fontSize: 12,
          fontStyle: 'italic',
        }}
      >
        已选择 {selectedGroupBy?.length ?? 0} 个维度:{' '}
        {(selectedGroupBy ?? []).join(', ')}
      </Text>
    </div>
  );
};
