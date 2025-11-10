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
  Card,
  Form,
  Switch,
  Tooltip,
  Typography,
} from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react';
import {
  IconEye,
  IconInfoCircle,
  IconMessage,
  IconRobot,
} from '@arco-design/web-react/icon';
import type React from 'react';

const { Text, Title } = Typography;

interface AgentConfigSectionProps {
  form: FormInstance;
}

/**
 * Agent feature configuration section component
 */
export const AgentConfigSection: React.FC<AgentConfigSectionProps> = ({
  form,
}) => {
  return (
    <div className="agent-config-section">
      <Title heading={5} className="section-title">
        <IconRobot className="section-title-icon" />
        Agent功能配置
      </Title>

      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        className="agent-form"
      >
        <Card className="agent-card">
          <Form.Item
            label={
              <div className="agent-label">
                <IconMessage className="agent-icon" />
                <span>主动回复Agent</span>
                <Tooltip content="开启后，机器人可以主动向群内发送消息，提供智能化的主动服务">
                  <IconInfoCircle className="help-icon" />
                </Tooltip>
              </div>
            }
            field="enable_func_proactive_reply"
            className="agent-form-item"
            triggerPropName="checked"
          >
            <Switch
              checkedText="开启"
              uncheckedText="关闭"
              className="agent-switch"
            />
          </Form.Item>

          <div className="agent-description">
            <Text type="secondary">
              智能分析群聊内容，主动提供相关信息和解决方案
            </Text>
          </div>
        </Card>

        <Card className="agent-card">
          <Form.Item
            label={
              <div className="agent-label">
                <IconEye className="agent-icon" />
                <span>内容识别Agent</span>
                <Tooltip content="开启后，机器人将使用大模型能力识别和分析群内会话，识别用户兴趣和需求">
                  <IconInfoCircle className="help-icon" />
                </Tooltip>
              </div>
            }
            field="enable_func_interest"
            className="agent-form-item"
            triggerPropName="checked"
          >
            <Switch
              checkedText="开启"
              uncheckedText="关闭"
              className="agent-switch"
            />
          </Form.Item>

          <div className="agent-description">
            <Text type="secondary">
              深度理解群聊内容，识别用户兴趣点和潜在需求
            </Text>
          </div>
        </Card>
      </Form>
    </div>
  );
};
