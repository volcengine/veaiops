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

import { Button } from '@arco-design/web-react';
import { IconPlus, IconSettings } from '@arco-design/web-react/icon';

/**
 * Monitor configuration action button configuration Hook
 * Provides table toolbar action button configuration
 */
export const useMonitorActionConfig = (
  onAdd: () => void,
  onConnectionManage?: () => void,
  dataSourceType?: string,
) => {
  const actions = [
    <Button key="add" type="primary" icon={<IconPlus />} onClick={onAdd}>
      新增数据源
    </Button>,
  ];

  // If connection management callback is provided, add connection management button
  if (onConnectionManage && dataSourceType) {
    actions.push(
      <Button
        key="connection-manage"
        type="outline"
        icon={<IconSettings />}
        onClick={onConnectionManage}
      >
        {`${dataSourceType} 连接管理`}
      </Button>,
    );
  }

  return { actions };
};
