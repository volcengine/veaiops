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
 * 实例选择配置工厂
 * @description 为不同数据源提供预定义的配置
 */

import { IconCloud, IconDesktop } from '@arco-design/web-react/icon';
import type { AliyunInstance, VolcengineInstance } from '@wizard/types';
import { checkMatch } from '@wizard/utils/filter';
import type { ZabbixHost } from 'api-generate';
import type { InstanceSelectionConfig } from './instance-selection-config';

/**
 * 阿里云实例选择配置
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
    // 当只有 userId 而没有 instanceId 时，使用 userId 作为 id
    // 这样可以确保标题和显示正确
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
      // 当只有 userId 时，也支持搜索 userId
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
 * 火山引擎实例选择配置
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
    checkMatch(instance.instanceId, searchValue) ||
    checkMatch(instance.instanceName, searchValue) ||
    checkMatch(instance.region, searchValue) ||
    checkMatch(instance.namespace, searchValue),
  getId: (instance) => instance.instanceId,
});

/**
 * Zabbix主机选择配置
 */
export const createZabbixConfig = (
  selectionAction: (hosts: ZabbixHost[]) => void,
): InstanceSelectionConfig<ZabbixHost> => ({
  title: '选择主机',
  description: '选择要监控的主机，可以选择多个主机',
  emptyDescription: '暂无可用的主机',
  searchPlaceholder: '搜索主机名称 (支持正则)...',
  itemType: '主机',
  icon: <IconDesktop />,
  dataTransformer: (host) => ({
    id: host.host, // 使用 host 作为唯一标识
    name: host.name,
    region: undefined, // Zabbix没有region概念
    dimensions: undefined, // Zabbix没有dimensions概念
  }),
  selectionAction,
  searchFilter: (host, searchValue) =>
    checkMatch(host.host, searchValue) || checkMatch(host.name, searchValue),
  getId: (host) => host.host, // 使用 host 作为唯一标识
  useHostList: true, // 使用特殊的主机列表组件
});
