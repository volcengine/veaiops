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
import { logger } from '@veaiops/utils';
import type React from 'react';
import { useMemo, useRef } from 'react';
import { ALERT_METHODS_OPTIONS } from '../../shared/constants';
import { getZabbixAlertMethodsDataSource } from './contact-group-datasource';

interface AlertMethodsSelectorProps {
  loading: boolean;
  datasourceType?: string;
  datasourceId?: string;
}

/**
 * Alert notification method selector component
 *
 * Volcengine and Zabbix data sources require this configuration
 * - Volcengine: After selecting alert notification method, notifications will be sent through selected contact group
 * - Zabbix: After selecting media type (mediatypes), notifications will be sent through selected user group
 */
export const AlertMethodsSelector: React.FC<AlertMethodsSelectorProps> = ({
  loading,
  datasourceType,
  datasourceId,
}) => {
  // Create component instance ID
  const componentIdRef = useRef(
    `AlertMethodsSelector_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`,
  );
  const renderCountRef = useRef(0);
  renderCountRef.current++;

  logger.info({
    message: '🔄 AlertMethodsSelector渲染',
    data: {
      componentId: componentIdRef.current,
      renderCount: renderCountRef.current,
      datasourceType,
      datasourceId,
      loading,
    },
    source: 'AlarmDrawer',
    component: 'AlertMethodsSelector',
  });

  // Determine datasource type, use different data sources
  const isZabbix = datasourceType === 'Zabbix';

  // 🔧 Fix: Use useMemo to cache dataSource, avoid creating new function reference on every render causing Select component rebuild
  const dataSource = useMemo(() => {
    const ds = isZabbix
      ? getZabbixAlertMethodsDataSource(datasourceId || '')
      : undefined;
    logger.debug({
      message: 'dataSource重新计算',
      data: {
        componentId: componentIdRef.current,
        isZabbix,
        datasourceId,
        hasDataSource: Boolean(ds),
      },
      source: 'AlarmDrawer',
      component: 'AlertMethodsSelector',
    });
    return ds;
  }, [isZabbix, datasourceId]);

  // 🔧 Fix: Use useMemo to cache dependency array, avoid creating new array on every render causing Select component rebuild
  const dependency = useMemo(() => {
    const dep = [datasourceId, datasourceType];
    logger.debug({
      message: 'dependency重新计算',
      data: {
        componentId: componentIdRef.current,
        dependency: dep,
      },
      source: 'AlarmDrawer',
      component: 'AlertMethodsSelector',
    });
    return dep;
  }, [datasourceId, datasourceType]);

  const placeholderText = isZabbix
    ? '请选择告警通知方式（Zabbix媒介类型）'
    : '请选择告警通知方式';
  const extraHint = isZabbix
    ? '选择Zabbix的媒介类型作为告警通知方式'
    : '选择告警通知方式后，将通过选中的联系组发送通知';

  // If Volcengine, use static options
  if (!isZabbix) {
    return (
      <Select.Block
        isControl
        formItemProps={{
          label: '告警通知方式',
          field: 'alertMethods',
          rules: [{ required: false, message: '请选择告警通知方式' }],
          extra: extraHint,
        }}
        controlProps={{
          mode: 'multiple',
          placeholder: placeholderText,
          options: ALERT_METHODS_OPTIONS,
          allowClear: true,
          disabled: loading,
        }}
      />
    );
  }

  // If Zabbix, use dynamic data source
  return (
    <Select.Block
      isControl
      formItemProps={{
        label: '告警通知方式',
        field: 'alertMethods',
        rules: [{ required: false, message: '请选择告警通知方式' }],
        extra: extraHint,
      }}
      controlProps={{
        mode: 'multiple',
        placeholder: placeholderText,
        disabled: loading || !datasourceId,
        canFetch: Boolean(datasourceId),
        isDebouncedFetch: true,
        isScrollFetching: true,
        dependency,
        dataSource,
      }}
    />
  );
};
