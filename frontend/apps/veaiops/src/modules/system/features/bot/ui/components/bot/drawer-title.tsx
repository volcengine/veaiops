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
import { IconIdcard, IconRobot, IconTag } from '@arco-design/web-react/icon';
import { CellRender } from '@veaiops/components';
import type { Bot } from 'api-generate';
import type React from 'react';

// Destructure CellRender component to avoid repeated calls
const { CustomOutlineTag } = CellRender;

const { Title, Text } = Typography;

/**
 * Bot drawer title component props interface
 */
interface BotDrawerTitleProps {
  bot: Bot;
  title: string;
}

/**
 * Bot drawer title component
 * Displays Bot's basic information, including App ID and name
 *
 * Corresponds to origin/feat/web-v2 branch implementation, ensuring functional consistency
 *
 * @param bot - Bot object containing bot_id and name information
 * @param title - Drawer title text
 */
export const BotDrawerTitle: React.FC<BotDrawerTitleProps> = ({
  bot,
  title,
}) => {
  return (
    <div className="py-1 flex items-center justify-center gap-5">
      {/* Main title area */}
      <div className="flex items-center gap-1">
        <IconRobot className="text-lg text-[#165DFF]" />
        <Title heading={5} className="text-[#1D2129]" style={{ margin: 0 }}>
          {title}
        </Title>
      </div>

      {/* Bot information area - inline layout */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <IconIdcard className="text-sm text-[#86909C]" />
          <Text type="secondary" className="text-sm">
            App ID:
          </Text>
          <CustomOutlineTag className="font-mono">
            {bot.bot_id || 'N/A'}
          </CustomOutlineTag>
        </div>

        <div className="flex items-center gap-2">
          <IconTag className="text-sm text-[#86909C]" />
          <Text type="secondary" className="text-sm">
            名称:
          </Text>
          <Text className="text-sm font-medium text-[#1D2129]">{bot.name}</Text>
        </div>
      </div>
    </div>
  );
};

export default BotDrawerTitle;
