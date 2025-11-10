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

import { Form } from '@arco-design/web-react';
import type { User } from 'api-generate';
import { useCallback, useState } from 'react';

/**
 * Modal state management Hook
 */
export const useModalState = () => {
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Open edit modal
  const handleEdit = useCallback(
    (user: User) => {
      setEditingUser(user);
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        is_active: user.is_active,
        is_supervisor: user.is_supervisor,
      });
      setModalVisible(true);
    },
    [form],
  );

  // Open create modal
  const handleAdd = useCallback(() => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  // Close modal
  const handleCancel = useCallback(() => {
    setModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  }, [form]);

  return {
    form,
    editingUser,
    modalVisible,
    setModalVisible,
    setEditingUser,
    handleEdit,
    handleAdd,
    handleCancel,
  };
};
