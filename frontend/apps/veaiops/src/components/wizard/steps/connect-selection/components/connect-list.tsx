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
 * Connect list component
 * @description Renders connect selection list
 * @author AI Assistant
 * @date 2025-01-17
 */

import {
  Alert,
  Empty,
  Input,
  Radio,
  Space,
  Tag,
  Typography,
} from '@arco-design/web-react';
import { IconLink, IconSearch } from '@arco-design/web-react/icon';
import type { Connect } from 'api-generate';
import { type FC, useEffect, useState } from 'react';
import { SelectableItem } from '../../../components/selectable-item';
import styles from '../../../datasource-wizard.module.less';
import type { DataSourceType } from '../../../types';
import {
  getConnectStatusColor,
  getConnectStatusText,
  getDataSourceTypeLabel,
  useConnectFilter,
} from './connect-filter';

const { Text } = Typography;

export interface ConnectListProps {
  connects: Connect[];
  selectedConnect: Connect | null;
  onConnectSelect: (connect: Connect) => void;
}

export const ConnectList: FC<ConnectListProps> = ({
  connects,
  selectedConnect,
  onConnectSelect,
}) => {
  const [searchText, setSearchText] = useState('');
  const { filteredConnects } = useConnectFilter(connects, 'all', searchText);

  // On first load, if there's no selected item and available connects, auto-select the first one
  // Note: Only auto-select when there's no search text, to avoid triggering auto-selection during search causing loops
  useEffect(() => {
    const hasNoSearch = !searchText.trim();
    if (!selectedConnect && connects.length > 0 && hasNoSearch) {
      onConnectSelect(connects[0]);
    }
  }, [connects.length, selectedConnect, searchText, onConnectSelect]);

  // Put selected item first for quick viewing during editing
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
          placeholder="Search connect name or description..."
          value={searchText}
          onChange={setSearchText}
          allowClear
        />
      </div>

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
              icon={<IconLink />}
              title={
                <Space>
                  {connect.name}
                  <Tag color={getConnectStatusColor(connect.is_active)}>
                    {getConnectStatusText(connect.is_active)}
                  </Tag>
                </Space>
              }
              description={connect.description}
              extra={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Type:{' '}
                  {getDataSourceTypeLabel(
                    connect.type as unknown as DataSourceType,
                  )}
                  {connect.zabbix_api_url &&
                    ` • Endpoint: ${connect.zabbix_api_url}`}
                  {connect.created_at &&
                    ` • Created: ${new Date(connect.created_at).toLocaleDateString()}`}
                </Text>
              }
            />
          ))}
        </Radio.Group>
      </div>

      {/* Empty state: No search results or no connect data */}
      {sortedConnects.length === 0 && (
        <Empty
          icon={searchText ? <IconSearch /> : <IconLink />}
          description={
            searchText
              ? `No connects found containing "${searchText}"`
              : 'No connect configurations available, please click "Create New Connect" button in the top right corner'
          }
        />
      )}

      {selectedConnect && (
        <Alert
          className={'mt-2'}
          type="success"
          content={`Selected connect: ${selectedConnect.name}`}
          showIcon
          closable={false}
        />
      )}
    </>
  );
};

export default ConnectList;
