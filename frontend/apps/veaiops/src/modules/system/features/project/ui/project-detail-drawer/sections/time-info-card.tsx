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
import { IconCalendar } from '@arco-design/web-react/icon';
import { CellRender } from '@veaiops/components';
import type { Project } from 'api-generate';
import type React from 'react';

const { Text } = Typography;
const { StampTime } = CellRender;

/**
 * Time info card component parameters
 */
interface TimeInfoCardProps {
  project: Project;
}

/**
 * Project time info card component
 */
export const TimeInfoCard: React.FC<TimeInfoCardProps> = ({ project }) => {
  return (
    <Card
      title={
        <div className="flex items-center gap-3 py-1">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center shadow-[0_3px_8px_rgba(82,196,26,0.3)]"
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
            }}
          >
            <IconCalendar style={{ fontSize: '18px', color: '#ffffff' }} />
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
              Time Information
            </Text>
            <Text
              type="secondary"
              className="text-xs text-[#86909c] block leading-4"
              style={{
                fontSize: '12px',
                lineHeight: '16px',
              }}
            >
              Project creation and update time records
            </Text>
          </div>
        </div>
      }
      bordered={false}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        border: '1px solid #f0f0f0',
      }}
      bodyStyle={{ padding: '24px 28px' }}
      headerStyle={{
        borderBottom: '1px solid #f5f5f5',
        padding: '20px 28px 16px 28px',
      }}
    >
      <Descriptions
        column={1}
        data={[
          {
            label: 'Created At',
            value: (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00b42a]" />
                <Text className="text-sm text-[#4e5969] font-mono">
                  <StampTime time={project.created_at} />
                </Text>
              </div>
            ),
          },
          {
            label: 'Updated At',
            value: (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#165dff]" />
                <Text className="text-sm text-[#4e5969] font-mono">
                  <StampTime time={project.updated_at} />
                </Text>
              </div>
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
