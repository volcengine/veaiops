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
 * Empty instance list component
 * Used to display empty state when no data after search filter
 */

import { Empty, Typography } from '@arco-design/web-react';
import { EMPTY_CONTENT_TEXT_DOM } from '@veaiops/constants';
import type React from 'react';

const { Text } = Typography;

interface EmptyInstanceListProps {
  /** Search keyword */
  searchKeyword?: string;
  /** Total instance count */
  totalCount?: number;
  /** Custom message */
  customMessage?: string;
}

/**
 * Empty instance list component
 */
export const EmptyInstanceList: React.FC<EmptyInstanceListProps> = ({
  searchKeyword,
  totalCount = 0,
  customMessage,
}) => {
  // If there is a search keyword, it means empty state after search filter
  const isSearchEmpty = Boolean(searchKeyword) && searchKeyword.trim() !== '';

  // If there is total instance count but empty after filter, it means no search results
  const hasNoSearchResults = isSearchEmpty && totalCount > 0;

  const getEmptyMessage = () => {
    if (customMessage) {
      return customMessage;
    }

    if (hasNoSearchResults) {
      return `未找到匹配关键词"${searchKeyword}"的实例`;
    }

    if (isSearchEmpty) {
      return `未找到匹配关键词"${searchKeyword}"的实例`;
    }

    return '暂无实例数据';
  };

  const getEmptyDescription = () => {
    if (hasNoSearchResults) {
      return '请尝试修改搜索关键词或清空搜索条件';
    }

    if (isSearchEmpty) {
      return '请尝试修改搜索关键词';
    }

    return '当前没有可用的实例数据';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        minHeight: '300px',
      }}
    >
      <Empty
        description={
          <div style={{ textAlign: 'center' }}>
            <Text
              type="secondary"
              style={{
                fontSize: '14px',
                fontWeight: 400,
                display: 'block',
                marginBottom: '8px',
              }}
            >
              {getEmptyMessage()}
            </Text>
            <Text
              type="secondary"
              style={{
                fontSize: '12px',
                color: '#86909c',
              }}
            >
              {getEmptyDescription()}
            </Text>
          </div>
        }
      />
    </div>
  );
};

export default EmptyInstanceList;
