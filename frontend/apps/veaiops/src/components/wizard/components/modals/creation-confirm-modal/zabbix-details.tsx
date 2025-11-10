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
 * Zabbix data source configuration details component
 */

import { Descriptions, Space } from '@arco-design/web-react';
import type { DataType } from '@arco-design/web-react/es/Descriptions/interface';
import { CellRender } from '@veaiops/components';
import type React from 'react';
import type { WizardState } from '../../../types';

const { Ellipsis, CustomOutlineTagList } = CellRender;

export const ZabbixDetails: React.FC<{ state: WizardState }> = ({ state }) => {
  const step2Data: DataType = [
    {
      label: '模板名称',
      value: <Ellipsis text={state.zabbix.selectedTemplate?.name || '-'} />,
    },
  ];
  if (state.zabbix.selectedTemplate?.templateid) {
    step2Data.push({
      label: '模板ID',
      value: <Ellipsis text={state.zabbix.selectedTemplate.templateid} />,
    });
  }

  const step3Data: DataType = [
    {
      label: '监控项名称',
      value: <Ellipsis text={state.zabbix.selectedMetric?.name || '-'} />,
    },
    {
      label: '监控项Key',
      value: (
        <Ellipsis text={state.zabbix.selectedMetric?.metric_name || '-'} />
      ),
    },
    {
      label: '数据类型',
      value: (
        <Ellipsis
          text={(() => {
            const history = state.zabbix.selectedMetric?.history;
            if (history === '0') {
              return 'Float';
            }
            if (history === '3') {
              return 'Integer';
            }
            return history || '-';
          })()}
        />
      ),
    },
  ];

  const step4Data: DataType = [
    {
      label: '已选主机数量',
      value: `${state.zabbix.selectedHosts?.length || 0} 台`,
    },
  ];
  if (state.zabbix.selectedHosts && state.zabbix.selectedHosts.length > 0) {
    step4Data.push({
      label: '主机列表',
      value: (
        <CustomOutlineTagList
          dataList={state.zabbix.selectedHosts.map((host, index) => ({
            name: host.name || host.host,
            key: host.host || `host-${index}`,
          }))}
          useEllipsis={true}
        />
      ),
      span: 1, // Occupy a full row
    });
  }

  const step5Data: DataType = [
    {
      label: '监控Items数量',
      value: `${state.zabbix.items?.length || 0} 台`,
    },
  ];
  if (state.zabbix.items && state.zabbix.items.length > 0) {
    step5Data.push({
      label: 'Items列表',
      value: (
        <CustomOutlineTagList
          dataList={state.zabbix.items.map((item, index) => ({
            name: `${item.hostname} - ItemID: ${item.itemid}`,
            key: item.itemid || `item-${index}`,
          }))}
          useEllipsis={true}
        />
      ),
      span: 1,
    });
  }

  const step6Data: DataType = [
    {
      label: '数据源名称',
      value: state.dataSourceName ? (
        <Ellipsis text={state.dataSourceName} />
      ) : (
        <span className="text-gray-400">未设置</span>
      ),
    },
  ];
  if (state.dataSourceDescription) {
    step6Data.push({
      label: '数据源描述',
      value: <Ellipsis text={state.dataSourceDescription} />,
    });
  }

  return (
    <Space direction="vertical" size={16} className="w-full">
      {/* Step 1: Select connection */}
      <div>
        <div className="text-sm font-semibold mb-2 text-gray-900">
          第1步：选择连接
        </div>
        <Descriptions
          size="small"
          column={1}
          border
          data={[
            {
              label: '连接名称',
              value: <Ellipsis text={state.selectedConnect?.name || '-'} />,
            },
          ]}
          tableLayout="fixed"
        />
      </div>

      {/* Step 2: Select template */}
      <div>
        <div className="text-sm font-semibold mb-2 text-gray-900">
          第2步：选择模板
        </div>
        <Descriptions
          size="small"
          column={2}
          border
          data={step2Data}
          tableLayout="fixed"
        />
      </div>

      {/* Step 3: Select monitoring item */}
      <div>
        <div className="text-sm font-semibold mb-2 text-gray-900">
          第3步：选择监控项
        </div>
        <Descriptions
          size="small"
          column={2}
          border
          data={step3Data}
          tableLayout="fixed"
        />
      </div>

      {/* Step 4: Select hosts */}
      <div>
        <div className="text-sm font-semibold mb-2 text-gray-900">
          第4步：选择主机
        </div>
        <Descriptions
          size="small"
          column={1}
          border
          data={step4Data}
          tableLayout="fixed"
        />
      </div>

      {/* Step 5: Confirm configuration */}
      <div>
        <div className="text-sm font-semibold mb-2 text-gray-900">
          第5步：确认配置
        </div>
        <Descriptions
          size="small"
          column={1}
          border
          data={step5Data}
          tableLayout="fixed"
        />
      </div>
    </Space>
  );
};
