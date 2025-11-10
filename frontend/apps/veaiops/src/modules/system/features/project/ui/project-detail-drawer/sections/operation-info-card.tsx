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

import { Card, Space, Typography } from '@arco-design/web-react';
import { IconInfoCircle } from '@arco-design/web-react/icon';
import type React from 'react';

const { Text } = Typography;

/**
 * Project operation instructions card component
 */
export const OperationInfoCard: React.FC = () => {
  return (
    <Card
      title={
        <div className="flex items-center gap-3 py-1">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center shadow-[0_3px_8px_rgba(250,140,22,0.3)]"
            style={{
              background: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)',
            }}
          >
            <IconInfoCircle style={{ fontSize: '18px', color: '#ffffff' }} />
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
              Operation Instructions
            </Text>
            <Text
              type="secondary"
              className="text-xs text-[#86909c] block leading-4"
              style={{
                fontSize: '12px',
                lineHeight: '16px',
              }}
            >
              Important tips and notes for project management
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
      <Space direction="vertical" size="large" className="w-full">
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-[#bedaff] bg-[#f0f6ff]">
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-[#165dff]">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
          <Text className="text-sm text-[#4e5969] leading-[1.6]">
            Project information is imported in bulk by system administrators via CSV files
          </Text>
        </div>
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-[#bedaff] bg-[#f0f6ff]">
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-[#00b42a]">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
          <Text className="text-sm text-[#4e5969] leading-[1.6]">
            Project description is used to explain the purpose and functional scope of the project
          </Text>
        </div>
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-[#ffccc7] bg-[#fff2f0]">
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-[#f53f3f]">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
          <Text className="text-sm text-[#4e5969] leading-[1.6]">
            Deleting a project will also delete all related historical data. Please proceed with caution.
          </Text>
        </div>
      </Space>
    </Card>
  );
};
