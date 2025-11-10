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

import type { ModuleType } from '@/types/module';
import { Button, Drawer, Form, Space } from '@arco-design/web-react';
// ✅ Optimization: Use shortest path, merge imports from same source
import { useDrawerManagement } from '@ec/shared';
import { useSubscriptionForm, useWebhookManagement } from '@ec/subscription';
import { DrawerFormContent } from '@veaiops/utils';
import type {
  SubscribeRelationCreate,
  SubscribeRelationUpdate,
  SubscribeRelationWithAttributes,
} from 'api-generate';
import type React from 'react';
import { useState } from 'react';
import {
  BasicInfoForm,
  EventLevelConfig,
  InterestConfig,
  NotificationConfig,
  WebhookConfig,
} from './components';

/**
 * Add/Edit subscription modal component props interface
 */
interface SubscriptionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (
    data: SubscribeRelationCreate | SubscribeRelationUpdate,
  ) => Promise<boolean>;
  initialData?: SubscribeRelationWithAttributes | null;
  title?: string;
  moduleType?: ModuleType;
}

/**
 * Add/Edit subscription modal component
 * Refactored version, uses split sub-components and custom Hooks
 */
export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialData,
  title = '新增订阅',
  moduleType,
}) => {
  // Control whether to enable scrolling to error position
  const [enableScrollToError, setEnableScrollToError] = useState(false);

  // Use form management Hook
  const { form, loading, handleSubmit } = useSubscriptionForm({
    visible,
    initialData,
    moduleType,
  });

  // Use Webhook management Hook
  // ✅ Fix: Pass initialData to correctly initialize webhook_headers in edit mode
  const {
    webhookHeaders,
    addWebhookHeader,
    removeWebhookHeader,
    updateWebhookHeader,
    resetWebhookHeaders,
  } = useWebhookManagement({ initialData });

  // Use drawer management Hook
  const {
    projectRefreshTrigger,
    strategyRefreshTrigger,
    openProjectImport,
    openStrategyCreate,
    renderProjectImportDrawer,
    renderStrategyCreateDrawer,
    showProjectTooltip,
    showStrategyTooltip,
    hideProjectTooltip,
    hideStrategyTooltip,
  } = useDrawerManagement();

  // Watch Webhook switch state
  const enableWebhook = Form.useWatch('enable_webhook', form);

  // Handle form submission
  const handleFormSubmit = async () => {
    // Enable scrolling to error position on submission
    setEnableScrollToError(true);

    try {
      await handleSubmit(
        onSubmit,
        () => {
          resetWebhookHeaders();
          onCancel();
        },
        webhookHeaders,
        enableWebhook,
      );
    } finally {
      // Disable scrolling to error position after submission completes
      setEnableScrollToError(false);
    }
  };

  return (
    <Drawer
      title={title}
      visible={visible}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" loading={loading} onClick={handleFormSubmit}>
            确定
          </Button>
        </Space>
      }
      style={{ width: 800 }}
    >
      <DrawerFormContent loading={Boolean(loading)}>
        <Form
          form={form}
          layout="vertical"
          scrollToFirstError={enableScrollToError}
        >
          {/* Basic information */}
          <BasicInfoForm form={form} moduleType={moduleType} />

          {/* Interest attributes configuration */}
          <InterestConfig
            projectRefreshTrigger={projectRefreshTrigger}
            onOpenProjectImport={openProjectImport}
            showProjectTooltip={showProjectTooltip}
            hideProjectTooltip={hideProjectTooltip}
          />

          {/* Event level configuration */}
          <EventLevelConfig />

          {/* Message card notification strategy configuration */}
          <NotificationConfig
            strategyRefreshTrigger={strategyRefreshTrigger}
            onOpenStrategyCreate={openStrategyCreate}
            showStrategyTooltip={showStrategyTooltip}
            hideStrategyTooltip={hideStrategyTooltip}
          />

          {/* Webhook configuration */}
          <WebhookConfig
            form={form}
            webhookHeaders={webhookHeaders}
            onAddWebhookHeader={addWebhookHeader}
            onRemoveWebhookHeader={removeWebhookHeader}
            onUpdateWebhookHeader={updateWebhookHeader}
          />
        </Form>
      </DrawerFormContent>

      {/* Render drawer components */}
      {renderProjectImportDrawer()}
      {renderStrategyCreateDrawer()}
    </Drawer>
  );
};

export default SubscriptionModal;
