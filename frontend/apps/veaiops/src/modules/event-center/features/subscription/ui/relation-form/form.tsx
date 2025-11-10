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
import apiClient from '@/utils/api-client';
import { Drawer, Form } from '@arco-design/web-react';
import { useSubscribeRelationFormLogic } from '@ec/subscription';
import { SubscriptionOtherFields } from '@veaiops/components';
import { logger } from '@veaiops/utils';
import type {
  SubscribeRelationCreate,
  SubscribeRelationUpdate,
  SubscribeRelationWithAttributes,
} from 'api-generate';
import type React from 'react';
import { useEffect } from 'react';
import { UpdateTooltip } from '../update-tooltip';
import { BasicFields, InterestFields, WebhookFields } from './components';
import { useFormInitializer, useFormLogic } from './hooks';

/**
 * Subscription relation form component props
 */
interface SubscribeRelationFormProps {
  /** Whether drawer is visible */
  visible: boolean;
  /** Callback to close drawer */
  onClose: () => void;
  /** Callback to submit form */
  onSubmit: (
    data: SubscribeRelationCreate | SubscribeRelationUpdate,
  ) => Promise<boolean>;
  /** Subscription relation data for editing, null means creating new */
  editData?: SubscribeRelationWithAttributes | null;
  /** Form title */
  title?: string;
  /** Module type, used to determine which Agent options to display */
  moduleType?: ModuleType;
  /** Whether to show project import tooltip */
  showProjectTooltip?: boolean;
  /** Whether to show strategy creation tooltip */
  showStrategyTooltip?: boolean;
  /** Callback to hide project tooltip */
  hideProjectTooltip?: () => void;
  /** Callback to hide strategy tooltip */
  hideStrategyTooltip?: () => void;
}

/**
 * Subscription relation form drawer component
 * @description Drawer form for creating and editing subscription relations
 */
const SubscribeRelationForm: React.FC<SubscribeRelationFormProps> = ({
  visible,
  onClose,
  onSubmit,
  editData,
  title,
  moduleType,
  showProjectTooltip = false,
  showStrategyTooltip = false,
  hideProjectTooltip,
  hideStrategyTooltip,
}) => {
  const [form] = Form.useForm();
  const { agentTypeOptions, eventLevelOptions } =
    useSubscribeRelationFormLogic(moduleType);

  // Form logic
  const { loading, handleSubmit, handleCancel, resetForm } = useFormLogic({
    form,
    onSubmit,
    onClose,
    editData,
  });

  // Form initialization
  const { initializeForm } = useFormInitializer({
    form,
    visible,
    editData,
  });

  // Fill form when edit data changes
  useEffect(() => {
    initializeForm();

    // Debug log: snapshot input autocomplete attribute in development
    try {
      const el = document.querySelector('input[placeholder="请输入订阅名称"]');
      logger.debug({
        message: 'Input autocomplete snapshot',
        data: {
          autocomplete: el?.getAttribute('autocomplete') || null,
        },
        source: 'SubscribeRelationForm',
        component: 'useEffect',
      });
    } catch (error: unknown) {
      // ✅ Correct: Expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.debug({
        message: 'Input autocomplete snapshot failed',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'SubscribeRelationForm',
        component: 'useEffect',
      });
    }
  }, [visible, editData, initializeForm]);

  return (
    <Drawer
      width={800}
      title={title || (editData ? '编辑订阅关系' : '新建订阅关系')}
      visible={visible}
      confirmLoading={loading}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="确定"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <BasicFields form={form} agentTypeOptions={agentTypeOptions} />
        <InterestFields
          form={form}
          loading={loading}
          showProjectTooltip={showProjectTooltip}
          hideProjectTooltip={hideProjectTooltip}
        />
        <SubscriptionOtherFields
          eventLevelOptions={eventLevelOptions}
          showStrategyTooltip={showStrategyTooltip}
          hideStrategyTooltip={hideStrategyTooltip}
          eventLevelRequired={true}
          informStrategyRequired={false}
          informStrategyPlaceholder="请选择消息卡片通知策略（不选择表示不通知）"
          UpdateTooltipComponent={UpdateTooltip}
          apiClient={apiClient}
        />
        <WebhookFields form={form} />
      </Form>
    </Drawer>
  );
};

export default SubscribeRelationForm;
