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
 * Instance selection config factory.
 * @description Provides predefined instance selection configs for different data sources.
 */

import { IconCloud, IconDesktop } from '@arco-design/web-react/icon';
import type { AliyunInstance, VolcengineInstance } from '@wizard/types';
import { checkMatch } from '@wizard/utils/filter';
import type { ZabbixHost } from 'api-generate';
import type { InstanceSelectionConfig } from './instance-selection-config';

/**
 * Aliyun instance selection config.
 */
export const createAliyunConfig = (
  selectionAction: (instances: AliyunInstance[]) => void,
): InstanceSelectionConfig<AliyunInstance> => ({
  title: '选择实例',
  description:
    'Select the Aliyun instances to monitor. Multiple instances can be selected. If no instance is selected, all matching instances will be monitored.',
  emptyDescription: 'No available instances',
  searchPlaceholder: 'Search by instance ID or name...',
  itemType: 'Instance',
  icon: <IconCloud />,
  dataTransformer: (instance) => {
    // When only userId exists (no instanceId), use userId as the id
    // This ensures the title and display are still meaningful
    const id =
      instance.instanceId ||
      instance.dimensions?.instanceId ||
      instance.dimensions?.userId ||
      (instance as AliyunInstance & { userId?: string }).userId ||
      '';
    const name =
      instance.instanceName ||
      instance.dimensions?.instanceName ||
      (instance.dimensions?.userId
        ? `userId: ${instance.dimensions.userId}`
        : instance.dimensions?.instanceId
          ? `instanceId: ${instance.dimensions.instanceId}`
          : undefined);

    return {
      id,
      name,
      region: instance.region,
      dimensions: instance.dimensions,
    };
  },
  selectionAction,
  searchFilter: (instance, searchValue) => {
    return (
      checkMatch(instance.instanceId, searchValue) ||
      checkMatch(instance.instanceName, searchValue) ||
      checkMatch(instance.region, searchValue) ||
      // When only userId exists, also allow searching by userId
      checkMatch(instance.dimensions?.userId, searchValue) ||
      checkMatch(
        (instance as AliyunInstance & { userId?: string }).userId,
        searchValue,
      )
    );
  },
  getId: (instance) =>
    instance.instanceId ||
    instance.dimensions?.instanceId ||
    instance.dimensions?.userId ||
    (instance as AliyunInstance & { userId?: string }).userId ||
    '',
});

/**
 * Volcengine instance selection config.
 */
export const createVolcengineConfig = (
  selectionAction: (instances: VolcengineInstance[]) => void,
): InstanceSelectionConfig<VolcengineInstance> => ({
  title: '选择实例',
  description:
    'Select Volcengine instances to monitor. Multiple instances can be selected.',
  emptyDescription: 'No available instances',
  searchPlaceholder: 'Search by instance ID or name...',
  itemType: 'Instance',
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
    checkMatch(instance.instanceId, searchValue) ||
    checkMatch(instance.instanceName, searchValue) ||
    checkMatch(instance.region, searchValue) ||
    checkMatch(instance.namespace, searchValue),
  getId: (instance) => instance.instanceId,
});

/**
 * Zabbix host selection config.
 */
export const createZabbixConfig = (
  selectionAction: (hosts: ZabbixHost[]) => void,
): InstanceSelectionConfig<ZabbixHost> => ({
  title: '选择主机',
  description: 'Select the hosts to monitor. Multiple hosts can be selected.',
  emptyDescription: 'No available hosts',
  searchPlaceholder: 'Search host name (supports regex)...',
  itemType: 'Host',
  icon: <IconDesktop />,
  dataTransformer: (host) => ({
    id: host.host, // Use host as the unique identifier
    name: host.name,
    region: undefined, // Zabbix has no region concept
    dimensions: undefined, // Zabbix has no dimensions concept
  }),
  selectionAction,
  searchFilter: (host, searchValue) =>
    checkMatch(host.host, searchValue) || checkMatch(host.name, searchValue),
  getId: (host) => host.host, // Use host as the unique identifier
  useHostList: true, // Use the specialized host list component
});
