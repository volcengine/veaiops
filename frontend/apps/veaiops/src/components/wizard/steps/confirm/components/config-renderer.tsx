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
 * Configuration information rendering component
 * @description Renders configuration information for different data source types
 * @author AI Assistant
 * @date 2025-01-17
 */

import { Card, Descriptions } from '@arco-design/web-react';
import { CellRender, Tip } from '@veaiops/components';
import type React from 'react';
import { DataSourceType } from '../../../types';
import type { WizardState } from '../../../types';

export interface ConfigRendererProps {
  dataSourceType: DataSourceType;
  state: WizardState;
}

export const ConfigRenderer: React.FC<ConfigRendererProps> = ({
  dataSourceType,
  state,
}) => {
  const renderCombinedConfig = () => {
    const commonData = [
      {
        label: '数据源类型',
        value: (
          <CellRender.CustomOutlineTag>
            {dataSourceType === DataSourceType.ZABBIX && 'Zabbix'}
            {dataSourceType === DataSourceType.ALIYUN && '阿里云'}
            {dataSourceType === DataSourceType.VOLCENGINE && '火山引擎'}
          </CellRender.CustomOutlineTag>
        ),
      },
      {
        label: (
          <div className="flex items-center">
            <span>数据源名称</span>
            {!state.dataSourceName && <Tip content="在下一步填写数据源名称" />}
          </div>
        ),
        value: state.dataSourceName || (
          <span style={{ color: 'var(--color-text-3)' }}>未设置</span>
        ),
      },
      {
        label: '连接',
        value: state.selectedConnect?.name || '未选择',
      },
    ];

    let specificData: any[] = [];
    let cardTitle = '';

    if (dataSourceType === DataSourceType.ZABBIX) {
      cardTitle = 'Zabbix 配置信息';
      specificData = [
        {
          label: '模板',
          value: state.zabbix.selectedTemplate?.name || '未选择',
        },
        {
          label: '指标',
          value: state.zabbix.selectedMetric?.name || '未选择',
        },
        {
          label: '选择的主机',
          value: (
            <div className="flex flex-wrap gap-2">
              {state.zabbix.selectedHosts.map((host) => (
                <CellRender.CustomOutlineTag key={host.host}>
                  {host.name}
                </CellRender.CustomOutlineTag>
              ))}
            </div>
          ),
        },
      ];
    } else if (dataSourceType === DataSourceType.ALIYUN) {
      cardTitle = '阿里云 配置信息';
      specificData = [
        {
          label: '命名空间',
          value: state.aliyun.selectNamespace?.project || '未选择',
        },
        {
          label: '实例',
          value:
            state.aliyun.selectedInstances.length > 0
              ? state.aliyun.selectedInstances
                  .map(
                    (instance) => instance.instanceName || instance.instanceId,
                  )
                  .join(', ')
              : '未选择',
        },
        {
          label: '指标',
          value: state.aliyun.selectedMetric?.metricName || '未选择',
        },
      ];
    } else if (dataSourceType === DataSourceType.VOLCENGINE) {
      cardTitle = '火山引擎 配置信息';
      specificData = [
        {
          label: '产品',
          value: state.volcengine.selectedProduct?.name || '未选择',
        },
        {
          label: '实例',
          value:
            state.volcengine.selectedInstances.length > 0
              ? state.volcengine.selectedInstances
                  .map(
                    (instance) => instance.instanceName || instance.instanceId,
                  )
                  .join(', ')
              : '未选择',
        },
        {
          label: '指标',
          value: state.volcengine.selectedMetric?.metricName || '未选择',
        },
      ];
    }

    return (
      <Card title={cardTitle}>
        <Descriptions column={2} data={[...commonData, ...specificData]} />
      </Card>
    );
  };

  return <div>{renderCombinedConfig()}</div>;
};

export default ConfigRenderer;
