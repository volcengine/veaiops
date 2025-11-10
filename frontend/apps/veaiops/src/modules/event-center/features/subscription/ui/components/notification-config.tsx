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
import { Alert, Button, Card } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { CardTemplateConfigMessage } from '@ec/strategy';
import { SelectBlock } from '@veaiops/components';
import type React from 'react';
import { UpdateTooltip } from '../update-tooltip';

/**
 * Message card notification strategy configuration component props interface
 */
interface NotificationConfigProps {
  strategyRefreshTrigger: number;
  onOpenStrategyCreate: () => void;
  showStrategyTooltip?: boolean;
  hideStrategyTooltip?: () => void;
}

/**
 * Message card notification strategy configuration component
 * Contains message card notification strategy configuration
 */
export const NotificationConfig: React.FC<NotificationConfigProps> = ({
  strategyRefreshTrigger,
  onOpenStrategyCreate,
  showStrategyTooltip = false,
  hideStrategyTooltip,
}) => {
  return (
    <Card title="消息卡片消息卡片通知策略" className="mb-4">
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        content={<CardTemplateConfigMessage />}
      />
      <UpdateTooltip
        show={showStrategyTooltip}
        message="策略数据已更新"
        onHide={hideStrategyTooltip || (() => {})}
      >
        <SelectBlock
          isControl
          formItemProps={{
            label: '消息卡片通知策略',
            field: 'inform_strategy_ids',
            extra: (
              <Button
                type="text"
                size="small"
                icon={<IconPlus />}
                onClick={onOpenStrategyCreate}
              >
                添加策略管理
              </Button>
            ),
          }}
          controlProps={{
            mode: 'multiple',
            placeholder: '请选择消息卡片通知策略',
            dependency: strategyRefreshTrigger,
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
    </Card>
  );
};

export default NotificationConfig;
