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

import { Descriptions, Drawer } from '@arco-design/web-react';
// ✅ Optimization: Use unified export
import { channelInfoMap } from '@ec/strategy';
import { CellRender } from '@veaiops/components';
import type { InformStrategy } from 'api-generate';
import type React from 'react';

const { StampTime } = CellRender;

/**
 * Strategy detail drawer component props interface
 */
export interface StrategyDetailDrawerProps {
  /** Whether to show drawer */
  visible: boolean;
  /** Selected strategy */
  selectedStrategy: InformStrategy | null;
  /** Callback to close drawer */
  onClose: () => void;
}

/**
 * Strategy detail drawer component
 * Provides functionality to view strategy details
 */
export const StrategyDetailDrawer: React.FC<StrategyDetailDrawerProps> = ({
  visible,
  selectedStrategy,
  onClose,
}) => {
  if (!selectedStrategy) {
    return null;
  }

  return (
    <Drawer
      title="策略详情"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Descriptions
        column={1}
        labelStyle={{ width: '120px', fontWeight: 500 }}
        data={[
          {
            label: '策略名称',
            value: selectedStrategy.name || '-',
          },
          {
            label: '策略ID',
            value: selectedStrategy.id || '-',
          },
          {
            label: '描述',
            value: selectedStrategy.description || '--',
          },
          {
            label: '企业协同工具',
            value:
              channelInfoMap[selectedStrategy.channel]?.label ||
              selectedStrategy.channel ||
              '-',
          },
          {
            label: '通知机器人',
            value: selectedStrategy.bot?.name || '-',
          },
          {
            label: '通知群',
            value: selectedStrategy.group_chats?.length
              ? selectedStrategy.group_chats
                  .map((chat) => chat.chat_name || chat.id)
                  .join('、')
              : '-',
          },
          {
            label: '创建时间',
            value: '-', // InformStrategy type does not include created_at field
          },
          {
            label: '更新时间',
            value: '-', // InformStrategy type does not include updated_at field
          },
        ]}
      />
    </Drawer>
  );
};

export default StrategyDetailDrawer;
