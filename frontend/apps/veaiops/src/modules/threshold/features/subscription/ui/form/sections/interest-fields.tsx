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

import apiClient from '@/utils/api-client';
import { Form, Space } from '@arco-design/web-react';
import { Select } from '@veaiops/components';
import type React from 'react';
import { UpdateTooltip } from '../update-tooltip';

/**
 * Interest fields component props
 */
interface InterestFieldsProps {
  loading?: boolean;
  showProjectTooltip?: boolean;
  hideProjectTooltip?: () => void;
}

/**
 * Interest fields component
 * Contains product, project, and customer selection
 */
export const InterestFields: React.FC<InterestFieldsProps> = ({
  loading,
  showProjectTooltip = false,
  hideProjectTooltip,
}) => {
  return (
    <Form.Item label="配置关注属性">
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Products - hidden */}
        {/* <Select.Block ... /> */}

        {/* Projects */}
        <UpdateTooltip
          show={showProjectTooltip}
          message="项目数据已更新"
          onHide={hideProjectTooltip}
        >
          <Select.Block
            isControl
            required
            formItemProps={{
              style: { marginBottom: 10 },
              field: 'interest_projects',
              rules: [{ required: true, message: '请选择项目' }],
            }}
            controlProps={{
              mode: 'multiple',
              addBefore: '项目',
              placeholder: '请选择项目',
              disabled: loading,
              isDebouncedFetch: true,
              isCascadeRemoteSearch: true,
              isScrollFetching: true,
              isValueEmptyTriggerOptions: true,
              dataSource: {
                serviceInstance: apiClient.projects,
                api: 'getApisV1ManagerSystemConfigProjects',
                payload: {},
                responseEntityKey: 'data',
                optionCfg: {
                  labelKey: 'name',
                  valueKey: '_id',
                },
              },
            }}
          />
        </UpdateTooltip>

        {/* Customers - hidden */}
        {/* <Select.Block ... /> */}
      </Space>
    </Form.Item>
  );
};
