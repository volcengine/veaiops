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

import { Button, Drawer, Form, Space } from '@arco-design/web-react';
import { DrawerFormContent, useDrawerFormSubmit } from '@veaiops/utils';
import type React from 'react';
import { useFormLogic } from './hooks';
import { FormFields, TopAlert } from './sections';
import type { StrategyModalProps } from './types';

/**
 * Strategy modal component
 * Provides strategy creation and editing functionality
 */
export const StrategyModal: React.FC<StrategyModalProps> = ({
  visible,
  editingStrategy,
  onCancel,
  onSubmit,
  form,
  width = 800,
}) => {
  // Form logic
  const { botsOptions, chatOptions, selectedBotName } = useFormLogic(form);

  // Watch bot_id changes
  const bot_id = Form.useWatch('bot_id', form);

  // Use common drawer form submit Hook
  const { submitting, handleSubmit } = useDrawerFormSubmit({
    form,
    onSubmit: async (values) => {
      // Basic validation
      if (!values.name?.trim()) {
        throw new Error('Please enter strategy name');
      }
      return await onSubmit(values);
    },
    resetOnSuccess: true,
    closeOnSuccess: false, // Don't auto-close, controlled by parent component
  });

  return (
    <Drawer
      title={editingStrategy ? '编辑策略' : '新建策略'}
      visible={visible}
      onCancel={onCancel}
      width={width}
      maskClosable={false}
      // Prevent focus auto-jump causing container scroll reset
      autoFocus={false}
      focusLock={true}
      footer={
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} disabled={submitting}>
            取消
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={submitting}>
            保存
          </Button>
        </Space>
      }
    >
      <DrawerFormContent loading={submitting}>
        {/* Top alert information */}
        <TopAlert editingStrategy={editingStrategy} />

        {/* Form fields (includes notes at the bottom) */}
        <Form form={form} layout="vertical" autoComplete="off">
          <FormFields
            form={form}
            botsOptions={botsOptions}
            chatOptions={chatOptions}
            bot_id={bot_id}
            selectedBotName={selectedBotName}
          />
        </Form>
      </DrawerFormContent>
    </Drawer>
  );
};

export default StrategyModal;
