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
import { DatePicker, Form } from '@arco-design/web-react';
import { Select } from '@veaiops/components';
import type React from 'react';
import { UpdateTooltip } from '../../update-tooltip';

const { RangePicker } = DatePicker;

/**
 * Agent and strategy fields component parameters
 */
interface AgentStrategyFieldsProps {
  agentTypeOptions: Array<{ label: string; value: string }>;
  eventLevelOptions: Array<{ label: string; value: string }>;
  showStrategyTooltip?: boolean;
  hideStrategyTooltip?: () => void;
}

/**
 * Agent and message card notification strategy fields component
 */
export const AgentStrategyFields: React.FC<AgentStrategyFieldsProps> = ({
  agentTypeOptions,
  eventLevelOptions,
  showStrategyTooltip = false,
  hideStrategyTooltip,
}) => {
  return (
    <>
      <Select.Block
        isControl
        required
        formItemProps={{
          label: '智能体',
          field: 'agent_type',
          rules: [{ required: true, message: '请选择智能体' }],
        }}
        controlProps={{
          placeholder: '请选择智能体',
          options: agentTypeOptions,
        }}
      />

      <Select.Block
        isControl
        required
        formItemProps={{
          label: '事件级别',
          field: 'event_level',
          rules: [{ required: true, message: '请选择事件级别' }],
        }}
        controlProps={{
          mode: 'multiple',
          placeholder: '请选择事件级别',
          allowClear: true,
          options: eventLevelOptions,
        }}
      />

      <Form.Item
        label="配置生效时间"
        field="timeRange"
        rules={[{ required: true, message: '请选择生效时间范围' }]}
      >
        <RangePicker
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          placeholder={['开始时间', '结束时间']}
          className="w-full"
        />
      </Form.Item>

      <UpdateTooltip
        show={showStrategyTooltip}
        message="策略数据已更新"
        onHide={hideStrategyTooltip}
      >
        <Select.Block
          isControl
          required
          formItemProps={{
            label: '消息卡片通知策略',
            field: 'inform_strategy_ids',
            rules: [{ required: true, message: '请选择消息卡片通知策略' }],
          }}
          controlProps={{
            mode: 'multiple',
            placeholder: '请选择消息卡片通知策略',
            dataSource: {
              serviceInstance: apiClient.informStrategy,
              api: 'getApisV1ManagerEventCenterInformStrategy',
              payload: {},
              responseEntityKey: 'data',
              optionCfg: {
                labelKey: 'name',
                valueKey: 'id',
              },
            },
          }}
        />
      </UpdateTooltip>
    </>
  );
};
