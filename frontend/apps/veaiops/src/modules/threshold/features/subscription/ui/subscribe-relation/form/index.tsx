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
import { SubscriptionOtherFields } from '@veaiops/components';
import type {
  SubscribeRelationCreate,
  SubscribeRelationUpdate,
  SubscribeRelationWithAttributes,
} from 'api-generate';
import type React from 'react';
import { useEffect } from 'react';
import { useSubscribeRelationFormLogic } from '../../../hooks';
import { UpdateTooltip } from '../update-tooltip/update-tooltip';
import { useFormInitializer, useFormLogic } from './hooks';
import { BasicFields, InterestFields, WebhookFields } from './sections';

/**
 * Subscribe relation form drawer component props interface
 */
interface SubscribeRelationFormProps {
  /** Whether the drawer is visible */
  visible: boolean;
  /** Callback to close the drawer */
  onClose: () => void;
  /** Callback to submit the form */
  onSubmit: (
    data: SubscribeRelationCreate | SubscribeRelationUpdate,
  ) => Promise<boolean>;
  /** Edit subscription relation data, null means create new */
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

  const { loading, handleSubmit, handleCancel } = useFormLogic({
    form,
    onSubmit,
    onClose,
    editData,
  });

  const { initializeForm } = useFormInitializer({
    form,
    visible,
    editData,
  });

  // Initialize form when edit data changes
  useEffect(() => {
    initializeForm();
  }, [initializeForm]);

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
          loading={loading}
          showProjectTooltip={showProjectTooltip}
          hideProjectTooltip={hideProjectTooltip}
        />

        <SubscriptionOtherFields
          eventLevelOptions={eventLevelOptions}
          showStrategyTooltip={showStrategyTooltip}
          hideStrategyTooltip={hideStrategyTooltip}
          eventLevelRequired={true}
          informStrategyRequired={true}
          UpdateTooltipComponent={UpdateTooltip}
          apiClient={apiClient}
        />

        <WebhookFields form={form} />
      </Form>
    </Drawer>
  );
};

export default SubscribeRelationForm;
