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

import { Alert } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react/es/Form';
import { LinkRender, Select } from '@veaiops/components';
import { logger } from '@veaiops/utils';
import type React from 'react';

/**
 * Datasource section component parameters
 */
interface DatasourceSectionProps {
  form: FormInstance;
  loading: boolean;
  datasourceType: string | undefined;
  setDatasourceType: (type: string) => void;
  datasourceDataSource: any;
}

/**
 * Datasource configuration section
 */
export const DatasourceSection: React.FC<DatasourceSectionProps> = ({
  form,
  loading,
  datasourceType,
  setDatasourceType,
  datasourceDataSource,
}) => {
  return (
    <>
      {/* Timeseries datasource type */}
      <Select.Block
        isControl
        inline
        required
        formItemProps={{
          label: '监控数据源类型',
          field: 'datasourceType',
          rules: [{ required: true, message: '监控数据源类型必填' }],
          extra: '选择监控数据的来源平台',
        }}
        controlProps={{
          placeholder: '请选择数据源类型',
          onChange: (value: string | undefined) => {
            logger.info({
              message: '🔍 监控数据源类型变化',
              data: {
                oldValue: datasourceType,
                newValue: value,
                timestamp: Date.now(),
              },
              source: 'DatasourceSection',
              component: 'onChange',
            });
            setDatasourceType(value as string);
            form.setFieldValue('datasourceId', undefined);
          },
          options: [
            { label: '火山引擎', value: 'Volcengine' },
            { label: '阿里云', value: 'Aliyun' },
            { label: 'Zabbix', value: 'Zabbix' },
          ],
          disabled: loading,
        }}
      />

      {/* Timeseries datasource */}
      <Select.Block
        isControl
        inline
        required
        formItemProps={{
          label: '监控数据源',
          field: 'datasourceId',
          rules: [{ required: true, message: '请选择数据源' }],
          extra: '选择具体的监控数据源实例',
        }}
        controlProps={{
          placeholder: '请选择数据源',
          disabled: !datasourceType || loading,
          canFetch: Boolean(datasourceType),
          isDebouncedFetch: true,
          isCascadeRemoteSearch: true,
          isScrollFetching: true,
          isValueEmptyTriggerOptions: true,
          dependency: [datasourceType],
          searchKey: 'name',
          dataSource: datasourceDataSource,
          dropdownRender: (dom: React.ReactNode) => {
            // Build create datasource link with datasource_type and returnUrl parameters
            const currentUrl =
              window.location.pathname + window.location.search;
            const createDataSourceUrl = datasourceType
              ? `/system/datasource?dataSourceWizardShow=true&datasource_type=${encodeURIComponent(datasourceType)}&returnUrl=${encodeURIComponent(currentUrl)}`
              : '/system/datasource?dataSourceWizardShow=true';

            return (
              <div className={'w-[100%]'}>
                <Alert
                  showIcon={false}
                  content={
                    <div
                      className="flex items-center gap-1 nowrap"
                      style={{ fontWeight: 'bold' }}
                    >
                      <div style={{ whiteSpace: 'nowrap' }}>找不到数据源？</div>
                      <LinkRender
                        ellipsisStyle={{ width: 'auto' }}
                        text={'创建监控数据源'}
                        link={createDataSourceUrl}
                      />
                    </div>
                  }
                />
                {dom}
              </div>
            );
          },
        }}
      />
    </>
  );
};
