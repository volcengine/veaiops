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

import { Alert, Form, Modal } from '@arco-design/web-react';
import type { BotAttributeFormData, ModalType } from '@bot/types';
import type { BotAttribute } from 'api-generate';
import type React from 'react';
import { useState } from 'react';
import { useAttributeFormModalEffects } from './effects';
import { useAttributeFormModalHandlers } from './handlers';
import { useAttributeValues } from './hooks';
import { FormFields } from './sections';

/**
 * Bot attribute form modal component properties interface
 */
interface BotAttributeFormModalProps {
  visible: boolean;
  type: ModalType;
  attribute?: BotAttribute;
  loading: boolean;
  onSubmit: (values: BotAttributeFormData) => Promise<boolean>;
  onCancel: () => void;
}

/**
 * Bot attribute form modal component
 * Provides form interface for creating and editing Bot attributes
 *
 * Split description:
 * - hooks/use-attribute-values.ts: Logic for loading attribute values (load corresponding content options based on category)
 * - effects.ts: Side effect management (useEffect logic, update form values when editing)
 * - handlers.ts: Event handling (handleSubmit、handleCancel)
 * - sections/form-fields.tsx: Form field sections (category and content selectors)
 * - index.tsx: Main entry component, responsible for form rendering and submission
 */
export const BotAttributeFormModal: React.FC<BotAttributeFormModalProps> = ({
  visible,
  type,
  attribute,
  loading,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm<BotAttributeFormData>();
  const [selectedAttributeName, setSelectedAttributeName] =
    useState<string>('');
  const { valueOptions, loadingValues, loadAttributeValues, setValueOptions } =
    useAttributeValues();

  // Side effect management
  useAttributeFormModalEffects({
    form,
    type,
    attribute,
    setSelectedAttributeName,
    loadAttributeValues,
    setValueOptions,
  });

  // Event handling
  const { handleSubmit, handleCancel } = useAttributeFormModalHandlers({
    form,
    onSubmit,
    onCancel,
    setValueOptions,
    setSelectedAttributeName,
  });

  /**
   * Handle category change
   *
   * When user selects or clears category:
   * 1. Update selectedAttributeName state (controls enable/disable of project dropdown)
   * 2. Clear currently selected content
   * 3. If category is selected, load corresponding content options
   * 4. If category is cleared, clear content options
   */
  const handleAttributeNameChange = (value: string | undefined) => {
    const newValue = value || '';
    setSelectedAttributeName(newValue);
    // Clear content - use undefined instead of empty string
    form.setFieldValue('value', undefined);

    if (newValue) {
      // Load new content options
      loadAttributeValues(newValue);
    } else {
      // If category is cleared, clear content options
      setValueOptions([]);
    }
  };

  return (
    <Modal
      title={type === 'create' ? '新增关注' : '编辑'}
      visible={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      maskClosable={false}
      unmountOnExit
    >
      <Form form={form} layout="vertical">
        {/* Feature description */}
        <Alert
          type="info"
          content="添加关注项目后，该机器人将能够接收和处理对应项目的事件推送，实现智能告警、问题识别等ChatOps功能。"
          style={{ marginBottom: 16 }}
        />

        <FormFields
          form={form}
          type={type === 'detail' ? 'edit' : type}
          selectedAttributeName={selectedAttributeName}
          valueOptions={valueOptions}
          loadingValues={loadingValues}
          onAttributeNameChange={handleAttributeNameChange}
        />
      </Form>
    </Modal>
  );
};

export default BotAttributeFormModal;
