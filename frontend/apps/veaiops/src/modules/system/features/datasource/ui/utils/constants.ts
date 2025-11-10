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
 * Configuration field translation mapping
 */
export const CONFIG_FIELD_TRANSLATIONS: Record<string, string> = {
  // Aliyun field translations
  aliyun_connect_name: '连接',
  aliyun_metric_name: '监控项',
  aliyun_region: '地域',
  aliyun_namespace: '命名空间',
  aliyun_group_by: '维度',
  aliyun_dimensions: '实例列表',
  // Volcengine field translations
  volcengine_connect_name: '连接名称',
  volcengine_metric_name: '监控项',
  volcengine_region: '地域',
  volcengine_namespace: '命名空间',
  volcengine_sub_namespace: '子命名空间',
  volcengine_instances: '实例列表',
  // Zabbix field translations
  zabbix_connect_name: '连接',
  zabbix_metric_name: '监控项',
  zabbix_targets: '主机列表',
};
