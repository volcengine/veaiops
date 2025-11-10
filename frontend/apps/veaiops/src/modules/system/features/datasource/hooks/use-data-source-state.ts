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

import { logger } from '@veaiops/utils';
import type { DataSource } from 'api-generate';
import { useEffect, useRef, useState } from 'react';
import type { MonitorTableRef } from '../ui/components/tables/monitor-table';

export const useDataSourceState = () => {
  const [connectionDrawerVisible, setConnectionDrawerVisible] = useState(false);
  const [wizardVisible, setWizardVisible] = useState(false);
  const [editingDataSource, setEditingDataSource] = useState<DataSource | null>(
    null,
  );

  const volcengineTableRef = useRef<MonitorTableRef>(null);
  const aliyunTableRef = useRef<MonitorTableRef>(null);
  const zabbixTableRef = useRef<MonitorTableRef>(null);

  useEffect(() => {
    logger.info({
      message: '📊 connectionDrawerVisible changed',
      data: {
        visible: connectionDrawerVisible,
        timestamp: new Date().toISOString(),
      },
      source: 'useDataSourceState',
      component: 'connectionDrawerVisible-effect',
    });
  }, [connectionDrawerVisible]);

  useEffect(() => {
    logger.info({
      message: '📊 wizardVisible changed',
      data: {
        visible: wizardVisible,
        timestamp: new Date().toISOString(),
      },
      source: 'useDataSourceState',
      component: 'wizardVisible-effect',
    });
  }, [wizardVisible]);

  return {
    connectionDrawerVisible,
    setConnectionDrawerVisible,
    wizardVisible,
    setWizardVisible,
    editingDataSource,
    setEditingDataSource,
    volcengineTableRef,
    aliyunTableRef,
    zabbixTableRef,
  };
};
