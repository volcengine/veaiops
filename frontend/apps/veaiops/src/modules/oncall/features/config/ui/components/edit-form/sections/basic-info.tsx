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

import { Form, Input, Typography } from '@arco-design/web-react';
import { IconInfoCircle } from '@arco-design/web-react/icon';
import { CardWithTitle } from '@veaiops/components';
import type React from 'react';

const { Text } = Typography;

interface BasicInfoProps {
  isEdit: boolean;
}

/**
 * Basic Information Section
 * - Rule name
 * - Description
 */
export const BasicInfo: React.FC<BasicInfoProps> = ({ isEdit }) => {
  return (
    <CardWithTitle title="基本信息" className="mb-4">
      <Form.Item
        label={<strong>规则名称</strong>}
        field="name"
        rules={[
          { required: true, message: '请输入规则名称' },
          { maxLength: 50, message: '规则名称不能超过50个字符' },
        ]}
        extra={
          !isEdit && (
            <Text type="secondary" className="text-xs">
              <IconInfoCircle className="mr-1" />
              规则名称在同一机器人下必须唯一，建议使用描述性名称
            </Text>
          )
        }
      >
        <Input
          placeholder="例如：生产环境服务故障、VIP客户请求识别"
          showWordLimit
          maxLength={50}
        />
      </Form.Item>

      <Form.Item
        label={<span className="font-medium">描述</span>}
        field="description"
        extra={
          <Text type="secondary" className="text-xs">
            详细说明此规则的识别目标和使用场景
          </Text>
        }
      >
        <Input.TextArea
          placeholder="请输入规则描述&#10;例如：识别生产环境的严重服务故障，包括服务不可用、大量错误、性能严重下降"
          autoSize={{ minRows: 2, maxRows: 4 }}
          showWordLimit
          maxLength={200}
        />
      </Form.Item>
    </CardWithTitle>
  );
};
