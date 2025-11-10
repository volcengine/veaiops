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
import {
  IconBrush,
  IconCodeBlock,
  IconFile,
} from '@arco-design/web-react/icon';
import { CellRender } from '@veaiops/components';
import type React from 'react';

// Destructure CellRender component to avoid repeated calls
const { CustomOutlineTag } = CellRender;

const { Title, Text } = Typography;

/**
 * Cleaning result drawer title component props interface
 */
interface CleaningResultDrawerTitleProps {
  /** Task name */
  taskName: string;
  /** Version number */
  version: string | number;
}

/**
 * Cleaning result drawer title component
 * Displays task name and version information for cleaning results, uses beautiful icons and layout design
 *
 * @param taskName - Task name
 * @param version - Version number
 */
export const CleaningResultDrawerTitle: React.FC<
  CleaningResultDrawerTitleProps
> = ({ taskName, version }) => {
  return (
    <div className="py-1 flex items-center justify-center gap-5">
      {/* Main title area */}
      <div className="flex items-center gap-1">
        <IconBrush style={{ fontSize: 18, color: '#165DFF' }} />
        <Title
          heading={5}
          style={{ margin: 0, color: '#1D2129' }}
          className="ml-2"
        >
          清洗结果
        </Title>
      </div>

      {/* Task information area - inline layout */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <IconFile style={{ fontSize: 14, color: '#86909C' }} />
          <Text type="secondary" style={{ fontSize: 13 }}>
            任务名称:
          </Text>
          <Text style={{ fontSize: 14, fontWeight: 500, color: '#1D2129' }}>
            {taskName}
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <IconCodeBlock style={{ fontSize: 14, color: '#86909C' }} />
          <Text type="secondary" style={{ fontSize: 13 }}>
            版本:
          </Text>
          <CustomOutlineTag style={{ fontFamily: 'Monaco, monospace' }}>
            {version}
          </CustomOutlineTag>
        </div>
      </div>
    </div>
  );
};

export default CleaningResultDrawerTitle;
