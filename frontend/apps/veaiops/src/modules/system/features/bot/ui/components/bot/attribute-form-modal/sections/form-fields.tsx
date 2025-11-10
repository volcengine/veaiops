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

import { Form, Link, Select } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react';
import { ATTRIBUTE_OPTIONS, type BotAttributeFormData } from '@bot/types';
import type React from 'react';

interface FormFieldsProps {
  form: FormInstance<BotAttributeFormData>;
  type: 'create' | 'edit';
  selectedAttributeName: string;
  valueOptions: Array<{ label: string; value: string }>;
  loadingValues: boolean;
  onAttributeNameChange: (value: string | undefined) => void;
}

/**
 * Form fields block component
 *
 * Note: The onChange for category must be bound to Select, not Form.onValuesChange
 * Because Form.onValuesChange will be triggered when form.resetFields() is called, causing infinite loop
 */
export const FormFields: React.FC<FormFieldsProps> = ({
  form,
  type,
  selectedAttributeName,
  valueOptions,
  loadingValues,
  onAttributeNameChange,
}) => {
  return (
    <>
      <Form.Item
        label="类目"
        field="name"
        rules={[{ required: true, message: '请选择类目' }]}
      >
        <Select
          placeholder="请选择类目"
          disabled={type === 'edit'}
          allowClear
          onChange={onAttributeNameChange}
        >
          {ATTRIBUTE_OPTIONS.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label="内容"
        field="value"
        rules={[
          {
            required: true,
            message: '请选择内容',
            validator: (value, callback) => {
              if (
                value === undefined ||
                value === '' ||
                (Array.isArray(value) && value.length === 0)
              ) {
                callback('请选择内容');
              } else {
                callback();
              }
            },
          },
        ]}
        extra={
          selectedAttributeName === 'project' && valueOptions.length === 0 ? (
            <span style={{ color: 'var(--color-text-3)' }}>
              暂无可选项目，请先前往{' '}
              <Link href="/system/project-management" target="_blank">
                项目管理
              </Link>{' '}
              导入或新增项目
            </span>
          ) : null
        }
      >
        <Select
          placeholder={
            selectedAttributeName
              ? `请选择${
                  ATTRIBUTE_OPTIONS.find(
                    (opt) => opt.value === selectedAttributeName,
                  )?.label
                }`
              : '请先选择类目'
          }
          disabled={!selectedAttributeName}
          loading={loadingValues}
          allowClear
          showSearch
          mode={type === 'create' ? 'multiple' : undefined} // Support multiple selection when creating, single selection when editing
          filterOption={(inputValue, option) =>
            option?.props?.children
              ?.toLowerCase()
              .includes(inputValue.toLowerCase())
          }
        >
          {valueOptions.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};
