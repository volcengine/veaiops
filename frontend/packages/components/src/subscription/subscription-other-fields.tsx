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

import { DatePicker, Form } from '@arco-design/web-react';
import type React from 'react';
import { Select } from '../form-control';

const { RangePicker } = DatePicker;

/**
 * Subscription relation form - Other fields component properties
 */
export interface SubscriptionOtherFieldsProps {
  /** Event level options */
  eventLevelOptions: Array<{ label: string; value: string }>;

  /** Whether to show strategy update tooltip */
  showStrategyTooltip?: boolean;

  /** Callback to hide strategy update tooltip */
  hideStrategyTooltip?: () => void;

  /** Whether event level is required */
  eventLevelRequired?: boolean;

  /** Event level placeholder */
  eventLevelPlaceholder?: string;

  /** Whether message card notification strategy is required */
  informStrategyRequired?: boolean;

  /** Message card notification strategy placeholder */
  informStrategyPlaceholder?: string;

  /** Strategy update tooltip component (optional, used to display update tooltip) */
  UpdateTooltipComponent?: React.ComponentType<{
    show?: boolean;
    message?: string;
    onHide?: () => void;
    children: React.ReactNode;
  }>;

  /** API client instance (used to fetch notification strategies) */
  apiClient?: {
    informStrategy?: {
      getApisV1ManagerEventCenterInformStrategy?: (params: {
        skip?: number;
        limit?: number;
      }) => Promise<unknown>;
    };
  };
}

/**
 * Subscription relation form - Other fields component
 *
 * @description Common field component for subscription relation form, includes:
 * - Event level selection
 * - Configuration effective time range
 * - Message card notification strategy selection
 *
 * @example
 * ```tsx
 * <SubscriptionOtherFields
 *   eventLevelOptions={eventLevelOptions}
 *   eventLevelRequired={true}
 *   informStrategyRequired={true}
 *   showStrategyTooltip={showTooltip}
 *   hideStrategyTooltip={hideTooltip}
 *   UpdateTooltipComponent={UpdateTooltip}
 *   apiClient={apiClient}
 * />
 * ```
 */
export const SubscriptionOtherFields: React.FC<
  SubscriptionOtherFieldsProps
> = ({
  eventLevelOptions,
  showStrategyTooltip = false,
  hideStrategyTooltip,
  eventLevelRequired = true,
  eventLevelPlaceholder = '请选择事件级别',
  informStrategyRequired = true,
  informStrategyPlaceholder = '请选择消息卡片通知策略',
  UpdateTooltipComponent,
  apiClient,
}) => {
  // Build event level rules
  const eventLevelRules = eventLevelRequired
    ? [{ required: true, message: '请选择事件级别' }]
    : undefined;

  // Build message card notification strategy rules
  const informStrategyRules = informStrategyRequired
    ? [{ required: true, message: '请选择消息卡片通知策略' }]
    : undefined;

  // Message card notification strategy selector
  const strategySelector = (
    <Select.Block
      isControl
      required={informStrategyRequired}
      formItemProps={{
        label: '消息卡片通知策略',
        field: 'inform_strategy_ids',
        rules: informStrategyRules,
      }}
      controlProps={{
        mode: 'multiple',
        placeholder: informStrategyPlaceholder,
        ...(apiClient?.informStrategy && {
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
        }),
      }}
    />
  );

  return (
    <>
      <Select.Block
        isControl
        required={eventLevelRequired}
        formItemProps={{
          label: '事件级别',
          field: 'event_level',
          rules: eventLevelRules,
        }}
        controlProps={{
          mode: 'multiple',
          placeholder: eventLevelPlaceholder,
          allowClear: !eventLevelRequired,
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

      {UpdateTooltipComponent ? (
        <UpdateTooltipComponent
          show={showStrategyTooltip}
          message="策略数据已更新"
          onHide={hideStrategyTooltip}
        >
          {strategySelector}
        </UpdateTooltipComponent>
      ) : (
        strategySelector
      )}
    </>
  );
};
