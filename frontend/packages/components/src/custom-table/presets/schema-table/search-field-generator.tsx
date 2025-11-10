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

import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
} from '@arco-design/web-react';
import { EMPTY_CONTENT_TEXT } from '@veaiops/constants';
import type React from 'react';

import type { ColumnSchema } from '@/custom-table/types/schema-table';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * Generate search form fields
 */
export const generateSearchFields = (
  columns: ColumnSchema[],
): React.ReactNode[] => {
  return columns
    .filter((col) => col.filterable && !col.hideInSearch)
    .map((column) => {
      const {
        key,
        title,
        filterConfig,
        valueType: _valueType,
        valueEnum,
      } = column;

      if (!filterConfig) {
        return null;
      }

      const commonProps = {
        placeholder: filterConfig.placeholder || `Please enter ${title}`,
        allowClear: filterConfig.allowClear !== false,
      };

      switch (filterConfig.type) {
        case 'input':
          return (
            <Form.Item key={key} field={key} label={title}>
              <Input {...commonProps} />
            </Form.Item>
          );

        case 'select':
          return (
            <Form.Item key={key} field={key} label={title}>
              <Select
                {...commonProps}
                showSearch={filterConfig.showSearch}
                mode={filterConfig.multiple ? 'multiple' : undefined}
              >
                {(filterConfig.options || []).map((option) => {
                  const optionValue = option.value as string | number;
                  return (
                    <Option key={String(optionValue)} value={optionValue}>
                      {option.label}
                    </Option>
                  );
                })}
                {valueEnum &&
                  Object.entries(valueEnum).map(([value, config]) => (
                    <Option
                      key={String(value)}
                      value={value as string | number}
                    >
                      {config.text}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          );

        case 'dateRange':
          return (
            <Form.Item key={key} field={key} label={title}>
              <RangePicker
                placeholder={[
                  `Please select start ${title}`,
                  `Please select end ${title}`,
                ]}
                allowClear={commonProps.allowClear}
              />
            </Form.Item>
          );

        case 'numberRange':
          return (
            <Form.Item key={key} field={`${key}Range`} label={title}>
              <Space>
                <InputNumber placeholder="Min value" />{' '}
                <span>{EMPTY_CONTENT_TEXT}</span>
                <InputNumber placeholder="Max value" />{' '}
              </Space>
            </Form.Item>
          );

        default:
          return (
            <Form.Item key={key} field={key} label={title}>
              <Input {...commonProps} />
            </Form.Item>
          );
      }
    })
    .filter(Boolean);
};
