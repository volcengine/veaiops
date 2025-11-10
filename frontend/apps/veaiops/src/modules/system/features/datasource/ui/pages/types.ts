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

import type { DataSourceType } from 'api-generate';

/**
 * Data source configuration interface
 */
export interface DataSourceConfig {
  /** Unique key for Tab */
  key: string;
  /** Data source type */
  type: DataSourceType;
  /** Delete handler */
  deleteHandler: (
    monitorId: string,
    dataSourceType?: DataSourceType,
  ) => Promise<boolean>;
  /** Table Ref key name */
  tableRefKey: 'volcengineTableRef' | 'aliyunTableRef' | 'zabbixTableRef';
}

/**
 * Table Ref mapping type
 */
export interface TableRefMap {
  volcengineTableRef: React.RefObject<any>;
  aliyunTableRef: React.RefObject<any>;
  zabbixTableRef: React.RefObject<any>;
}
