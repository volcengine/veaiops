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
 * Data source configuration file
 * @description Defines configuration information and step flow for various data source types
 * @author AI Assistant
 * @date 2025-01-15
 */

import {
  IconCloud,
  IconDesktop,
  IconThunderbolt,
} from '@arco-design/web-react/icon';
import { DataSource } from '@veaiops/api-client';
import { DataSourceType } from '../types';
import type { DataSourceTypeConfig } from '../types';

// Data source type configurations
export const DATA_SOURCE_CONFIGS: DataSourceTypeConfig[] = [
  {
    type: DataSource.type.VOLCENGINE,
    name: '火山引擎',
    description: '基于火山引擎云监控的数据源',
    icon: 'IconThunderbolt',
    steps: [
      {
        key: 'connect',
        title: '选择连接',
        description: '选择已配置的火山引擎连接',
        component: 'ConnectSelection',
      },
      {
        key: 'product',
        title: '选择产品',
        description: '选择火山引擎产品命名空间',
        component: 'ProductSelection',
      },
      {
        key: 'subnamespace',
        title: '选择子空间',
        description: '选择产品子命名空间',
        component: 'SubNamespaceSelection',
      },
      {
        key: 'metric',
        title: '选择监控项',
        description: '选择监控指标',
        component: 'MetricSelection',
      },
      {
        key: 'instance',
        title: '选择实例',
        description: '选择监控实例',
        component: 'InstanceSelection',
      },
      {
        key: 'create',
        title: '创建数据源',
        description: '设置数据源名称并创建',
        component: 'DataSourceCreation',
      },
    ],
  },
  {
    type: DataSource.type.ALIYUN,
    name: '阿里云',
    description: '基于阿里云云监控的数据源',
    icon: 'IconCloud',
    steps: [
      {
        key: 'connect',
        title: '选择连接',
        description: '选择已配置的阿里云连接',
        component: 'ConnectSelection',
      },
      {
        key: 'project',
        title: '选择命名空间',
        description: '选择阿里云命名空间',
        component: 'NamespaceSelection',
      },
      {
        key: 'metric',
        title: '选择监控项',
        description: '选择监控指标',
        component: 'MetricSelection',
      },
      {
        key: 'instance',
        title: '选择实例',
        description: '选择监控实例',
        component: 'InstanceSelection',
      },
      {
        key: 'create',
        title: '创建数据源',
        description: '设置数据源名称并创建',
        component: 'DataSourceCreation',
      },
    ],
  },
  {
    type: DataSource.type.ZABBIX,
    name: 'Zabbix',
    description: '基于 Zabbix 监控系统的数据源',
    icon: 'IconDesktop',
    steps: [
      {
        key: 'connect',
        title: '选择连接',
        description: '选择已配置的 Zabbix 连接',
        component: 'ConnectSelection',
      },
      {
        key: 'template',
        title: '选择模板',
        description: '从连接中选择监控模板',
        component: 'TemplateSelection',
      },
      {
        key: 'metric',
        title: '选择监控项',
        description: '选择模板中的监控项',
        component: 'MetricSelection',
      },
      {
        key: 'host',
        title: '选择主机',
        description: '选择使用该模板的主机',
        component: 'HostSelection',
      },
      {
        key: 'confirm',
        title: '确认配置',
        description: '确认监控项和主机配置',
        component: 'ItemConfirmation',
      },
      {
        key: 'create',
        title: '创建数据源',
        description: '设置数据源名称并创建',
        component: 'DataSourceCreation',
      },
    ],
  },
];

// Icon mapping
export const ICON_MAP = {
  IconDesktop,
  IconCloud,
  IconThunderbolt,
};
