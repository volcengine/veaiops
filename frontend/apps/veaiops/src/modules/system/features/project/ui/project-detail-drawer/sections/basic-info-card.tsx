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

import { Card, Descriptions, Typography } from '@arco-design/web-react';
import { IconFolder } from '@arco-design/web-react/icon';
import { CellRender } from '@veaiops/components';
import type { Project } from 'api-generate';
import type React from 'react';

const { CustomOutlineTag, Ellipsis: EllipsisRender } = CellRender;
const { Text } = Typography;

/**
 * Basic info card component parameters
 */
interface BasicInfoCardProps {
  project: Project;
}

/**
 * Project basic info card component
 */
export const BasicInfoCard: React.FC<BasicInfoCardProps> = ({ project }) => {
  return (
    <Card
      title={
        <div className="flex items-center gap-3 py-1">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center shadow-[0_3px_8px_rgba(102,126,234,0.3)]"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <IconFolder style={{ fontSize: '18px', color: '#ffffff' }} />
          </div>
          <div>
            <Text
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1d2129',
                lineHeight: '22px',
              }}
            >
              Basic Information
            </Text>
            <Text
              type="secondary"
              className="text-xs text-[#86909c] block leading-4"
              style={{
                fontSize: '12px',
                lineHeight: '16px',
              }}
            >
              Project basic attributes and identification information
            </Text>
          </div>
        </div>
      }
      bordered={false}
      className="bg-white rounded-2xl shadow-lg border border-gray-100"
      bodyStyle={{ padding: '24px 28px' }}
      headerStyle={{
        borderBottom: '1px solid #f5f5f5',
        padding: '20px 28px 16px 28px',
      }}
    >
      <Descriptions
        column={2}
        data={[
          {
            label: 'Project ID',
            value: <EllipsisRender text={project.project_id} />,
          },
          {
            label: 'Project Name',
            value: <EllipsisRender text={project.name} />,
          },
          {
            label: 'Status',
            value: (
              <CustomOutlineTag>
                {project.is_active ? 'Active' : 'Inactive'}
              </CustomOutlineTag>
            ),
          },
        ]}
        labelStyle={{
          width: 100,
          fontWeight: '600',
          color: '#4e5969',
          fontSize: '14px',
          marginBottom: '8px',
        }}
        valueStyle={{
          fontSize: '14px',
          marginBottom: '16px',
        }}
      />
    </Card>
  );
};
