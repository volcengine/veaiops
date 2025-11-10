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

/**
 * Create connection modal component
 */

import { getDataSourceDisplayName } from '@/utils/data-source-utils';
import { Form, Modal } from '@arco-design/web-react';
import type { ConnectCreateRequest, DataSourceType } from 'api-generate';
import type React from 'react';
import { useEffect } from 'react';
import { ConnectForm } from '../forms/connect-form';

export interface CreateConnectionModalProps {
  type: DataSourceType;
  visible: boolean;
  onSubmit: (values: ConnectCreateRequest) => Promise<boolean>;
  onCancel: () => void;
}

export const CreateConnectionModal: React.FC<CreateConnectionModalProps> = ({
  type,
  visible,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  // Reset form when component is destroyed
  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible]);

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={`新建${getDataSourceDisplayName(type)}连接`}
      visible={visible}
      onCancel={handleCancel}
      maskClosable={false}
      footer={null}
      style={{ width: 600 }}
      unmountOnExit
    >
      <ConnectForm
        form={form}
        type={type}
        onSubmit={onSubmit}
        onCancel={handleCancel}
      />
    </Modal>
  );
};
