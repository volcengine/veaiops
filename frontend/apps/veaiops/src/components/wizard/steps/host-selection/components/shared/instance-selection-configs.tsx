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
 * Instance selection configuration factory
 * @description Provides predefined configurations for different data sources
 */

import { IconCloud, IconDesktop } from '@arco-design/web-react/icon';
import type { ZabbixHost } from 'api-generate';
import type { AliyunInstance, VolcengineInstance } from '../../../../types';
import type { InstanceSelectionConfig } from './instance-selection-config';

/**
 * Aliyun instance selection configuration
 */
export const createAliyunConfig = (
  selectionAction: (instances: AliyunInstance[]) => void,
): InstanceSelectionConfig<AliyunInstance> => ({
  title: '选择实例',
  description:
    '选择要监控的阿里云实例，可以选择多个实例。如果不选择实例，将监控所有符合条件的实例。',
  emptyDescription: '暂无可用的实例',
  searchPlaceholder: '搜索实例ID或名称...',
  itemType: '实例',
  icon: <IconCloud />,
  dataTransformer: (instance) => {
    // When only userId exists without instanceId, use userId as id
    // This ensures title and display are correct
    const id =
      instance.instanceId ||
      instance.dimensions?.instanceId ||
      instance.dimensions?.userId ||
      instance.userId ||
      '';
    let name = instance.instanceName || instance.dimensions?.instanceName;
    if (!name) {
      if (instance.dimensions?.userId) {
        name = `userId: ${instance.dimensions.userId}`;
      } else if (instance.dimensions?.instanceId) {
        name = `instanceId: ${instance.dimensions.instanceId}`;
      } else {
        name = undefined;
      }
    }

    return {
      id,
      name,
      region: instance.region,
      dimensions: instance.dimensions,
    };
  },
  selectionAction,
  searchFilter: (instance, searchValue) => {
    const searchLower = searchValue.toLowerCase();
    return (
      (instance.instanceId?.toLowerCase() || '').includes(searchLower) ||
      (instance.instanceName?.toLowerCase() || '').includes(searchLower) ||
      (instance.region?.toLowerCase() || '').includes(searchLower) ||
      // When only userId exists, also support searching userId
      (instance.dimensions?.userId?.toLowerCase() || '').includes(
        searchLower,
      ) ||
      (instance.userId?.toLowerCase() || '').includes(searchLower)
    );
  },
  getId: (instance) =>
    instance.instanceId ||
    instance.dimensions?.instanceId ||
    instance.dimensions?.userId ||
    instance.userId ||
    '',
});

/**
 * Volcengine instance selection configuration
 */
export const createVolcengineConfig = (
  selectionAction: (instances: VolcengineInstance[]) => void,
): InstanceSelectionConfig<VolcengineInstance> => ({
  title: '选择实例',
  description: '选择要监控的火山引擎实例，可以选择多个实例',
  emptyDescription: '暂无可用的实例',
  searchPlaceholder: '搜索实例ID或名称...',
  itemType: '实例',
  icon: <IconCloud />,
  dataTransformer: (instance) => ({
    id: instance.instanceId,
    name: instance.instanceName,
    region: instance.region,
    dimensions: instance.dimensions,
    namespace: instance.namespace,
    subNamespace: instance.subNamespace,
  }),
  selectionAction,
  searchFilter: (instance, searchValue) =>
    instance.instanceId.toLowerCase().includes(searchValue) ||
    (instance.instanceName?.toLowerCase() || '').includes(searchValue) ||
    (instance.region?.toLowerCase() || '').includes(searchValue) ||
    (instance.namespace?.toLowerCase() || '').includes(searchValue),
  getId: (instance) => instance.instanceId,
});

/**
 * Zabbix host selection configuration
 */
export const createZabbixConfig = (
  selectionAction: (hosts: ZabbixHost[]) => void,
): InstanceSelectionConfig<ZabbixHost> => ({
  title: '选择主机',
  description: '选择要监控的主机，可以选择多个主机',
  emptyDescription: '暂无可用的主机',
  searchPlaceholder: '搜索主机名称...',
  itemType: '主机',
  icon: <IconDesktop />,
  dataTransformer: (host) => ({
    id: host.host, // Use host as unique identifier
    name: host.name,
    region: undefined, // Zabbix doesn't have region concept
    dimensions: undefined, // Zabbix doesn't have dimensions concept
  }),
  selectionAction,
  searchFilter: (host, searchValue) =>
    host.host.toLowerCase().includes(searchValue) ||
    host.name.toLowerCase().includes(searchValue),
  getId: (host) => host.host, // Use host as unique identifier
  useHostList: true, // Use special host list component
});
