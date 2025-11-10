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
import type { FormFieldConfig } from './types';

// Form field configuration constants
export const FORM_FIELD_CONFIGS: Record<DataSourceType, FormFieldConfig[]> = {
  Zabbix: [
    {
      label: 'Zabbix API URL',
      field: 'zabbix_api_url',
      placeholder: '请输入 Zabbix API URL',
      autoFocus: true,
    },
    {
      label: 'Zabbix API 用户名',
      field: 'zabbix_api_user',
      placeholder: '请输入 Zabbix API 用户名',
    },
    {
      label: 'Zabbix API 密码',
      field: 'zabbix_api_password',
      placeholder: '请输入 Zabbix API 密码',
      isPassword: true,
    },
  ],
  Aliyun: [
    {
      label: '阿里云 Access Key ID',
      field: 'aliyun_access_key_id',
      placeholder: '请输入阿里云 Access Key ID',
      autoFocus: true,
    },
    {
      label: '阿里云 Access Key Secret',
      field: 'aliyun_access_key_secret',
      placeholder: '请输入阿里云 Access Key Secret',
      isPassword: true,
    },
  ],
  Volcengine: [
    {
      label: '火山引擎 Access Key ID',
      field: 'volcengine_access_key_id',
      placeholder: '请输入火山引擎 Access Key ID',
      autoFocus: true,
    },
    {
      label: '火山引擎 Access Key Secret',
      field: 'volcengine_access_key_secret',
      placeholder: '请输入火山引擎 Access Key Secret',
      isPassword: true,
    },
  ],
};
