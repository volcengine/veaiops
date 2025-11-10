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

/* generated using openapi-typescript-codegen -- do not edit */
import type { DataSourceType } from './data-source-type';
export type Connect = {
  /**
   * Connection ID
   */
  _id?: string;
  /**
   * Connection ID (alias)
   */
  id?: string;
  /**
   * Connection name
   */
  name: string;
  type: DataSourceType;
  /**
   * Connection description
   */
  description?: string;
  /**
   * Zabbix API URL
   */
  zabbix_api_url?: string;
  /**
   * Zabbix API username
   */
  zabbix_api_user?: string;
  /**
   * Alibaba Cloud Access Key ID
   */
  aliyun_access_key_id?: string;
  /**
   * Volcano Engine Access Key ID
   */
  volcengine_access_key_id?: string;
  /**
   * Whether active
   */
  is_active?: boolean;
  /**
   * Creation time
   */
  created_at?: string;
  /**
   * Update time
   */
  updated_at?: string;
};
