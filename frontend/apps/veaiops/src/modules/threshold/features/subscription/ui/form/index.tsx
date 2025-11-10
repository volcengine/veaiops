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

import apiClient from '@/utils/api-client';
import { Drawer, Form } from '@arco-design/web-react';
import { SubscriptionOtherFields } from '@veaiops/components';
import { logger } from '@veaiops/utils';
import type React from 'react';
import { useEffect } from 'react';
import { useSubscribeRelationFormLogic } from '../hooks';
import { useFormInitializer, useFormLogic } from './hooks';
import { BasicFields, InterestFields, WebhookFields } from './sections';
import type { SubscribeRelationFormProps } from './types';
import { UpdateTooltip } from './update-tooltip';

/**
 * Subscribe relation form drawer component
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
  const { agentTypeOptions, eventLevelOptions } = useSubscribeRelationFormLogic(
    { moduleType },
  );

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

  // When edit data changes, populate form
  useEffect(() => {
    initializeForm();
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
export type { SubscribeRelationFormProps } from './types';
