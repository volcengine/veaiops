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
import type { SubscribeRelationWithAttributes } from 'api-generate';
import { useCallback, useState } from 'react';

/**
 * Modal state Hook
 * Manages form and edit state
 */
export const useModalState = () => {
  const [form] = Form.useForm();
  const [editingSubscription, setEditingSubscription] =
    useState<SubscribeRelationWithAttributes | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Open edit modal
  const handleEdit = useCallback(
    (subscription: SubscribeRelationWithAttributes) => {
      setEditingSubscription(subscription);
      form.setFieldsValue({
        ...subscription,
      });
      setModalVisible(true);
    },
    [form],
  );

  // Open add modal
  const handleAdd = useCallback(() => {
    setEditingSubscription(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  // Close modal
  const handleCancel = useCallback(() => {
    setModalVisible(false);
    setEditingSubscription(null);
    form.resetFields();
  }, [form]);

  return {
    form,
    editingSubscription,
    modalVisible,
    setModalVisible,
    setEditingSubscription,
    handleEdit,
    handleAdd,
    handleCancel,
  };
};
