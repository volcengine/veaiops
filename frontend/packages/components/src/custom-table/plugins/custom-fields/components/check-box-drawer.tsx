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

import type { BaseRecord, CustomFieldsProps } from '@/custom-table/types';
import { Checkbox, Drawer, Space } from '@arco-design/web-react';
// import type { CustomFieldsProps } from '@veaiops/types'; // Note: CustomFieldsProps type does not exist
/**
 * CheckBox Drawer component
 * Configuration drawer for CustomFields
 */
import React from 'react';

interface CheckBoxDrawerProps<T extends Record<string, unknown>>
  extends Pick<
    CustomFieldsProps<T>,
    'disabledFields' | 'columns' | 'value' | 'confirm'
  > {
  title: string;
  visible: boolean;
  close: () => void;
}

export const CheckBoxDrawer = <T extends Record<string, unknown>>({
  title,
  disabledFields,
  columns,
  visible,
  close,
  value = [],
  confirm,
}: CheckBoxDrawerProps<T>): React.ReactElement => {
  const [selectedFields, setSelectedFields] = React.useState<string[]>(value);

  React.useEffect(() => {
    setSelectedFields(value);
  }, [value]);

  const handleConfirm = () => {
    confirm(selectedFields);
    close();
  };

  interface HandleFieldToggleParams {
    field: string;
    checked: boolean;
  }

  const handleFieldToggle = ({ field, checked }: HandleFieldToggleParams) => {
    if (checked) {
      setSelectedFields((prev) => [...prev, field]);
    } else {
      setSelectedFields((prev) => prev.filter((f) => f !== field));
    }
  };

  type ColumnWithDataIndex = {
    dataIndex?: string;
    children?: ColumnWithDataIndex[];
  };

  const getAllFields = (columns: ColumnWithDataIndex[]): string[] => {
    const fields: string[] = [];
    columns.forEach((column) => {
      if (column.dataIndex) {
        fields.push(column.dataIndex);
      }
      if (column.children) {
        fields.push(...getAllFields(column.children));
      }
    });
    return fields;
  };

  const allFields = getAllFields(columns);

  return (
    <Drawer
      title={title}
      visible={visible}
      onOk={handleConfirm}
      onCancel={close}
      okText="Confirm"
      cancelText="Cancel"
      width={400}
      focusLock={false}
    >
      <div style={{ padding: '16px 0' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {allFields.map((field) => {
            const isDisabled = disabledFields.has(field);
            const isChecked = selectedFields.includes(field);

            return (
              <Checkbox
                key={field}
                checked={isChecked}
                disabled={isDisabled}
                onChange={(checked) => handleFieldToggle({ field, checked })}
              >
                {field}
              </Checkbox>
            );
          })}
        </Space>
      </div>
    </Drawer>
  );
};
