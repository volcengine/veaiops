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

import apiClient from '@/utils/api-client';
import {
  Button,
  DatePicker,
  Descriptions,
  Drawer,
  Input,
  Message,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import {
  IconDownload,
  IconEye,
  IconRefresh,
  IconSearch,
} from '@arco-design/web-react/icon';
import { CellRender } from '@veaiops/components';
import { AgentType, EventLevel } from 'api-generate';
import type { Event } from 'api-generate';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;
const { CustomOutlineTag } = CellRender;

export const EventCenterHistoryPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState<Event[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Event | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filters, setFilters] = useState<{
    dateRange: string[];
    eventLevel: EventLevel | '';
    agentType: AgentType | '';
    region: string;
    project: string;
  }>({
    dateRange: [],
    eventLevel: '',
    agentType: '',
    region: '',
    project: '',
  });

  // Fetch history events
  const fetchEventHistory = useCallback(async () => {
    setLoading(true);
    try {
      // Use real history event API
      const response = await apiClient.event.getApisV1ManagerEventCenterEvent({
        agentType: (filters.agentType as any) || undefined,
        eventLevel: (filters.eventLevel as any) || undefined,
        region: filters.region ? [filters.region] : undefined,
        projects: filters.project ? [filters.project] : undefined,
        products: undefined,
        customers: undefined,
        startTime: filters.dateRange?.[0]
          ? new Date(filters.dateRange[0]).toISOString()
          : undefined,
        endTime: filters.dateRange?.[1]
          ? new Date(filters.dateRange[1]).toISOString()
          : undefined,
        skip: 0,
        limit: 50,
      });

      setEventData(response.data || []);
    } catch (error: unknown) {
      // ✅ Correct: Expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = errorObj.message || '获取历史事件失败';
      Message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, setLoading, setEventData]);

  useEffect(() => {
    fetchEventHistory();
  }, [fetchEventHistory]);

  // Event table column definitions
  const eventColumns: ColumnProps<Event>[] = [
    {
      title: '事件ID',
      dataIndex: '_id',
      width: 120,
      render: (value: string) => (
        <Text code copyable>
          {value}
        </Text>
      ),
    },
    {
      title: '代理类型',
      dataIndex: 'agent_type',
      width: 150,
      render: (value: AgentType) => (
        <CustomOutlineTag>{value}</CustomOutlineTag>
      ),
    },
    {
      title: '事件级别',
      dataIndex: 'event_level',
      width: 80,
      render: (value: EventLevel) => (
        <CustomOutlineTag>{value}</CustomOutlineTag>
      ),
    },
    {
      title: '数据源类型',
      dataIndex: 'datasource_type',
      width: 120,
    },
    {
      title: '区域',
      dataIndex: 'region',
      width: 120,
      render: (value: string[]) => value?.join(', ') || '-',
    },
    {
      title: '项目',
      dataIndex: 'project',
      width: 120,
      render: (value: string[]) => value?.join(', ') || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 160,
      sorter: true,
      render: (value: string) =>
        value ? new Date(value).toLocaleString() : '-',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      width: 160,
      render: (value: string) =>
        value ? new Date(value).toLocaleString() : '-',
    },
    {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (_: string, record: Event) => (
        <Button
          type="text"
          size="small"
          icon={<IconEye />}
          onClick={() => {
            setSelectedRecord(record);
            setDrawerVisible(true);
          }}
        />
      ),
    },
  ];

  const handleExport = () => {
    Message.info('导出功能开发中...');
  };

  const handleRefresh = () => {
    fetchEventHistory();
  };

  const renderFilters = () => (
    <Space wrap>
      <RangePicker
        placeholder={['开始时间', '结束时间']}
        showTime
        onChange={(dateStrings) => {
          setFilters((prev) => ({ ...prev, dateRange: dateStrings || [] }));
        }}
      />

      <Select
        placeholder="代理类型"
        style={{ width: 200 }}
        allowClear
        onChange={(value: AgentType | '') =>
          setFilters((prev) => ({ ...prev, agentType: value }))
        }
      >
        <Option value={AgentType.CHATOPS_INTEREST_AGENT}>兴趣代理</Option>
        <Option value={AgentType.CHATOPS_PROACTIVE_REPLY_AGENT}>
          主动回复代理
        </Option>
        <Option value={AgentType.CHATOPS_REACTIVE_REPLY_AGENT}>
          被动回复代理
        </Option>
        <Option value={AgentType.INTELLIGENT_THRESHOLD_AGENT}>
          智能阈值代理
        </Option>
      </Select>

      <Select
        placeholder="事件级别"
        style={{ width: 120 }}
        allowClear
        onChange={(value: EventLevel | '') =>
          setFilters((prev) => ({ ...prev, eventLevel: value }))
        }
      >
        <Option value={EventLevel.P0}>P0</Option>
        <Option value={EventLevel.P1}>P1</Option>
        <Option value={EventLevel.P2}>P2</Option>
      </Select>

      <Input
        placeholder="区域"
        style={{ width: 120 }}
        onChange={(value) => setFilters((prev) => ({ ...prev, region: value }))}
      />

      <Input
        placeholder="项目"
        style={{ width: 120 }}
        onChange={(value) =>
          setFilters((prev) => ({ ...prev, project: value }))
        }
      />

      <Button type="primary" icon={<IconSearch />}>
        搜索
      </Button>
      <Button icon={<IconRefresh />} onClick={handleRefresh}>
        刷新
      </Button>
      <Button icon={<IconDownload />} onClick={handleExport}>
        导出
      </Button>
    </Space>
  );

  const renderDetailDrawer = () => (
    <Drawer
      title="详细信息"
      visible={drawerVisible}
      onCancel={() => setDrawerVisible(false)}
      width={600}
    >
      {selectedRecord && (
        <Descriptions
          column={1}
          data={Object.entries(selectedRecord).map(([key, value]) => {
            let displayValue = '';
            if (typeof value === 'object' && value !== null) {
              displayValue = JSON.stringify(value, null, 2);
            } else if (
              typeof value === 'string' ||
              typeof value === 'number' ||
              typeof value === 'boolean'
            ) {
              displayValue = String(value);
            } else if (value != null) {
              displayValue = '[Complex Value]';
            }
            return {
              label: key,
              value: displayValue,
            };
          })}
        />
      )}
    </Drawer>
  );

  return (
    <div>
      <Title heading={5}>历史事件</Title>

      {renderFilters()}

      <Spin loading={loading}>
        <Table
          columns={eventColumns}
          data={eventData}
          pagination={{
            pageSize: 20,
            showTotal: true,
            showJumper: true,
            sizeCanChange: true,
          }}
        />
      </Spin>

      {renderDetailDrawer()}
    </div>
  );
};
