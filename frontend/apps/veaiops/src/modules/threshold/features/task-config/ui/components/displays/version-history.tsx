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

import { Badge, List, Space, Tag, Typography } from '@arco-design/web-react';
import {
  IconCheckCircle,
  IconClockCircle,
  IconCloseCircle,
  IconCodeBlock,
  IconEmpty,
  IconHistory,
  IconMinusCircle,
  IconPlayCircle,
} from '@arco-design/web-react/icon';
import type { IntelligentThresholdTaskVersion } from 'api-generate';
import type React from 'react';

const { Title, Text } = Typography;

interface TaskVersionHistoryProps {
  versions: IntelligentThresholdTaskVersion[];
  loading: boolean;
}

/**
 * Get status configuration
 */
const getStatusConfig = (status: string) => {
  const statusMap = {
    completed: {
      icon: <IconCheckCircle style={{ fontSize: 16 }} />,
      status: 'success' as const,
      text: '已完成',
      color: '#00B42A',
    },
    running: {
      icon: <IconPlayCircle style={{ fontSize: 16 }} />,
      status: 'processing' as const,
      text: '运行中',
      color: '#165DFF',
    },
    launching: {
      icon: <IconClockCircle style={{ fontSize: 16 }} />,
      status: 'warning' as const,
      text: '启动中',
      color: '#FF7D00',
    },
    failed: {
      icon: <IconCloseCircle style={{ fontSize: 16 }} />,
      status: 'error' as const,
      text: '失败',
      color: '#F53F3F',
    },
    cancelled: {
      icon: <IconMinusCircle style={{ fontSize: 16 }} />,
      status: 'default' as const,
      text: '已取消',
      color: '#86909C',
    },
  };

  return (
    statusMap[status as keyof typeof statusMap] || {
      icon: <IconEmpty style={{ fontSize: 16 }} />,
      status: 'default' as const,
      text: status || '未知',
      color: '#86909C',
    }
  );
};

/**
 * Task version history component
 */
export const TaskVersionHistory: React.FC<TaskVersionHistoryProps> = ({
  versions,
  loading,
}) => {
  return (
    <div className="px-6 py-4">
      {/* Title area */}
      <div className="flex items-center gap-2 mb-5">
        <IconHistory style={{ fontSize: 18, color: '#165DFF' }} />
        <Title heading={6} style={{ margin: 0, color: '#1D2129' }}>
          版本历史
        </Title>
      </div>

      {/* Version list */}
      <List
        loading={loading}
        dataSource={versions}
        bordered={false}
        render={(item: IntelligentThresholdTaskVersion) => {
          const statusConfig = getStatusConfig(item.status);
          const resultCount = item.result?.length || 0;

          return (
            <List.Item
              key={item._id || `${item.task_id}-${item.version}`}
              style={{
                padding: '16px',
                marginBottom: 12,
                background: '#F7F8FA',
                borderRadius: 8,
                border: '1px solid #E5E6EB',
              }}
            >
              <div className="w-full">
                {/* Top: version number and status */}
                <div className="flex justify-between items-center mb-3">
                  <Space size={12}>
                    <div className="flex items-center gap-1.5">
                      <IconCodeBlock
                        style={{ fontSize: 14, color: '#4E5969' }}
                      />
                      <Text bold style={{ fontSize: 15, color: '#1D2129' }}>
                        v{item.version}
                      </Text>
                    </div>
                    <Badge
                      status={statusConfig.status}
                      text={statusConfig.text}
                      style={{ fontWeight: 500 }}
                    />
                  </Space>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : '-'}
                  </Text>
                </div>

                {/* Bottom: detailed information */}
                <div className="flex gap-4 flex-wrap">
                  {/* Create user - field removed because IntelligentThresholdTaskVersion type does not contain create_user field */}

                  {/* Direction tag */}
                  {item.direction && (
                    <Tag size="small" color="arcoblue" style={{ fontSize: 12 }}>
                      方向: {item.direction.toUpperCase()}
                    </Tag>
                  )}

                  {/* Result count */}
                  {resultCount > 0 && (
                    <Tag size="small" color="green" style={{ fontSize: 12 }}>
                      结果: {resultCount} 条
                    </Tag>
                  )}
                </div>
              </div>
            </List.Item>
          );
        }}
        noDataElement={
          <div className="text-center py-[60px] px-5 bg-[#F7F8FA] rounded-lg">
            <IconEmpty
              style={{ fontSize: 48, color: '#C9CDD4', marginBottom: 12 }}
            />
            <div>
              <Text type="secondary" style={{ fontSize: 14 }}>
                暂无版本历史
              </Text>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default TaskVersionHistory;
