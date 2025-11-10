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

import { Button, Checkbox, Typography } from '@arco-design/web-react';
import styles from './index.module.less';

export interface EnumsCheckBoxGroupProps<EnumsObject = any> {
  multi: boolean;
  enums: Array<keyof EnumsObject>; // Enum values, supports both array and enum object formats
  labels: EnumsObject;
  value: any;
  onChange: (values: Array<keyof EnumsObject> | keyof EnumsObject) => void;
  countsMap?: Record<keyof EnumsObject, number>;
  showCount?: boolean;
  disableEnums?: Array<keyof EnumsObject>;
}

const EnumsCheckBoxGroup = <EnumsObject = any>({
  enums,
  labels,
  value,
  onChange,
  multi = true,
  countsMap = {} as Record<keyof EnumsObject, number>,
  showCount = false,
  disableEnums = [],
}: EnumsCheckBoxGroupProps<EnumsObject>) => {
  const filters: Array<keyof EnumsObject> = Array.isArray(enums)
    ? enums
    : Object.values(enums);

  const renderCheckboxes = () =>
    filters.map((category) => (
      <Checkbox
        key={category as string}
        value={category}
        disabled={disableEnums?.includes(category)}
        onChange={(v: boolean) => {
          if (!multi) {
            onChange(category);
          }
        }}
      >
        {() => {
          const checked = multi
            ? value?.includes(category)
            : value === category;
          const disabled = disableEnums?.includes(category);
          const countText = showCount ? `（${countsMap[category] || 0}）` : '';
          return (
            <Button
              className={(() => {
                if (checked) {
                  return styles.active;
                }
                if (disabled) {
                  return styles.disabled;
                }
                return '';
              })()}
              tabIndex={-1}
              key={category as string}
            >
              <Typography.Text
                style={{
                  margin: 0,
                  color: !checked
                    ? 'var(--color-text-2)'
                    : 'rgb(var(--arcoblue-6))',
                }}
                ellipsis={{ cssEllipsis: true, showTooltip: true }}
              >
                {`${labels[category]} ${showCount ? countText : ''}`}
              </Typography.Text>
            </Button>
          );
        }}
      </Checkbox>
    ));

  return multi ? (
    <Checkbox.Group
      className={`flex flex-wrap gap-0.1 ${styles.checkBoxGroupWrap}`}
      onChange={(v) => {
        if (multi) {
          onChange?.(v as unknown as Array<keyof EnumsObject>);
        }
      }}
    >
      {renderCheckboxes()}
    </Checkbox.Group>
  ) : (
    <div className={`flex flex-wrap gap-0.1 ${styles.checkBoxGroupWrap}`}>
      {renderCheckboxes()}
    </div>
  );
};

export { EnumsCheckBoxGroup };
