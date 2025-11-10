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
  AGENT_OPTIONS_EVENT_CENTER_SUBSCRIPTION,
  AGENT_OPTIONS_ONCALL_SUBSCRIPTION,
  AGENT_OPTIONS_THRESHOLD_FILTER,
} from '@/pages/event-center/card-template/types';
import { ModuleType } from '@/types/module';
import { Card, DatePicker, Form, Input, Select } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react';
import type React from 'react';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

/**
 * Basic info form component props interface
 */
interface BasicInfoFormProps {
  form: FormInstance;
  moduleType?: ModuleType;
}

/**
 * Basic info form component
 * Contains basic information such as subscription name, agent, effective time, etc.
 */
export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  form,
  moduleType,
}) => {
  // Select agent options based on module type
  const getAgentOptions = () => {
    // Oncall module: Only content recognition Agent
    if (moduleType === ModuleType.ONCALL) {
      return AGENT_OPTIONS_ONCALL_SUBSCRIPTION;
    }
    // Intelligent threshold module: Only intelligent threshold Agent
    if (moduleType === ModuleType.INTELLIGENT_THRESHOLD) {
      return AGENT_OPTIONS_THRESHOLD_FILTER;
    }
    // Event center module and default: Content recognition Agent + Intelligent threshold Agent
    return AGENT_OPTIONS_EVENT_CENTER_SUBSCRIPTION;
  };

  return (
    <Card title="基本信息" className="mb-4">
      <FormItem
        label="订阅名称"
        field="name"
        rules={[
          { required: true, message: '请输入订阅名称' },
          { maxLength: 100, message: '订阅名称不能超过100个字符' },
        ]}
      >
        <Input placeholder="请输入订阅名称（支持汉字和英文）" />
      </FormItem>

      <FormItem
        label="智能体"
        field="agent_type"
        rules={[{ required: true, message: '请选择智能体' }]}
      >
        <Select placeholder="请选择智能体" options={getAgentOptions()} />
      </FormItem>

      <FormItem
        label="生效时间"
        field="effective_time_range"
        rules={[{ required: true, message: '请选择生效时间' }]}
      >
        <RangePicker
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          placeholder={['开始时间', '结束时间']}
          style={{ width: '100%' }}
        />
      </FormItem>
    </Card>
  );
};

export default BasicInfoForm;
