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
 * Connection list component
 * @description Connection selection list component with search, auto-selection, sorting, and status hints support
 */

import {
  Alert,
  Badge,
  Empty,
  Input,
  Radio,
  Space,
  Tag,
  Typography,
} from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import type { Connect } from '@veaiops/api-client';
import { SelectableItem } from '@wizard/components/ui';
import {
  getConnectStatusBadge,
  getConnectStatusText,
  getDataSourceTypeLabel,
  useConnectFilter,
} from '@wizard/utils/connect-utils';
import type React from 'react';
import { useEffect, useState } from 'react';
import styles from '../../../../styles/main.module.less';

const { Text } = Typography;

export interface ConnectListProps {
  connects: Connect[];
  selectedConnect: Connect | undefined | null;
  onConnectSelect: (connect: Connect | null) => void;
}

const ConnectList: React.FC<ConnectListProps> = ({
  connects,
  selectedConnect,
  onConnectSelect,
}) => {
  const [searchText, setSearchText] = useState('');

  // Use filter Hook
  const { filteredConnects } = useConnectFilter({
    connects,
    dataSourceType: 'all',
    searchText,
  });

  // On first load, if no item selected and connections available, auto-select first one
  // Note: Only auto-select when no search text, avoid triggering auto-select during search causing loop
  useEffect(() => {
    const hasNoSearch = !searchText.trim();
    if (!selectedConnect && connects.length > 0 && hasNoSearch) {
      onConnectSelect(connects[0]);
    }
  }, [connects.length, selectedConnect, searchText, onConnectSelect]);

  // Selected item sorting: Put selected item first for quick viewing during editing
  const sortedConnects = [...filteredConnects].sort((a, b) => {
    const aSelected =
      selectedConnect?.id === a.id || selectedConnect?._id === a._id;
    const bSelected =
      selectedConnect?.id === b.id || selectedConnect?._id === b._id;
    if (aSelected && !bSelected) {
      return -1;
    }
    if (!aSelected && bSelected) {
      return 1;
    }
    return 0;
  });

  return (
    <>
      {/* Search box */}
      <div className={styles.searchContainer}>
        <Input
          prefix={<IconSearch />}
          placeholder="搜索连接名称或描述..."
          value={searchText}
          onChange={setSearchText}
          allowClear
        />
      </div>

      {/* Connection list */}
      <div className={styles.selectionList}>
        <Radio.Group
          className="w-full"
          value={selectedConnect?.id || selectedConnect?._id}
          onChange={(value) => {
            const connect = connects.find(
              (c) => c.id === value || c._id === value,
            );
            if (connect) {
              onConnectSelect(connect);
            }
          }}
        >
          {sortedConnects.map((connect) => (
            <SelectableItem
              key={connect.id || connect._id}
              selected={
                selectedConnect?.id === connect.id ||
                selectedConnect?._id === connect._id
              }
              radioValue={connect.id || connect._id}
              onClick={() => onConnectSelect(connect)}
              title={connect.name || '未命名连接'}
              description={connect.description || '暂无描述'}
              extra={
                <Space>
                  <Tag color={connect.is_active ? 'green' : 'red'}>
                    {getConnectStatusText(connect.is_active)}
                  </Tag>
                  <Text type="secondary" className="text-xs">
                    类型: {getDataSourceTypeLabel(connect.type)}
                    {connect.zabbix_api_url &&
                      ` • 端点: ${connect.zabbix_api_url}`}
                    {connect.created_at &&
                      ` • 创建时间: ${new Date(connect.created_at).toLocaleDateString()}`}
                  </Text>
                </Space>
              }
              selectorType="radio"
            />
          ))}
        </Radio.Group>
      </div>

      {/* No search results hint */}
      {sortedConnects.length === 0 && searchText && (
        <Empty
          icon={<IconSearch />}
          description={`未找到包含 "${searchText}" 的连接`}
        />
      )}

      {/* No connections hint */}
      {connects.length === 0 && (
        <div className="text-center p-6 text-gray-500">暂无可用的连接配置</div>
      )}

      {/* Selected hint */}
      {selectedConnect && (
        <Alert
          className={'mt-2'}
          type="success"
          content={`已选择连接: ${selectedConnect.name}`}
          showIcon
          closable={false}
        />
      )}
    </>
  );
};

export { ConnectList };
export default ConnectList;
