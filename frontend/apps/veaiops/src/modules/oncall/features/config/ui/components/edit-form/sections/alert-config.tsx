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

import {
  Alert,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
} from '@arco-design/web-react';
import { IconClockCircle, IconInfoCircle } from '@arco-design/web-react/icon';
import { formatSilenceDeltaString } from '@oncall-config/lib';
import { ALERT_LEVEL_OPTIONS } from '@oncall/shared';
import { CardWithTitle } from '@veaiops/components';
import type { Interest } from 'api-generate';
import type React from 'react';

const { Text } = Typography;

interface AlertConfigProps {
  currentSilenceDelta: string | undefined;
  rule: Interest | undefined;
  onSilenceDeltaChange: (value: string | undefined) => void;
}

/**
 * Alert Configuration Section
 * - Alert level
 * - Silence delta (alert suppression interval)
 * - Inspect history (detection window)
 * - Is active
 */
export const AlertConfig: React.FC<AlertConfigProps> = ({
  currentSilenceDelta,
  rule,
  onSilenceDeltaChange,
}) => {
  return (
    <CardWithTitle title="告警配置" className="mb-4">
      <Form.Item
        label={<strong>告警等级</strong>}
        field="level"
        rules={[{ required: true, message: '请选择告警等级' }]}
        extra={
          <Text type="secondary" className="text-xs">
            <IconInfoCircle className="mr-1" />
            P0: 最高优先级（严重故障）｜ P1: 高优先级 ｜ P2: 一般优先级
          </Text>
        }
      >
        <Select placeholder="请选择告警等级" className="w-full">
          {ALERT_LEVEL_OPTIONS.map((option) => (
            <Select.Option
              key={option.value}
              value={option.value as Interest.level}
            >
              <Space>
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: option.color }}
                />
                <span>{option.label}</span>
              </Space>
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label={
          <Space>
            <IconClockCircle className="text-[rgb(var(--orange-6))]" />
            <span className="font-medium">告警抑制间隔</span>
          </Space>
        }
        field="silence_delta"
        extra={
          <>
            <Alert
              type="info"
              content={
                <div>
                  <div className="text-xs mb-2">
                    <IconInfoCircle className="mr-1" />
                    同一群聊内的告警间隔，避免频繁通知
                  </div>
                  <div className="text-xs">
                    支持格式：6h（6小时）、30m（30分钟）、1d（1天）、1w（1周）、1d12h（1天12小时）
                  </div>
                </div>
              }
              className="mt-2"
            />
            {currentSilenceDelta && (
              <Tag
                color="arcoblue"
                icon={<IconClockCircle />}
                className="text-xs font-medium mt-2"
              >
                当前解析: {formatSilenceDeltaString(currentSilenceDelta)}
              </Tag>
            )}
          </>
        }
      >
        <Input
          placeholder="例如: 6h（推荐）, 30m, 1d"
          prefix={<IconClockCircle />}
          onChange={(value) => {
            // Real-time update parsing preview
            onSilenceDeltaChange(value || rule?.silence_delta);
          }}
        />
      </Form.Item>

      <Form.Item
        label={<strong>检测窗口</strong>}
        field="inspect_history"
        rules={[
          { required: true, message: '请输入检测窗口' },
          {
            type: 'number',
            min: 0,
            message: '检测窗口必须大于等于0',
          },
        ]}
        extra={
          <Alert
            type="info"
            content={
              <div>
                <div className="text-xs mb-2">
                  <IconInfoCircle className="mr-1" />
                  需要分析的历史消息数量
                </div>
                <div className="text-xs">
                  • 设置为 1：仅分析最新消息（推荐用于实时告警）
                  <br />• 设置为
                  5-10：分析最近几条消息，理解上下文（推荐用于趋势分析）
                  <br />• 设置为 0：分析所有历史消息（慎用，影响性能）
                </div>
              </div>
            }
            className="mt-2"
          />
        }
      >
        <InputNumber
          placeholder="推荐设置为 1"
          min={0}
          precision={0}
          className="w-full"
        />
      </Form.Item>

      <Form.Item
        label={<span className="font-medium">是否启用</span>}
        field="is_active"
        triggerPropName="checked"
        extra={
          <Text type="secondary" className="text-xs">
            规则创建后立即生效。如需测试，建议先关闭后创建
          </Text>
        }
      >
        <Switch checkedText="启用" uncheckedText="停用" defaultChecked={true} />
      </Form.Item>
    </CardWithTitle>
  );
};
