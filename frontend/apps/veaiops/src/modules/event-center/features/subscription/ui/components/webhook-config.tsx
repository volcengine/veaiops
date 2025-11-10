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
  Button,
  Card,
  Form,
  Input,
  Space,
  Switch,
} from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import type React from 'react';

/**
 * Webhook configuration component props interface
 */
interface WebhookConfigProps {
  form: FormInstance;
  webhookHeaders: Array<{ key: string; value: string }>;
  onAddWebhookHeader: () => void;
  onRemoveWebhookHeader: (index: number) => void;
  onUpdateWebhookHeader: (
    index: number,
    field: 'key' | 'value',
    value: string,
  ) => void;
}

/**
 * Webhook configuration component
 * Contains WEBHOOK event delivery configuration
 */
export const WebhookConfig: React.FC<WebhookConfigProps> = ({
  form,
  webhookHeaders,
  onAddWebhookHeader,
  onRemoveWebhookHeader,
  onUpdateWebhookHeader,
}) => {
  const enable_webhook = Form.useWatch('enable_webhook', form);

  /**
   * Validate Webhook URL
   */
  const validateWebhookUrl = (url: string) => {
    if (!url) {
      return true;
    }

    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  return (
    <Card title="WEBHOOK 投递事件" className="mb-4">
      <Form.Item
        label="开启 WEBHOOK 投递"
        field="enable_webhook"
        triggerPropName="checked"
      >
        <Switch />
      </Form.Item>

      {enable_webhook && (
        <>
          <Form.Item
            label="WEBHOOK 地址"
            field="webhook_endpoint"
            rules={[
              { required: true, message: '请输入 WEBHOOK 地址' },
              {
                validator: (value, callback) => {
                  if (!validateWebhookUrl(value)) {
                    callback(
                      '请输入有效的 WEBHOOK 地址（以 http:// 或 https:// 开头）',
                    );
                  } else {
                    callback();
                  }
                },
              },
            ]}
          >
            <Input placeholder="请输入 WEBHOOK 地址（以 http:// 或 https:// 开头）" />
          </Form.Item>

          <Form.Item label="扩展请求头">
            <div>
              {webhookHeaders.map((header, index) => (
                <Space key={index} style={{ display: 'flex', marginBottom: 8 }}>
                  <Input
                    placeholder="请求头名称"
                    value={header.key}
                    onChange={(value) =>
                      onUpdateWebhookHeader(index, 'key', value)
                    }
                    style={{ width: 260 }}
                  />
                  <Input
                    placeholder="请求头值"
                    value={header.value}
                    onChange={(value) =>
                      onUpdateWebhookHeader(index, 'value', value)
                    }
                    style={{ width: 400 }}
                  />
                  <Button
                    type="text"
                    status="danger"
                    icon={<IconDelete />}
                    onClick={() => onRemoveWebhookHeader(index)}
                  />
                </Space>
              ))}
              <Button
                type="dashed"
                icon={<IconPlus />}
                onClick={onAddWebhookHeader}
                style={{ width: '100%' }}
              >
                添加请求头
              </Button>
            </div>
          </Form.Item>
        </>
      )}
    </Card>
  );
};

export default WebhookConfig;
