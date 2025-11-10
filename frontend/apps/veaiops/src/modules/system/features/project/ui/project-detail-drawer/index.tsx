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

import { Drawer, Space, Typography } from '@arco-design/web-react';
import type { Project } from 'api-generate';
import type React from 'react';
import { BasicInfoCard, OperationInfoCard, TimeInfoCard } from './sections';

const { Title } = Typography;

/**
 * Project detail drawer component parameters
 */
interface ProjectDetailDrawerProps {
  visible: boolean;
  project: Project | null;
  onClose: () => void;
}

/**
 * Format date time
 */
const formatDateTime = (dateTime?: string) => {
  return dateTime ? new Date(dateTime).toLocaleString('zh-CN') : '-';
};

/**
 * Project detail drawer component - refactored version
 *
 * 🎯 Split strategy:
 * - sections/ directory stores various info card components
 * - hooks/ directory stores business logic (if needed)
 * - index.tsx responsible for assembly and rendering
 * - types.ts stores type definitions
 */
export const ProjectDetailDrawer: React.FC<ProjectDetailDrawerProps> = ({
  visible,
  project,
  onClose,
}) => {
  if (!project) {
    return null;
  }

  return (
    <Drawer
      width={720}
      title={
        <div className="flex items-center justify-between py-2">
          <Space align="center" size="medium">
            <Title heading={5} className="m-0 text-gray-900">
              Project Details
            </Title>
          </Space>
        </div>
      }
      visible={visible}
      onCancel={onClose}
      footer={null}
      focusLock={false}
      bodyStyle={{
        padding: '0',
      }}
      headerStyle={{
        padding: '16px 24px',
      }}
      className="bg-gray-50"
    >
      <div className="p-6">
        <Space direction="vertical" size="large" className="w-full">
          {/* Basic info card */}
          <BasicInfoCard project={project} />

          {/* Time info card */}
          <TimeInfoCard project={project} formatDateTime={formatDateTime} />

          {/* Operation instructions card */}
          <OperationInfoCard />
        </Space>
      </div>
    </Drawer>
  );
};

export default ProjectDetailDrawer;
