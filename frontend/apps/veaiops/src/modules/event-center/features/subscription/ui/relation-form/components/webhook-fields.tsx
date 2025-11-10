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

import { Form, Input, Switch } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react';
import type React from 'react';

/**
 * Webhook fields component props
 */
interface WebhookFieldsProps {
  form: FormInstance;
}

/**
 * Webhook fields component
 */
export const WebhookFields: React.FC<WebhookFieldsProps> = ({ form }) => {
  return (
    <>
      <Form.Item
        label="Webhook状态"
        field="enable_webhook"
        tooltip="启用后可以通过Webhook接收通知"
        triggerPropName="checked"
      >
        <Switch checkedText="启用" uncheckedText="禁用" />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prev) =>
          prev.enable_webhook !== form.getFieldValue('enable_webhook')
        }
      >
        {() =>
          form.getFieldValue('enable_webhook') ? (
            <>
              <Form.Item
                label="Webhook端点"
                field="webhook_endpoint"
                rules={[
                  {
                    required: true,
                    message: '启用Webhook时必须填写端点地址',
                  },
                  {
                    validator: (value, callback) => {
                      if (value && !/^https?:\/\/.+/.test(value)) {
                        callback('请输入有效的URL地址');
                      } else {
                        callback();
                      }
                    },
                  },
                ]}
              >
                <Input placeholder="请输入Webhook端点URL" />
              </Form.Item>

              <Form.Item
                label="Webhook请求头"
                field="webhook_headers"
                tooltip='JSON格式的请求头，例如：{"Authorization": "Bearer token"}'
                rules={[
                  {
                    validator: (value, callback) => {
                      if (!value) {
                        callback();
                        return;
                      }
                      try {
                        JSON.parse(value);
                        callback();
                      } catch (error: unknown) {
                        // ✅ Correct: Extract actual error information
                        const errorObj =
                          error instanceof Error
                            ? error
                            : new Error(String(error));
                        const errorMessage =
                          errorObj.message || '请输入有效的JSON格式';
                        callback(errorMessage);
                      }
                    },
                  },
                ]}
              >
                <Input.TextArea placeholder="请输入JSON格式的请求头" rows={3} />
              </Form.Item>
            </>
          ) : null
        }
      </Form.Item>
    </>
  );
};
