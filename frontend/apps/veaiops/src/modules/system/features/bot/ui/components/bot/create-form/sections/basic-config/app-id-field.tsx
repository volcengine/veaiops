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

import { Form, Input, Link, Message, Typography } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react';
import { AutofillBlockerPresets } from '@veaiops/utils';
import type React from 'react';

const { Text } = Typography;

interface AppIdFieldProps {
  form: FormInstance;
  checkAppIdDuplicate: (appId: string) => Promise<string | undefined>;
}

/**
 * App ID input field component
 */
export const AppIdField: React.FC<AppIdFieldProps> = ({
  form,
  checkAppIdDuplicate,
}) => {
  return (
    <Form.Item
      label="App ID"
      field="bot_id"
      rules={[
        { required: true, message: '请输入App ID' },
        { minLength: 1, message: 'App ID不能为空' },
      ]}
      extra={
        <Text type="secondary">
          请跳转{' '}
          <Link
            href="https://open.larkoffice.com/app"
            target="_blank"
            style={{ fontSize: '12px' }}
          >
            飞书开发者平台
          </Link>
          ，通过"创建自建应用"来新建机器人，或选择已有的机器人后跳转到详情页，在"凭证与基础信息"页面，复制粘贴相关内容
        </Text>
      }
    >
      <Input
        placeholder="请输入机器人应用凭证：App ID"
        allowClear
        {...AutofillBlockerPresets.appId()}
        onBlur={async () => {
          // Get current value from form, more secure and reliable
          const appId = form.getFieldValue('bot_id') as string | undefined;
          if (appId?.trim()) {
            const errorMessage = await checkAppIdDuplicate(appId.trim());
            if (errorMessage) {
              // Set form field error (using setFields method)
              form.setFields({
                bot_id: {
                  error: {
                    message: errorMessage,
                  },
                },
              });
              // Show error message
              Message.error(errorMessage);
            } else {
              // Clear error state
              form.setFields({
                bot_id: {
                  error: undefined,
                },
              });
            }
          }
        }}
      />
    </Form.Item>
  );
};
