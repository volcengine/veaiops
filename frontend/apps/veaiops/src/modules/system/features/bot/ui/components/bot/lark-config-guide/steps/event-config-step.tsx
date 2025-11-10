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

import { Button, Input, Tooltip, Typography } from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import type React from 'react';
import { EventsCollapse } from '../../events-collapse';

const { Text } = Typography;

interface EventConfigStepProps {
  hookUrl: string;
  onCopy: (text: string) => Promise<boolean>;
}

/**
 * Event configuration step component
 */
export const EventConfigStep: React.FC<EventConfigStepProps> = ({
  hookUrl,
  onCopy,
}) => {
  return (
    <div>
      <Text type="secondary" className="block mb-1">
        1.
        在「事件配置」的订阅方式中，选择"将事件发送至开发者服务器"，请求地址填写：
      </Text>
      <Input
        value={hookUrl}
        readOnly
        size="small"
        suffix={
          <Tooltip content="复制">
            <Button
              type="text"
              size="small"
              icon={<IconCopy style={{ fontSize: '12px' }} />}
              onClick={() => onCopy(hookUrl)}
            />
          </Tooltip>
        }
      />
      <EventsCollapse />
    </div>
  );
};
