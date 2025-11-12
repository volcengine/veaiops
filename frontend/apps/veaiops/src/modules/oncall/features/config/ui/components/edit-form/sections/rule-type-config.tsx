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

import { Alert, Form, Select, Space, Typography } from '@arco-design/web-react';
import {
  IconCheckCircle,
  IconEye,
  IconFilter,
  IconInfoCircle,
} from '@arco-design/web-react/icon';
import { CardWithTitle, CellRender } from '@veaiops/components';
import { Interest } from 'api-generate';
import type React from 'react';

const { Text } = Typography;

interface RuleTypeConfigProps {
  isEdit: boolean;
  rule?: Interest;
}

// Helper functions to format category text
const formatActionCategoryText = (category?: string): string => {
  if (category === 'Detect') return '检测（Detect）';
  if (category === 'Filter') return '过滤（Filter）';
  return category || '-';
};

const formatInspectCategoryText = (category?: string): string => {
  if (category === 'Semantic') return '语义分析（Semantic）';
  if (category === 'RE') return '正则表达式（RE）';
  return category || '-';
};

/**
 * Rule Type Configuration Section
 * - Action category (Detect/Filter)
 * - Inspect category (Semantic/RE)
 * - Edit mode: Display as read-only
 * - Create mode: Display as form fields
 */
export const RuleTypeConfig: React.FC<RuleTypeConfigProps> = ({
  isEdit,
  rule,
}) => {
  return (
    <CardWithTitle title="规则类型配置" className="mb-4">
      {/* Edit mode: Display read-only information */}
      {isEdit && rule && (
        <Alert
          type="info"
          content={
            <div className="grid grid-cols-3 gap-x-6 gap-y-2">
              <div className="flex items-center">
                <span className="text-[#86909c] flex-shrink-0">告警类别：</span>
                <CellRender.Ellipsis
                  text={formatActionCategoryText(rule.action_category)}
                  className="font-medium"
                />
              </div>
              <div className="flex items-center">
                <span className="text-[#86909c] flex-shrink-0">检测类别：</span>
                <CellRender.Ellipsis
                  text={formatInspectCategoryText(rule.inspect_category)}
                  className="font-medium"
                />
              </div>
              <div className="flex items-center">
                <span className="text-[#86909c] flex-shrink-0">版本：</span>
                <CellRender.Ellipsis
                  text={rule.version ? `v${rule.version}` : '-'}
                  className="font-medium"
                />
              </div>
            </div>
          }
        />
      )}

      {/* Create mode: Display form fields */}
      {!isEdit && (
        <>
          <Alert
            type="info"
            icon={<IconInfoCircle />}
            content={
              <Text>
                选择规则类型以配置识别策略。创建后类别不可修改，请谨慎选择。
              </Text>
            }
            className="mb-4"
          />

          <Form.Item
            label={
              <Space>
                <IconEye className="text-[rgb(var(--blue-6))]" />
                <strong>行为类别</strong>
              </Space>
            }
            field="action_category"
            rules={[{ required: true, message: '请选择行为类别' }]}
            extra={
              <Text type="secondary" className="text-xs">
                <IconCheckCircle className="mr-1" />
                Detect: 满足条件时产生告警 ｜ Filter: 满足条件时抑制告警
              </Text>
            }
          >
            <Select placeholder="请选择行为类别" className="w-full">
              <Select.Option value={Interest.action_category.DETECT}>
                <Space>
                  <IconEye />
                  <span>检测（Detect）</span>
                </Space>
                <div className="text-xs text-[var(--color-text-3)] ml-6">
                  当满足识别条件时产生告警通知
                </div>
              </Select.Option>
              <Select.Option value={Interest.action_category.FILTER}>
                <Space>
                  <IconFilter />
                  <span>过滤（Filter）</span>
                </Space>
                <div className="text-xs text-[var(--color-text-3)] ml-6">
                  当满足条件时抑制告警，避免误报
                </div>
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <Space>
                <IconFilter className="text-[rgb(var(--orange-6))]" />
                <strong>检测类别</strong>
              </Space>
            }
            field="inspect_category"
            rules={[{ required: true, message: '请选择检测类别' }]}
            extra={
              <Text type="secondary" className="text-xs">
                <IconInfoCircle className="mr-1" />
                Semantic: 智能语义识别 ｜ RE: 正则表达式匹配
              </Text>
            }
          >
            <Select placeholder="请选择检测类别" className="w-full">
              <Select.Option value={Interest.inspect_category.SEMANTIC}>
                <Space>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2]" />
                  <span>语义分析（Semantic）</span>
                </Space>
                <div className="text-xs text-[var(--color-text-3)] ml-6 mt-1">
                  基于 LLM 的智能语义理解，适合复杂场景和多样化表达
                </div>
              </Select.Option>
              <Select.Option value={Interest.inspect_category.RE}>
                <Space>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[rgb(var(--green-6))]" />
                  <span>正则表达式（RE）</span>
                </Space>
                <div className="text-xs text-[var(--color-text-3)] ml-6 mt-1">
                  精确匹配特定模式，适合结构化内容和关键词识别
                </div>
              </Select.Option>
            </Select>
          </Form.Item>
        </>
      )}
    </CardWithTitle>
  );
};
