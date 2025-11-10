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
import { STYLES } from '@ec/shared';
import { CellRender } from '@veaiops/components';
import type { Event } from 'api-generate';
import type React from 'react';

const { Text } = Typography;
const { CustomOutlineTag, CustomOutlineTagList } = CellRender;

/**
 * Basic info component props interface
 */
interface BasicInfoProps {
  selectedRecord: Event;
}

/**
 * Basic info component
 * Displays basic information of the event, including project information
 */
export const BasicInfo: React.FC<BasicInfoProps> = ({ selectedRecord }) => {
  return (
    <div>
      <div>
        <Text
          style={{
            fontSize: '12px',
            color: STYLES.TEXT_SECONDARY,
            marginBottom: '8px',
            display: 'block',
          }}
        >
          项目信息
        </Text>
        {(() => {
          if (!selectedRecord.project || selectedRecord.project.length === 0) {
            return <Text style={{ color: STYLES.TEXT_SECONDARY }}>-</Text>;
          }
          if (selectedRecord.project.length === 1) {
            return (
              <CustomOutlineTag>{selectedRecord.project[0]}</CustomOutlineTag>
            );
          }
          return (
            <CustomOutlineTagList
              dataList={selectedRecord.project.map((project) => ({
                name: project,
              }))}
              maxCount={10}
            />
          );
        })()}
      </div>
    </div>
  );
};
