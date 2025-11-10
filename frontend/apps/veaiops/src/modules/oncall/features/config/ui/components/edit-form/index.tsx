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
} from '@arco-design/web-react';
import {
  IconCheck,
  IconClockCircle,
  IconClose,
} from '@arco-design/web-react/icon';
import { formatSilenceDeltaString } from '@oncall-config/lib';
import { ALERT_LEVEL_OPTIONS } from '@oncall/shared';
import { CellRender } from '@veaiops/components';
import { Interest } from 'api-generate';
import type React from 'react';

import { ExampleInput } from './components';
import type { EditFormProps } from './types';
import { formatActionCategoryText, formatInspectCategoryText } from './utils';

/**
 * Edit form component
 *
 * Refactoring notes:
 * - Original branch (feat/web-v2): rule-edit-drawer.tsx contained Alert component displaying read-only basic information
 * - Current branch: Added Alert component in edit-form.tsx, displays alert category, inspect category, version
 * - Functional equivalence: ✅ All original branch functionality aligned
 *
 * Style optimizations:
 * - Added real-time preview cards for positive/negative examples
 * - Use colors to distinguish positive and negative examples
 * - Added sequence numbers and hover effects
 */
export const EditForm: React.FC<EditFormProps> = ({
  form,
  inspectCategory,
  currentSilenceDelta,
  rule,
  onSilenceDeltaChange,
}) => {
  // Watch form value changes, display example preview in real-time
  const examplesPositiveValue = Form.useWatch('examples_positive', form);
  const examplesNegativeValue = Form.useWatch('examples_negative', form);

  return (
    <>
      {/* Read-only information */}
      {rule && (
        <Alert
          type="info"
          title="基本信息"
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
          className="mb-4"
        />
      )}

      <Form form={form} layout="vertical" autoComplete="off">
        {/* Common editable fields */}
        <Form.Item
          label="规则名称"
          field="name"
          rules={[{ required: true, message: '请输入规则名称' }]}
        >
          <Input placeholder="请输入规则名称" />
        </Form.Item>

        <Form.Item label="描述" field="description">
          <Input.TextArea
            placeholder="请输入描述"
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </Form.Item>

        <Form.Item
          label="告警等级"
          field="level"
          rules={[{ required: true, message: '请选择告警等级' }]}
        >
          <Select placeholder="请选择告警等级">
            {ALERT_LEVEL_OPTIONS.map((option) => (
              <Select.Option
                key={option.value}
                value={option.value as Interest.level}
              >
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="告警抑制间隔"
          field="silence_delta"
          extra={
            <div className="mt-1">
              <div className="text-[#86909c] text-xs mb-1">
                支持格式:
                6h（6小时）、30m（30分钟）、1d（1天）、1w（1周）、1d12h（1天12小时）
              </div>
              {currentSilenceDelta && (
                <Tag
                  color="arcoblue"
                  icon={<IconClockCircle />}
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  ② 当前解析: {formatSilenceDeltaString(currentSilenceDelta)}
                </Tag>
              )}
            </div>
          }
        >
          <Input
            placeholder="例如: 6h, 30m, 1d, 1d12h"
            onChange={(value) => {
              // Update parsing preview in real-time
              onSilenceDeltaChange(value || rule?.silence_delta);
            }}
          />
        </Form.Item>

        <Form.Item
          label="检测窗口"
          field="inspect_history"
          rules={[
            { required: true, message: '请输入检测窗口' },
            {
              type: 'number',
              min: 0,
              message: '检测窗口必须大于等于0',
            },
          ]}
          extra="需要分析的历史消息数量，0表示分析所有历史消息"
        >
          <InputNumber
            placeholder="请输入检测窗口"
            min={0}
            precision={0}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item label="是否启用" field="is_active" triggerPropName="checked">
          <Switch />
        </Form.Item>

        {/* Display different editable fields based on inspect category */}
        {inspectCategory === Interest.inspect_category.SEMANTIC && (
          <>
            <Form.Item
              label={
                <Space>
                  <IconCheck style={{ color: 'rgb(var(--green-6))' }} />
                  <span className="font-medium">正面示例</span>
                </Space>
              }
              field="examples_positive"
              extra="输入应该被检测到的消息示例，每行一个"
            >
              <ExampleInput
                value={examplesPositiveValue}
                type="positive"
                placeholder="例如：&#10;多个region都出现了问题&#10;北京与上海的用户都反馈报错"
                onChange={(value) => {
                  form.setFieldValue('examples_positive', value);
                }}
              />
            </Form.Item>

            <Form.Item
              label={
                <Space>
                  <IconClose style={{ color: 'rgb(var(--red-6))' }} />
                  <span className="font-medium">反面示例</span>
                </Space>
              }
              field="examples_negative"
              extra="输入不应该被检测到的消息示例，每行一个"
            >
              <ExampleInput
                value={examplesNegativeValue}
                type="negative"
                placeholder="例如：&#10;线上环境的问题&#10;单个用户反馈问题"
                onChange={(value) => {
                  form.setFieldValue('examples_negative', value);
                }}
              />
            </Form.Item>
          </>
        )}

        {inspectCategory === Interest.inspect_category.RE && (
          <Form.Item
            label="正则表达式"
            field="regular_expression"
            rules={[{ required: true, message: '请输入正则表达式' }]}
          >
            <Input placeholder="请输入正则表达式" />
          </Form.Item>
        )}
      </Form>
    </>
  );
};

export type { EditFormProps } from './types';
