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

import { Card, Tooltip, Typography } from '@arco-design/web-react';
import { IconCopy, IconInfoCircle } from '@arco-design/web-react/icon';
import { getChannelTypeTranslation } from '@bot/lib';
import { CellRender } from '@veaiops/components';
import { safeCopyToClipboard } from '@veaiops/utils';
import type { Chat } from 'api-generate';
import type React from 'react';
import { useState } from 'react';

const { Text } = Typography;

interface ChatInfoSectionProps {
  chat: Chat | null;
}

/**
 * Chat info section component
 */
export const ChatInfoSection: React.FC<ChatInfoSectionProps> = ({ chat }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyChatId = async () => {
    if (chat?.chat_id) {
      // ✅ Correct: check return value of safeCopyToClipboard
      const result = await safeCopyToClipboard(chat.chat_id);

      if (result.success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
      // Copy failed, silently handle (don't show error message)
    }
  };

  return (
    <Card
      className="chat-info-card"
      title={
        <div className="card-title">
          <IconInfoCircle className="card-title-icon" />
          <span>群信息</span>
        </div>
      }
      size="small"
    >
      <div className="chat-info-content">
        <div className="info-item">
          <Text className="info-label">群名称</Text>
          <CellRender.Ellipsis
            text={chat?.name || '-'}
            className="info-value"
          />
        </div>
        <div className="info-item">
          <Text className="info-label">群ID</Text>
          <div className="info-value-container">
            <CellRender.Ellipsis
              text={chat?.chat_id || '-'}
              className="info-value info-value-secondary"
            />
            {chat?.chat_id && (
              <Tooltip content={copySuccess ? '复制成功!' : '复制群ID'}>
                <IconCopy
                  className={`copy-icon ${copySuccess ? 'copy-success' : ''}`}
                  onClick={handleCopyChatId}
                />
              </Tooltip>
            )}
          </div>
        </div>
        <div className="info-item">
          <Text className="info-label">企业协同工具</Text>
          <CellRender.Ellipsis
            text={chat?.channel ? getChannelTypeTranslation(chat.channel) : '-'}
            className="channel-tag"
          />
        </div>
      </div>
    </Card>
  );
};
