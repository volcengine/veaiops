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

import { Card, Form } from '@arco-design/web-react';
import type React from 'react';
import {
  AlarmLevelSelector,
  AlertMethodsSelector,
  ContactGroupSelector,
} from './selectors';

interface AlarmConfigFormProps {
  form: any;
  loading: boolean;
  datasourceType: string;
  datasourceId: string;
}

/**
 * Alarm configuration form component
 *
 * Used to configure alarm rules for intelligent threshold tasks, including:
 * 1. Alarm level (required for all data sources)
 * 2. Contact group (optional for Volcengine and Aliyun)
 * 3. Alert notification method (optional only for Volcengine)
 *
 * @param form - Arco Form instance
 * @param loading - Loading state
 * @param datasourceType - Data source type (Volcengine | Aliyun | Zabbix)
 * @param datasourceId - Data source ID
 */
export const AlarmConfigForm: React.FC<AlarmConfigFormProps> = ({
  form,
  loading,
  datasourceType,
  datasourceId,
}) => {
  // Determine whether to show alert notification method selector
  const showAlertMethods = ['Volcengine', 'Zabbix'].includes(datasourceType);

  return (
    <Card
      title="全局告警配置"
      style={{
        marginBottom: 16,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      }}
    >
      <Form layout="vertical" form={form} disabled={loading}>
        {/* Alarm level - required for all data sources */}
        <AlarmLevelSelector loading={loading} />

        {/* Alert notification method - only required for Volcengine and Zabbix */}
        {showAlertMethods && (
          <AlertMethodsSelector
            loading={loading}
            datasourceType={datasourceType}
            datasourceId={datasourceId}
          />
        )}

        {/* Contact group */}
        <ContactGroupSelector
          loading={loading}
          datasourceType={datasourceType}
          datasourceId={datasourceId}
        />
      </Form>
    </Card>
  );
};
