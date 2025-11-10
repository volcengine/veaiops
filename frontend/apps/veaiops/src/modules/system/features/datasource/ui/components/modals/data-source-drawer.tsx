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

import { Button, type FormInstance, Space } from '@arco-design/web-react';
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
} from '@arco-design/web-react';
import {
  type DataSource,
  authTypeOptions,
  sourceTypeOptions,
} from '@datasource/lib';
import { DrawerFormContent, useDrawerFormSubmit } from '@veaiops/utils';
import type React from 'react';

const { Option } = Select;
const { TextArea } = Input;

interface DataSourceDrawerProps {
  visible: boolean;
  editingSource: DataSource | null;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<boolean>;
}

/**
 * Data source form drawer component
 */
export const DataSourceDrawer: React.FC<DataSourceDrawerProps> = ({
  visible,
  editingSource,
  form,
  onCancel,
  onSubmit,
}) => {
  // Use shared drawer form submit Hook
  const { submitting, handleSubmit } = useDrawerFormSubmit({
    form,
    onSubmit,
    resetOnSuccess: true,
    closeOnSuccess: false, // Do not auto-close, controlled by parent component
  });

  // Reset form state after drawer is completely closed
  const handleAfterClose = () => {
    form.resetFields();
    form.clearFields();
  };

  return (
    <Drawer
      title={editingSource ? '编辑数据源' : '新增数据源'}
      visible={visible}
      onCancel={onCancel}
      afterClose={handleAfterClose}
      width={600}
      placement="right"
      unmountOnExit
      focusLock={false}
      footer={
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} disabled={submitting}>
            取消
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={submitting}>
            {editingSource ? '保存' : '创建'}
          </Button>
        </Space>
      }
    >
      <DrawerFormContent loading={submitting}>
        <Form form={form} layout="vertical">
          <Form.Item
            label="数据源名称"
            field="name"
            rules={[{ required: true, message: '请输入数据源名称' }]}
          >
            <Input placeholder="请输入数据源名称" />
          </Form.Item>

          <Form.Item
            label="数据源类型"
            field="type"
            rules={[{ required: true, message: '请选择数据源类型' }]}
          >
            <Select placeholder="请选择数据源类型">
              {sourceTypeOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="描述" field="description">
            <TextArea
              placeholder="请输入数据源描述"
              rows={3}
              maxLength={200}
              showWordLimit
            />
          </Form.Item>

          <Form.Item
            label="端点地址"
            field="endpoint"
            rules={[{ required: true, message: '请输入端点地址' }]}
          >
            <Input placeholder="http://example.com:9090" />
          </Form.Item>

          <Form.Item
            label="认证类型"
            field="auth_type"
            rules={[{ required: true, message: '请选择认证类型' }]}
          >
            <Select placeholder="请选择认证类型">
              {authTypeOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item shouldUpdate>
            {(values) => {
              const authType = values.auth_type;
              if (authType === 'basic') {
                return (
                  <>
                    <Form.Item
                      label="用户名"
                      field="config.username"
                      rules={[{ required: true, message: '请输入用户名' }]}
                    >
                      <Input placeholder="请输入用户名" />
                    </Form.Item>
                    <Form.Item
                      label="密码"
                      field="config.password"
                      rules={[{ required: true, message: '请输入密码' }]}
                    >
                      <Input.Password placeholder="请输入密码" />
                    </Form.Item>
                  </>
                );
              }
              if (authType === 'api_key') {
                return (
                  <Form.Item
                    label="API Key"
                    field="config.api_key"
                    rules={[{ required: true, message: '请输入API Key' }]}
                  >
                    <Input.Password placeholder="请输入API Key" />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item
            label="查询间隔(秒)"
            field="config.query_interval"
            rules={[{ required: true, message: '请输入查询间隔' }]}
          >
            <InputNumber
              placeholder="60"
              min={10}
              max={3600}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            label="超时时间(秒)"
            field="config.timeout"
            rules={[{ required: true, message: '请输入超时时间' }]}
          >
            <InputNumber
              placeholder="30"
              min={5}
              max={300}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            label="重试次数"
            field="config.retry_count"
            rules={[{ required: true, message: '请输入重试次数' }]}
          >
            <InputNumber placeholder="3" min={0} max={10} className="w-full" />
          </Form.Item>
        </Form>
      </DrawerFormContent>
    </Drawer>
  );
};
