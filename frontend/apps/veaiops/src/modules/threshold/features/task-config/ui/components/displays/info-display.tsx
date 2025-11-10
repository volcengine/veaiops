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

import { Card, Divider, Space, Typography } from '@arco-design/web-react';
import { CustomOutlineTag } from '@veaiops/components';
import type { IntelligentThresholdTask } from 'api-generate';
import type React from 'react';

const { Title, Text } = Typography;

interface TaskInfoDisplayProps {
  task: IntelligentThresholdTask | null;
  title: string;
  description?: string;
}

/**
 * Task information display component
 */
export const TaskInfoDisplay: React.FC<TaskInfoDisplayProps> = ({
  task,
  title,
  description,
}) => {
  return (
    <div>
      <Card>
        <Title heading={6}>{title}</Title>
        <Space direction="vertical" size="small">
          <div>
            <Text bold>任务名称：</Text>
            <Text>{task?.task_name}</Text>
          </div>
          <div>
            <Text bold>数据源类型：</Text>
            <CustomOutlineTag>{task?.datasource_type}</CustomOutlineTag>
          </div>
          {/* Note: IntelligentThresholdTask type does not include status field, only displaying existing fields here */}
          <div>
            <Text bold>最后更新：</Text>
            <Text>{task?.updated_at}</Text>
          </div>
        </Space>
      </Card>

      {description && (
        <>
          <Divider />
          <div>
            <Title heading={6}>说明</Title>
            <Text type="secondary">{description}</Text>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskInfoDisplay;
