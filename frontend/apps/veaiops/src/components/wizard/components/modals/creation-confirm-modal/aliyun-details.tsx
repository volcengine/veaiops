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
 * Aliyun data source configuration details component
 */

import { Descriptions, Divider, Space, Tag } from '@arco-design/web-react';
import type { DataType } from '@arco-design/web-react/es/Descriptions/interface';
import {
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

export const AliyunDetails: React.FC<{ state: WizardState }> = ({ state }) => {
  const step2Data: DataType = [
    {
      label: '项目/命名空间',
      value: <Ellipsis text={state.aliyun.selectNamespace?.project || '-'} />,
    },
  ];
  if (state.aliyun.selectNamespace?.description) {
    step2Data.push({
      label: '描述',
      value: <Ellipsis text={state.aliyun.selectNamespace.description} />,
    });
  }

  const step3Data: DataType = [
    {
      label: 'Region',
      // Read from state.aliyun.region (entered by user in connection selection step)
      value: <Ellipsis text={state.aliyun.region || '-'} />,
    },
    {
      label: '监控项名称',
      value: <Ellipsis text={state.aliyun.selectedMetric?.metricName || '-'} />,
    },
    {
      label: '命名空间',
      value: <Ellipsis text={state.aliyun.selectedMetric?.namespace || '-'} />,
    },
  ];
  if (state.aliyun.selectedGroupBy && state.aliyun.selectedGroupBy.length > 0) {
    step3Data.push({
      label: '分组维度',
      value: <Ellipsis text={state.aliyun.selectedGroupBy.join(', ')} />,
    });
  }

  const step4Data: DataType = [
    {
      label: '已选实例数量',
      value: (
        <Tag color="arcoblue">
          {state.aliyun.selectedInstances?.length || 0} 个
        </Tag>
      ),
      span: 12,
    },
  ];
  if (
    state.aliyun.selectedInstances &&
    state.aliyun.selectedInstances.length > 0
  ) {
    step4Data.push({
      label: '实例列表',
      value: (
        <CustomOutlineTagList
          dataList={state.aliyun.selectedInstances.map((instance, index) => ({
            name:
              instance.instanceName ||
              instance.instanceId ||
              `实例 ${index + 1}`,
            key: instance.instanceId || `instance-${index}`,
          }))}
          useEllipsis
        />
      ),
      span: 12, // Occupy full row
    });
  }

  const step5Data: DataType = [
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
    step5Data.push({
      label: '数据源描述',
      value: <Ellipsis text={state.dataSourceDescription} />,
    });
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {/* Step 1: Select connection */}
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 8,
            color: '#1d2129',
          }}
        >
          第1步：选择连接
        </div>
        <Descriptions
          size="small"
          column={1}
          border
          tableLayout="fixed"
          data={[
            {
              label: '连接名称',
              value: <Ellipsis text={state.selectedConnect?.name || '-'} />,
            },
          ]}
        />
      </div>

      {/* Step 2: Select namespace */}
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 8,
            color: '#1d2129',
          }}
        >
          第2步：选择命名空间
        </div>
        <Descriptions
          size="small"
          column={2}
          border
          data={step2Data}
          tableLayout="fixed"
        />
      </div>

      {/* Step 3: Select metric */}
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 8,
            color: '#1d2129',
          }}
        >
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

      {/* Step 4: Select instance */}
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 8,
            color: '#1d2129',
          }}
        >
          第4步：选择实例
        </div>
        <Descriptions
          size="small"
          column={2}
          border
          data={step4Data}
          tableLayout="fixed"
        />
      </div>

      {/* Step 5: Create data source */}
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 8,
            color: '#1d2129',
          }}
        >
          第5步：创建数据源
        </div>
        <Descriptions
          size="small"
          column={2}
          border
          data={step5Data}
          tableLayout="fixed"
        />
      </div>
    </Space>
  );
};
