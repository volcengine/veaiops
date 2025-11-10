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
 * Volcengine data source configuration details component
 */

import { Descriptions, Divider, Space, Tag } from '@arco-design/web-react';
import type { DataType } from '@arco-design/web-react/es/Descriptions/interface';
import {
  IconApps,
  IconCloud,
  IconDesktop,
  IconLink,
  IconStorage,
} from '@arco-design/web-react/icon';
import { CellRender } from '@veaiops/components';
import type React from 'react';
import type { WizardState } from '../../../types';

const { Ellipsis, CustomOutlineTagList } = CellRender;

// Step title component
const StepTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({
  icon,
  title,
}) => (
  <div
    style={{
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 10,
      color: '#1d2129',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #e8f3ff 0%, #f2f8ff 100%)',
        color: '#165dff',
      }}
    >
      {icon}
    </div>
    <span>{title}</span>
  </div>
);

export const VolcengineDetails: React.FC<{ state: WizardState }> = ({
  state,
}) => {
  const step2Data: DataType = [
    {
      label: '产品名称',
      value: <Ellipsis text={state.volcengine.selectedProduct?.name || '-'} />,
    },
  ];
  if (state.volcengine.selectedProduct?.namespace) {
    step2Data.push({
      label: '命名空间',
      value: <Ellipsis text={state.volcengine.selectedProduct.namespace} />,
    });
  }

  const step3Data: DataType = [
    {
      label: 'Region',
      value: <Ellipsis text={state.volcengine.region || '-'} />,
    },
    {
      label: '子命名空间',
      value: <Ellipsis text={state.volcengine.selectedSubNamespace || '-'} />,
    },
  ];

  const step4Data: DataType = [
    {
      label: '监控项名称',
      value: (
        <Ellipsis text={state.volcengine.selectedMetric?.metricName || '-'} />
      ),
    },
  ];
  if (state.volcengine.selectedMetric?.namespace) {
    step4Data.push({
      label: '命名空间',
      value: <Ellipsis text={state.volcengine.selectedMetric.namespace} />,
    });
  }
  if (state.volcengine.selectedMetric?.subNamespace) {
    step4Data.push({
      label: '子命名空间',
      value: <Ellipsis text={state.volcengine.selectedMetric.subNamespace} />,
    });
  }
  if (state.volcengine.selectedMetric?.unit) {
    step4Data.push({
      label: '单位',
      value: <Ellipsis text={state.volcengine.selectedMetric.unit} />,
    });
  }

  const step5Data: DataType = [
    {
      label: '已选实例数量',
      value: (
        <Tag color="arcoblue">
          {state.volcengine.selectedInstances?.length || 0} 个
        </Tag>
      ),
    },
  ];
  if (
    state.volcengine.selectedInstances &&
    state.volcengine.selectedInstances.length > 0
  ) {
    step5Data.push({
      label: '实例列表',
      value: (
        <CustomOutlineTagList
          dataList={state.volcengine.selectedInstances.map(
            (instance, index) => {
              // Get DiskName for displaying instance + disk information
              const diskName = instance.dimensions?.DiskName;

              // Build display name: instanceId (Disk: DiskName)
              const displayName = diskName
                ? `${instance.instanceId} (磁盘: ${diskName})`
                : instance.instanceName ||
                  instance.instanceId ||
                  `实例 ${index + 1}`;

              // Generate unique key: combine instanceId + DiskName
              const uniqueKey = diskName
                ? `${instance.instanceId}-${diskName}`
                : instance.instanceId || `instance-${index}`;

              return {
                name: displayName,
                key: uniqueKey,
              };
            },
          )}
          useEllipsis={true}
        />
      ),
      span: 1, // Occupy full row
    });
  }

  const step6Data: DataType = [
    {
      label: '数据源名称',
      value: state.dataSourceName ? (
        <Ellipsis text={state.dataSourceName} />
      ) : (
        <span style={{ color: 'var(--color-text-3)' }}>未设置</span>
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
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      {/* Step 1: Select connection */}
      <div>
        <StepTitle icon={<IconLink />} title="第1步：选择连接" />
        <Descriptions
          size="medium"
          column={1}
          border
          labelStyle={{ background: '#fafbfc', fontWeight: 500 }}
          data={[
            {
              label: '连接名称',
              value: <Ellipsis text={state.selectedConnect?.name || '-'} />,
            },
          ]}
        />
      </div>

      {/* Step 2: Select product */}
      <div>
        <StepTitle icon={<IconCloud />} title="第2步：选择产品" />
        <Descriptions
          size="medium"
          column={2}
          border
          labelStyle={{ background: '#fafbfc', fontWeight: 500 }}
          data={step2Data}
        />
      </div>

      {/* Step 3: Select sub-namespace */}
      <div>
        <StepTitle icon={<IconApps />} title="第3步：选择子命名空间" />
        <Descriptions
          size="medium"
          column={2}
          border
          labelStyle={{ background: '#fafbfc', fontWeight: 500 }}
          data={step3Data}
        />
      </div>

      <Divider style={{ margin: 0 }} />

      {/* Step 4: Select metric */}
      <div>
        <StepTitle icon={<IconStorage />} title="第4步：选择监控项" />
        <Descriptions
          size="medium"
          column={2}
          border
          labelStyle={{ background: '#fafbfc', fontWeight: 500 }}
          data={step4Data}
        />
      </div>

      {/* Step 5: Select instance */}
      <div>
        <StepTitle icon={<IconDesktop />} title="第5步：选择实例" />
        <Descriptions
          size="medium"
          column={1}
          border
          labelStyle={{ background: '#fafbfc', fontWeight: 500 }}
          data={step5Data}
        />
      </div>
    </Space>
  );
};
