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
  IconCodeBlock,
  IconExperiment,
  IconFile,
  IconSettings,
} from '@arco-design/web-react/icon';
import { useSearchParams } from '@modern-js/runtime/router';
import { CellRender } from '@veaiops/components';
import type { IntelligentThresholdTask } from 'api-generate';
import type React from 'react';
import { useMemo } from 'react';

// Destructure CellRender component to avoid repeated calls
const { CustomOutlineTag } = CellRender;

const { Title, Text } = Typography;

/**
 * Task drawer title component props interface
 */
interface TaskDrawerTitleProps {
  /** Title type */
  titleType: 'cleaning-result' | 'task-detail';
  /** Task record */
  taskRecord?: IntelligentThresholdTask | null;
  /** Version number */
  version?: string | number;
}

/**
 * Task drawer title component
 * Displays different title content based on title type, supports getting taskName from URL
 *
 * @param titleType - Title type
 * @param taskRecord - Task record
 * @param version - Version number
 */
export const TaskDrawerTitle: React.FC<TaskDrawerTitleProps> = ({
  titleType,
  taskRecord,
  version,
}) => {
  // Get URL parameters
  const [searchParams] = useSearchParams();
  const urlTaskName = searchParams.get('taskName');

  // Generate title data
  const titleData = useMemo(() => {
    // Prioritize taskName from URL parameters, then use task_name from taskRecord
    const taskName = urlTaskName || taskRecord?.task_name || '未知任务'; // Reverted to Chinese (code string)
    // Only use version information when version exists and is not "unknown" - UI text, keep Chinese
    const versionInfo = version && version !== '未知' ? version : null; // Reverted to Chinese (code string)

    return { taskName, version: versionInfo };
  }, [urlTaskName, taskRecord?.task_name, version]);

  // Render different content based on title type
  if (titleType === 'cleaning-result') {
    return (
      <div className="py-1 flex items-center justify-center gap-5">
        {/* Main title area */}
        <div className="flex items-center gap-1">
          <IconExperiment style={{ fontSize: 18, color: '#165DFF' }} />
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
              {titleData.taskName}
            </Text>
          </div>

          {titleData.version && (
            <div className="flex items-center gap-2">
              <IconCodeBlock style={{ fontSize: 14, color: '#86909C' }} />
              <Text type="secondary" style={{ fontSize: 13 }}>
                版本:
              </Text>
              <CustomOutlineTag style={{ fontFamily: 'Monaco, monospace' }}>
                {titleData.version}
              </CustomOutlineTag>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Task detail title
  return (
    <div className="py-1 flex items-center justify-center gap-5">
      {/* Main title area */}
      <div className="flex items-center gap-1">
        <IconSettings style={{ fontSize: 18, color: '#165DFF' }} />
        <Title
          heading={5}
          style={{ margin: 0, color: '#1D2129' }}
          className="ml-2"
        >
          任务详情
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
            {titleData.taskName}
          </Text>
        </div>

        {titleData.version && (
          <div className="flex items-center gap-2">
            <IconCodeBlock style={{ fontSize: 14, color: '#86909C' }} />
            <Text type="secondary" style={{ fontSize: 13 }}>
              版本:
            </Text>
            <CustomOutlineTag style={{ fontFamily: 'Monaco, monospace' }}>
              {titleData.version}
            </CustomOutlineTag>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDrawerTitle;
