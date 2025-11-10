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

import { Card, Typography } from '@arco-design/web-react';
import { CustomOutlineTag } from '@veaiops/components';
import type React from 'react';
import { getDatasourceTypeLabel, getTaskStatusLabel } from '../alarm';

const { Title, Text } = Typography;

interface TaskInfoCardProps {
  task: Record<string, any>;
}

/**
 * Task information display card component
 */
export const TaskInfoCard: React.FC<TaskInfoCardProps> = ({ task }) => {
  const datasourceType = (task as any)?.datasource_type || '';

  return (
    <Card
      style={{
        marginBottom: 16,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      }}
    >
      <Title heading={6} style={{ marginBottom: 16, color: '#1D2129' }}>
        任务信息
      </Title>
      <div className="grid grid-cols-2 gap-y-3 gap-x-6 items-center">
        <div className="flex items-center">
          <Text bold className="text-[#4E5969] min-w-[80px]">
            任务名称：
          </Text>
          <Text className="text-[#1D2129] ml-2">{task?.taskName || '-'}</Text>
        </div>
        <div className="flex items-center">
          <Text bold className="text-[#4E5969] min-w-[80px]">
            版本号：
          </Text>
          <Text className="text-[#1D2129] ml-2">{task?.version || '-'}</Text>
        </div>
        <div className="flex items-center">
          <Text bold className="text-[#4E5969] min-w-[80px]">
            数据源类型：
          </Text>
          <Text className="text-[#1D2129] ml-2">
            {datasourceType ? getDatasourceTypeLabel(datasourceType) : '-'}
          </Text>
        </div>
        <div className="flex items-center">
          <Text bold className="text-[#4E5969] min-w-[80px]">
            状态：
          </Text>
          <div className="ml-2">
            <CustomOutlineTag>
              {getTaskStatusLabel(task?.status)}
            </CustomOutlineTag>
          </div>
        </div>
      </div>
    </Card>
  );
};
