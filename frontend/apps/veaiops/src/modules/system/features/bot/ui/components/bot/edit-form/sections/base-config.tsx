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
  Form,
  Input,
  Link,
  Message,
  Tooltip,
  Typography,
} from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react';
import {
  IconCheckCircle,
  IconEye,
  IconEyeInvisible,
} from '@arco-design/web-react/icon';
import { type ExtendedBot, getBotSecret } from '@bot/lib';
import { CardWithTitle } from '@veaiops/components';
import { AutofillBlockerPresets } from '@veaiops/utils';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { LarkConfigGuide } from '../../lark-config-guide';

const { Text } = Typography;

interface BaseConfigProps {
  form: FormInstance;
  showSecrets: {
    secret: boolean;
  };
  toggleSecretVisibility: (field: 'secret') => void;
  bot: ExtendedBot;
}

/**
 * Base configuration block component
 */
export const BaseConfig: React.FC<BaseConfigProps> = ({
  form,
  showSecrets,
  toggleSecretVisibility,
  bot,
}) => {
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [showSecretTooltip, setShowSecretTooltip] = useState(false);

  /**
   * View encrypted information
   * Get decrypted secret value through API and fill into form
   */
  const handleViewSecret = useCallback(async () => {
    if (!bot._id) {
      Message.error('Bot ID 不存在');
      return;
    }

    setLoadingSecret(true);
    try {
      const secretValue = await getBotSecret({
        botId: bot._id,
        fieldName: 'secret',
      });

      // Handle returned data: response.data may be a string (including empty string)
      // Check if data exists (not null or undefined)
      if (secretValue !== null && secretValue !== undefined) {
        const trimmedValue = String(secretValue).trim();
        // Only fill back non-empty strings
        if (trimmedValue) {
          // Use setFieldsValue to ensure form updates correctly
          form.setFieldsValue({
            secret: trimmedValue,
          });
          // Use setTimeout to ensure Tooltip is shown after form update
          setTimeout(() => {
            setShowSecretTooltip(true);
          }, 100);
          Message.success('已获取加密信息');
        } else {
          // Empty string indicates the field is not configured
          Message.warning('该Bot的App Secret未配置');
        }
      } else {
        Message.warning('该Bot的App Secret未配置');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '获取加密信息失败';
      Message.error(errorMessage);
    } finally {
      setLoadingSecret(false);
    }
  }, [bot._id, form]);

  /**
   * Auto-hide Tooltip
   * When App Secret is successfully filled back, show for 3 seconds then auto-hide
   */
  useEffect(() => {
    if (showSecretTooltip) {
      const timer = setTimeout(() => {
        setShowSecretTooltip(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showSecretTooltip]);

  return (
    <CardWithTitle title="基础配置" className="mb-4">
      {/* Read-only display: Enterprise collaboration tool (not editable) */}
      <Form.Item label="企业协同工具" field="channel">
        <Input value={bot.channel} disabled />
      </Form.Item>

      {/* Read-only display: App ID (not editable) */}
      <Form.Item label="App ID" field="bot_id">
        <Input value={bot.bot_id} disabled />
      </Form.Item>

      <div style={{ position: 'relative' }}>
        <Form.Item
          label="App Secret"
          field="secret"
          rules={[
            {
              validator: (_value, cb) => {
                // In edit mode, allow empty to indicate no change to secret; if filled, validate length (minimum 1 character to avoid accidental empty string)
                if (!_value) {
                  cb();
                  return;
                }
                if (String(_value).length >= 1) {
                  cb();
                } else {
                  cb('App Secret 不可为空');
                }
              },
            },
          ]}
          extra={
            <div>
              <Text type="secondary" className="block">
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
              <Button
                type="text"
                size="small"
                loading={loadingSecret}
                onClick={handleViewSecret}
                style={{ fontSize: '12px', padding: 0, marginTop: '4px' }}
              >
                查看加密信息
              </Button>
            </div>
          }
        >
          <Input
            type={showSecrets.secret ? 'text' : 'password'}
            placeholder="请输入机器人应用凭证：App Secret（留空表示不修改）"
            allowClear
            {...AutofillBlockerPresets.appSecret()}
            suffix={
              <Button
                type="text"
                size="small"
                icon={showSecrets.secret ? <IconEyeInvisible /> : <IconEye />}
                onClick={() => toggleSecretVisibility('secret')}
              />
            }
          />
        </Form.Item>
        {showSecretTooltip && (
          <Tooltip
            content={
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <IconCheckCircle
                  style={{ color: '#1CB267', fontSize: '14px' }}
                />
                <span>已回填 App Secret</span>
              </div>
            }
            position="top"
            popupVisible={showSecretTooltip}
            popupHoverStay={true}
            getPopupContainer={(node) => node.parentElement || document.body}
          >
            <div
              style={{
                position: 'absolute',
                top: '29px',
                left: '0',
                right: '0',
                height: '32px',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
          </Tooltip>
        )}
      </div>

      {/* Lark configuration guide - Use current bot's ID */}
      {bot.bot_id && <LarkConfigGuide currentBotId={bot.bot_id} />}
    </CardWithTitle>
  );
};
