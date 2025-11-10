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
 * Edit connection modal component
 */

import { getDataSourceDisplayName } from '@/utils/data-source-utils';
import { Form, Modal } from '@arco-design/web-react';
import type {
  Connect,
  ConnectUpdateRequest,
  DataSourceType,
} from 'api-generate';
import type React from 'react';
import { ConnectForm } from '../forms/connect-form';

export interface EditConnectionModalProps {
  type: DataSourceType;
  visible: boolean;
  editingConnect: Connect | null;
  onSubmit: (values: ConnectUpdateRequest) => Promise<boolean>;
  onCancel: () => void;
}

export const EditConnectionModal: React.FC<EditConnectionModalProps> = ({
  type,
  visible,
  editingConnect,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  // Handle initial values, ensure password fields are empty
  const getInitialValues = () => {
    if (!editingConnect) {
      return undefined;
    }

    // Connect type itself doesn't include password fields, but to ensure password fields are empty, explicitly set them
    return {
      ...editingConnect,
      zabbix_api_password: '',
      aliyun_access_key_secret: '',
      volcengine_access_key_secret: '',
    };
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={`编辑${getDataSourceDisplayName(type)}连接`}
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
        initialValues={getInitialValues()}
        onSubmit={onSubmit}
        onCancel={handleCancel}
      />
    </Modal>
  );
};
