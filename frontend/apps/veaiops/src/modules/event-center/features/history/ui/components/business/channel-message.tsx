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

import { Tag, Typography } from '@arco-design/web-react';
import { STYLES } from '@ec/shared';
import type { Event } from 'api-generate';
import type React from 'react';

const { Text } = Typography;

/**
 * Channel message component props interface
 */
interface ChannelMessageProps {
  selectedRecord: Event;
}

/**
 * Channel message component
 * Displays channel message information of the event
 */
export const ChannelMessage: React.FC<ChannelMessageProps> = ({
  selectedRecord,
}) => {
  if (
    !selectedRecord.channel_msg ||
    Object.keys(selectedRecord.channel_msg).length === 0
  ) {
    return (
      <div
        className="text-center py-10 px-10 rounded-lg border border-dashed border-[#E5E6EB]"
        style={{
          color: STYLES.TEXT_SECONDARY,
          backgroundColor: STYLES.BACKGROUND_LIGHT,
          borderRadius: STYLES.INFO_BORDER_RADIUS,
        }}
      >
        <Text>暂无渠道消息</Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {Object.entries(selectedRecord.channel_msg).map(([channel, msg]) => (
        <div
          key={channel}
          className="p-3 rounded-lg"
          style={{
            backgroundColor: STYLES.BACKGROUND_LIGHT,
            borderRadius: STYLES.INFO_BORDER_RADIUS,
            border: STYLES.CARD_BORDER,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Tag color="purple">{channel}</Tag>
          </div>
          <div className="text-[13px]" style={{ color: STYLES.TEXT_PRIMARY }}>
            <pre className="m-0 whitespace-pre-wrap break-words font-inherit">
              {JSON.stringify(msg, null, 2)}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
};
