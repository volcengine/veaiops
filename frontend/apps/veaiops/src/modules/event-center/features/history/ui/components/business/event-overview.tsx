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

import { AIAgentIcon } from '@/components/global-guide';
import { Card, Typography } from '@arco-design/web-react';
// ✅ Optimization: Use shortest path, merge same-source imports
import { renderEventStatus } from '@ec/history';
import {
  EVENT_LEVEL_VISUAL_MAP,
  EVENT_TYPE_MAP,
  type EventOverviewProps,
  STYLES,
  getEventLevelConfig,
  getEventTypeConfig,
} from '@ec/shared';
import { CellRender } from '@veaiops/components';
import type React from 'react';

const { Text } = Typography;
const { CopyableText, CustomOutlineTag } = CellRender;

/**
 * Event overview component
 * Displays basic information overview of the event
 */
export const EventOverview: React.FC<EventOverviewProps> = ({
  selectedRecord,
}) => {
  // Render event type label - Enhanced visual design, unified use of AIAgentIcon
  const renderEventType = (value: string) => {
    const config = getEventTypeConfig(value, EVENT_TYPE_MAP);

    return (
      <div className="flex items-center gap-2">
        <AIAgentIcon size={16} color={config.color} />
        <div
          className="font-semibold text-sm"
          style={{
            color: config.color,
          }}
        >
          {config.text}
        </div>
      </div>
    );
  };

  // Render event level label - Use CustomOutlineTag
  const renderEventLevel = (value: string) => {
    const config = getEventLevelConfig(value, EVENT_LEVEL_VISUAL_MAP);

    return (
      <CustomOutlineTag>
        <span className="flex items-center gap-1">
          <span>{config.icon}</span>
          <span>{value || '未知'}</span>
        </span>
      </CustomOutlineTag>
    );
  };

  return (
    <Card
      style={{
        marginBottom: '20px',
        border: STYLES.CARD_BORDER,
        borderRadius: STYLES.CARD_BORDER_RADIUS,
        boxShadow: STYLES.CARD_SHADOW,
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FAFBFC 100%)',
      }}
    >
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Event type and level */}
        <div>
          <div className="mb-4">
            <Text
              style={{
                fontSize: '12px',
                color: STYLES.TEXT_SECONDARY,
                marginBottom: '8px',
                display: 'block',
              }}
            >
              智能体
            </Text>
            {renderEventType(selectedRecord.agent_type || '')}
          </div>
          <div>
            <Text
              style={{
                fontSize: '12px',
                color: STYLES.TEXT_SECONDARY,
                marginBottom: '8px',
                display: 'block',
              }}
            >
              事件级别
            </Text>
            {renderEventLevel(selectedRecord.event_level || '')}
          </div>
        </div>

        {/* Right: Status and time */}
        <div>
          <div className="mb-4">
            <Text
              style={{
                fontSize: '12px',
                color: STYLES.TEXT_SECONDARY,
                marginBottom: '8px',
                display: 'block',
              }}
            >
              事件状态
            </Text>
            {renderEventStatus(selectedRecord.status)}
          </div>
          <div>
            <Text
              style={{
                fontSize: '12px',
                color: STYLES.TEXT_SECONDARY,
                marginBottom: '8px',
                display: 'block',
              }}
            >
              事件ID
            </Text>
            <CopyableText
              text={selectedRecord._id || selectedRecord.event_id || ''}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
