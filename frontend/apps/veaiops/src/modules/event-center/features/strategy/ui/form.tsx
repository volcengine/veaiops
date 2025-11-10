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

// Note: PRIORITY_OPTIONS constant has been removed, use default options
import {
  Divider,
  Form,
  Grid,
  Input,
  Select,
  Switch,
  Typography,
} from '@arco-design/web-react';
import { CHANNEL_OPTIONS } from '@veaiops/constants';
import { ChannelType } from 'api-generate';
import type { InformStrategy } from 'api-generate';
import type React from 'react';

const PRIORITY_OPTIONS = [
  { label: '低', value: 'LOW' },
  { label: '中', value: 'MEDIUM' },
  { label: '高', value: 'HIGH' },
  { label: '紧急', value: 'URGENT' },
];

const { Row, Col } = Grid;
const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

// Event type options
const EVENT_TYPE_OPTIONS = [
  { label: '告警事件', value: 'alert' },
  { label: '恢复事件', value: 'recovery' },
  { label: '系统事件', value: 'system' },
  { label: '业务事件', value: 'business' },
];

// Priority options

interface StrategyFormProps {
  form: any;
  editingStrategy?: InformStrategy | null;
}

export const StrategyForm: React.FC<StrategyFormProps> = ({ form }) => {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        channel_type: ChannelType.LARK,
        event_types: [],
        priority_levels: [],
        is_active: true,
      }}
    >
      <Title heading={6}>基本信息</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="策略名称"
            field="name"
            rules={[{ required: true, message: '请输入策略名称' }]}
          >
            <Input placeholder="请输入策略名称" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="启用策略"
            field="is_active"
            triggerPropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="策略描述" field="description">
        <TextArea placeholder="请输入策略描述" rows={3} />
      </Form.Item>

      <Divider />
      <Title heading={6}>通知配置</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="通知Channel类型"
            field="channel_type"
            rules={[{ required: true, message: '请选择通知Channel类型' }]}
          >
            <Select placeholder="请选择通知Channel类型" allowClear>
              {CHANNEL_OPTIONS.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Channel配置"
            field="channel_config"
            tooltip="Channel相关的配置信息，如webhook地址、群组ID等"
          >
            <Input placeholder="请输入Channel配置信息" />
          </Form.Item>
        </Col>
      </Row>

      <Divider />
      <Title heading={6}>触发条件</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="事件类型"
            field="event_types"
            tooltip="选择触发此策略的事件类型"
          >
            <Select placeholder="请选择事件类型" mode="multiple" allowClear>
              {EVENT_TYPE_OPTIONS.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="优先级"
            field="priority_levels"
            tooltip="选择触发此策略的事件优先级"
          >
            <Select placeholder="请选择优先级" mode="multiple" allowClear>
              {PRIORITY_OPTIONS.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};
