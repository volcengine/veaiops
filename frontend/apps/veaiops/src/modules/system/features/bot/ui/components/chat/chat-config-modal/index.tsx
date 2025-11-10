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

import { Divider, Form, Modal } from '@arco-design/web-react';
import { IconRobot } from '@arco-design/web-react/icon';
import type { ChatConfigFormData } from '@bot/lib';
import type { Chat } from 'api-generate';
import { useEffect } from 'react';
import { AgentConfigSection, ChatInfoSection } from './sections';
import './chat-config-modal.less';

interface ChatConfigModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (config: ChatConfigFormData) => Promise<boolean>;
  chat: Chat | null;
}

/**
 * Chat configuration edit modal
 *
 * Split explanation:
 * - sections/chat-info-section.tsx: Chat info section (chat name, chat ID, enterprise collaboration tool)
 * - sections/agent-config-section.tsx: Agent functionality configuration section (proactive reply Agent, content recognition Agent)
 * - index.tsx: Main entry component, responsible for assembly and rendering
 *
 * Corresponds to origin/feat/web-v2 branch implementation, ensures functional consistency
 */
export const ChatConfigModal: React.FC<ChatConfigModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  chat,
}) => {
  const [form] = Form.useForm();

  // Update form values when chat changes
  useEffect(() => {
    if (chat && visible) {
      form.setFieldsValue({
        enable_func_proactive_reply: chat.enable_func_proactive_reply ?? true,
        enable_func_interest: chat.enable_func_interest ?? true,
      });
    }
  }, [chat, visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      const success = await onSubmit(values);
      if (success) {
        form.resetFields();
      }
    } catch (error) {
      // Form validation failed, silently handle
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div className="chat-config-modal-title">
          <IconRobot className="title-icon" />
          <span>群功能配置</span>
        </div>
      }
      visible={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="保存配置"
      cancelText="取消"
      className="chat-config-modal"
      style={{ width: 600 }}
      maskClosable={false}
    >
      <ChatInfoSection chat={chat} />
      <Divider className="section-divider" />
      <AgentConfigSection form={form} />
    </Modal>
  );
};

export default ChatConfigModal;
