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

import { Select } from '@veaiops/components';
import type React from 'react';
import { useMemo } from 'react';
import {
  getAliyunContactGroupDataSource,
  getVolcengineContactGroupDataSource,
  getZabbixContactGroupDataSource,
} from './contact-group-datasource';

interface ContactGroupSelectorProps {
  loading: boolean;
  datasourceType: string;
  datasourceId: string;
}

/**
 * Contact group selector component
 *
 * Supports Volcengine and Aliyun data sources:
 * - Volcengine: Uses DataSourceSetter configuration approach
 * - Aliyun: Uses functional data source (requires getting connect_id first)
 */
export const ContactGroupSelector: React.FC<ContactGroupSelectorProps> = ({
  loading,
  datasourceType,
  datasourceId,
}) => {
  // 🔧 Fix: Use useMemo to cache dataSource, avoid creating new function reference on every render causing Select component rebuild
  const dataSource = useMemo(() => {
    if (datasourceType === 'Volcengine') {
      return getVolcengineContactGroupDataSource(datasourceId);
    }
    if (datasourceType === 'Aliyun') {
      return getAliyunContactGroupDataSource(datasourceId);
    }
    if (datasourceType === 'Zabbix') {
      return getZabbixContactGroupDataSource(datasourceId);
    }
    return undefined;
  }, [datasourceType, datasourceId]);

  // 🔧 Fix: Use useMemo to cache dependency array, avoid creating new array on every render causing Select component rebuild
  const dependency = useMemo(
    () => [datasourceId, datasourceType],
    [datasourceId, datasourceType],
  );

  // Generate friendly label and hint text based on datasource type
  const labelText = datasourceType === 'Zabbix' ? '告警组' : '联系组';
  const placeholderText =
    datasourceType === 'Zabbix' ? '请选择告警组' : '请选择联系组';
  const extraHint = ['Volcengine', 'Zabbix'].includes(datasourceType)
    ? `选择${labelText}后，需同时配置告警通知方式才会发送通知`
    : '可选配置，不选择时仅通过Webhook投递';

  // Set search field based on datasource type
  // Volcengine/Zabbix: name (lowercase)
  // Aliyun: Name (uppercase N)
  const searchKey = datasourceType === 'Aliyun' ? 'Name' : 'name';

  return (
    <Select.Block
      isControl
      formItemProps={{
        label: labelText,
        field: 'contactGroupId',
        rules: [{ required: false, message: `请选择${labelText}` }],
        extra: extraHint,
      }}
      controlProps={{
        placeholder: placeholderText,
        disabled: loading || !datasourceId,
        canFetch: Boolean(datasourceId),
        isDebouncedFetch: true,
        isScrollFetching: true,
        dependency,
        searchKey,
        dataSource,
      }}
    />
  );
};
