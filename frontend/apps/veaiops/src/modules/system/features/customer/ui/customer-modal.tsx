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

import { Form, Input, Modal, Select } from '@arco-design/web-react';
import {
  CUSTOMER_LEVEL_OPTIONS,
  CUSTOMER_MANAGEMENT_CONFIG,
  CUSTOMER_TYPE_OPTIONS,
  type CustomerFormData,
  type CustomerModalProps,
} from '@customer';
import type React from 'react';

/**
 * Customer modal component
 * Provides customer creation and editing functionality
 */
export const CustomerModal: React.FC<CustomerModalProps> = ({
  visible,
  editingCustomer,
  onCancel,
  onSubmit,
  form,
}) => {
  const isEditing = Boolean(editingCustomer);

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      await onSubmit(values as CustomerFormData);
    } catch (error) {
      // Error already handled in Hook, silently handle here
    }
  };

  return (
    <Modal
      title={isEditing ? '编辑客户' : '新增客户'}
      visible={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText={isEditing ? '更新' : '创建'}
      cancelText="取消"
      style={{ width: 600 }}
      maskClosable={false}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          label="客户名称"
          field="name"
          rules={[
            { required: true, message: '请输入客户名称' },
            {
              maxLength: CUSTOMER_MANAGEMENT_CONFIG.maxNameLength,
              message: `客户名称不能超过${CUSTOMER_MANAGEMENT_CONFIG.maxNameLength}个字符`,
            },
          ]}
        >
          <Input placeholder="请输入客户名称" />
        </Form.Item>

        <Form.Item
          label="联系人"
          field="contact"
          rules={[{ required: true, message: '请输入联系人姓名' }]}
        >
          <Input placeholder="请输入联系人姓名" />
        </Form.Item>

        <Form.Item
          label="邮箱"
          field="email"
          rules={[
            { required: true, message: '请输入邮箱地址' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input placeholder="请输入邮箱地址" />
        </Form.Item>

        <Form.Item
          label="电话"
          field="phone"
          rules={[
            { required: true, message: '请输入电话号码' },
            {
              validator: (value, callback) => {
                if (value && !/^1[3-9]\d{9}$/.test(value)) {
                  callback('请输入有效的手机号码');
                } else {
                  callback();
                }
              },
            },
          ]}
        >
          <Input placeholder="请输入电话号码" />
        </Form.Item>

        <Form.Item
          label="公司"
          field="company"
          rules={[{ required: true, message: '请输入公司名称' }]}
        >
          <Input placeholder="请输入公司名称" />
        </Form.Item>

        <Form.Item
          label="地址"
          field="address"
          rules={[
            {
              maxLength: CUSTOMER_MANAGEMENT_CONFIG.maxAddressLength,
              message: `地址不能超过${CUSTOMER_MANAGEMENT_CONFIG.maxAddressLength}个字符`,
            },
          ]}
        >
          <Input placeholder="请输入地址" />
        </Form.Item>

        <Form.Item
          label="客户类型"
          field="type"
          rules={[{ required: true, message: '请选择客户类型' }]}
        >
          <Select placeholder="请选择客户类型">
            {CUSTOMER_TYPE_OPTIONS.filter((option) => option.value).map(
              (option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ),
            )}
          </Select>
        </Form.Item>

        <Form.Item
          label="客户等级"
          field="level"
          rules={[{ required: true, message: '请选择客户等级' }]}
        >
          <Select placeholder="请选择客户等级">
            {CUSTOMER_LEVEL_OPTIONS.filter((option) => option.value).map(
              (option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ),
            )}
          </Select>
        </Form.Item>

        <Form.Item
          label="描述"
          field="description"
          rules={[
            {
              maxLength: CUSTOMER_MANAGEMENT_CONFIG.maxDescriptionLength,
              message: `描述不能超过${CUSTOMER_MANAGEMENT_CONFIG.maxDescriptionLength}个字符`,
            },
          ]}
        >
          <Input.TextArea
            placeholder="请输入客户描述信息"
            rows={4}
            showWordLimit
            maxLength={CUSTOMER_MANAGEMENT_CONFIG.maxDescriptionLength}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CustomerModal;
