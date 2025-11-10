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

import { Typography } from '@arco-design/web-react';
import { IconClockCircle, IconRefresh } from '@arco-design/web-react/icon';
// ✅ 优化：使用最短路径，合并同源导入
import { STYLES, type TimeInfoProps } from '@ec/shared';
import { CellRender } from '@veaiops/components';
import type React from 'react';

const { Text } = Typography;
const { StampTime } = CellRender;

/**
 * 时间信息组件
 * 显示事件的创建时间和更新时间
 */
export const TimeInfo: React.FC<TimeInfoProps> = ({ selectedRecord }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div
        className="p-3 rounded-lg"
        style={{
          backgroundColor: STYLES.BACKGROUND_LIGHT,
          borderRadius: STYLES.INFO_BORDER_RADIUS,
          border: STYLES.CARD_BORDER,
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <IconClockCircle style={{ color: '#165DFF' }} />
          <Text style={{ fontWeight: 500, color: STYLES.TEXT_PRIMARY }}>
            创建时间
          </Text>
        </div>
        {selectedRecord.created_at ? (
          <StampTime time={selectedRecord.created_at} />
        ) : (
          <Text style={{ color: STYLES.TEXT_SECONDARY }}>-</Text>
        )}
      </div>

      <div
        className="p-3 rounded-lg"
        style={{
          backgroundColor: STYLES.BACKGROUND_LIGHT,
          borderRadius: STYLES.INFO_BORDER_RADIUS,
          border: STYLES.CARD_BORDER,
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <IconRefresh style={{ color: '#00B42A' }} />
          <Text style={{ fontWeight: 500, color: STYLES.TEXT_PRIMARY }}>
            更新时间
          </Text>
        </div>
        {selectedRecord.updated_at ? (
          <StampTime time={selectedRecord.updated_at} />
        ) : (
          <Text style={{ color: STYLES.TEXT_SECONDARY }}>-</Text>
        )}
      </div>
    </div>
  );
};
