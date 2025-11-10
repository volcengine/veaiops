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

import { Form, type FormInstance, Input, Select } from '@arco-design/web-react';
import { channelTypeOptions } from '@ec/strategy';
import type { Bot } from 'api-generate';
import type React from 'react';
import { WarningAlert } from './alert-messages';

const { TextArea } = Input;

/**
 * Form fields block component props interface
 */
export interface FormFieldsProps {
  form: FormInstance;
  botsOptions: Array<{ label: string; value: string; extra?: Bot }>;
  chatOptions: Array<{ label: string; value: string }>;
  bot_id?: string;
  selectedBotName: string | null;
}

/**
 * Form fields block component
 * Contains fields such as strategy name, description, enterprise collaboration tool, bot, notification groups, and notes at the bottom
 */
export const FormFields: React.FC<FormFieldsProps> = ({
  form,
  botsOptions,
  chatOptions,
  bot_id,
  selectedBotName,
}) => {
  return (
    <>
      <Form.Item
        label="策略名称"
        field="name"
        rules={[
          { required: true, message: '请输入策略名称' },
          { minLength: 2, message: '策略名称至少2个字符' },
          { maxLength: 50, message: '策略名称最多50个字符' },
        ]}
      >
        <Input placeholder="请输入策略名称" />
      </Form.Item>

      <Form.Item
        label="描述"
        field="description"
        rules={[{ maxLength: 200, message: '描述最多200个字符' }]}
      >
        <TextArea
          placeholder="请输入策略描述"
          rows={3}
          showWordLimit
          maxLength={200}
        />
      </Form.Item>

      <Form.Item
        label="企业协同工具"
        field="channel"
        rules={[{ required: true, message: '请选择企业协同工具' }]}
      >
        <Select placeholder="请选择企业协同工具" options={channelTypeOptions} />
      </Form.Item>

      <Form.Item
        label="机器人"
        field="bot_id"
        rules={[{ required: true, message: '请选择通知机器人' }]}
      >
        <Select
          placeholder="请选择机器人"
          options={botsOptions.filter(
            (option): option is typeof option & { value: string } =>
              Boolean(option.value),
          )}
          allowClear
          onChange={() => {
            form.setFieldValue('chat_ids', undefined);
          }}
        />
      </Form.Item>

      <Form.Item
        label="通知群"
        field="chat_ids"
        rules={[{ required: true, message: '请选择通知群' }]}
      >
        <Select
          placeholder="请选择通知群"
          mode="multiple"
          allowClear
          disabled={!bot_id}
          options={chatOptions}
        />
      </Form.Item>

      {/* Notes - Placed at the end of form fields */}
      <WarningAlert selectedBotName={selectedBotName} />
    </>
  );
};
