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
 * ModalContent - Confirmation modal content component
 * @description Renders the main content area of the modal
 */

import { Descriptions, Space } from '@arco-design/web-react';
import { DataSource } from '@veaiops/api-client';
import { CellRender } from '@veaiops/components';
import type React from 'react';
import type { DataSourceType, WizardState } from '../../../types';
import { AliyunDetails } from './aliyun-details';
import { VolcengineDetails } from './volcengine-details';
import { ZabbixDetails } from './zabbix-details';

const { Ellipsis, CustomOutlineTag } = CellRender;

export interface ModalContentProps {
  state: WizardState;
  selectedType: DataSourceType;
  dataSourceTypeText: string;
  isEditMode?: boolean;
}

/**
 * Modal content component
 */
export const ModalContent: React.FC<ModalContentProps> = ({
  state,
  selectedType,
  dataSourceTypeText,
  isEditMode = false,
}) => {
  // Render corresponding details component based on data source type
  const renderDetails = () => {
    switch (selectedType) {
      case DataSource.type.ZABBIX:
        return <ZabbixDetails state={state} />;
      case DataSource.type.ALIYUN:
        return <AliyunDetails state={state} />;
      case DataSource.type.VOLCENGINE:
        return <VolcengineDetails state={state} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ paddingTop: 4 }}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* Basic information */}
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 12,
              color: '#1d2129',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 4,
                height: 16,
                background: '#165dff',
                marginRight: 8,
                borderRadius: 2,
              }}
            />
            基本信息
          </div>
          <Descriptions
            size="small"
            column={2}
            border
            data={[
              {
                label: '数据源名称',
                value: <Ellipsis text={state.dataSourceName} />,
              },
              {
                label: '数据源类型',
                value: (
                  <CustomOutlineTag>{dataSourceTypeText}</CustomOutlineTag>
                ),
              },
            ]}
          />
        </div>

        {/* Configuration details */}
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 12,
              color: '#1d2129',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 4,
                height: 16,
                background: '#165dff',
                marginRight: 8,
                borderRadius: 2,
              }}
            />
            配置详情
          </div>
          <div className="max-h-[500px] overflow-auto pr-1">
            {renderDetails()}
          </div>
        </div>
      </Space>
      {/* Hint information */}
      <div className="text-gray-600 text-sm leading-[22px] mt-4 py-3 px-4 bg-gray-100 rounded border-l-[3px] border-l-blue-500">
        {isEditMode
          ? '您即将更新以下数据源，请确认信息无误后点击"确定"继续更新。'
          : '您即将创建以下数据源，请确认信息无误后点击"确定"继续创建。'}
      </div>
    </div>
  );
};
