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

import { Checkbox, Space } from '@arco-design/web-react';
import type { ZabbixHost } from 'api-generate';
import type React from 'react';
import styles from '../../../../datasource-wizard.module.less';
import { ZabbixHostListItem } from './zabbix-host-list-item';

export interface ZabbixHostListProps {
  hosts: ZabbixHost[];
  selectedHosts: ZabbixHost[];
  onHostToggle: (host: ZabbixHost, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

export const ZabbixHostList: React.FC<ZabbixHostListProps> = ({
  hosts,
  selectedHosts,
  onHostToggle,
  onSelectAll,
}) => {
  const isAllSelected =
    hosts.length > 0 &&
    hosts.every((host) =>
      selectedHosts.some((selected) => selected.host === host.host),
    );

  const isIndeterminate = selectedHosts.length > 0 && !isAllSelected;

  return (
    <>
      {/* Select all control */}
      <div className={styles.selectAllContainer}>
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onChange={onSelectAll}
        >
          全选 ({hosts.length} 个主机)
        </Checkbox>
      </div>

      <div className={styles.selectionList}>
        <Space direction="vertical" size="medium" style={{ width: '100%' }}>
          {hosts.map((host) => {
            const isSelected = selectedHosts.some(
              (selected) => selected.host === host.host,
            );
            return (
              <ZabbixHostListItem
                key={host.host}
                host={host}
                isSelected={isSelected}
                onToggle={onHostToggle}
              />
            );
          })}
        </Space>
      </div>
    </>
  );
};
