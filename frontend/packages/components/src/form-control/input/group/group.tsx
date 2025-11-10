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

import { FormItemWrapper } from '@/form-control';
import { Input, Select } from '@arco-design/web-react';
import type {
  InputGroupProps,
  InputProps,
} from '@arco-design/web-react/es/Input/interface';
import type { SelectProps } from '@arco-design/web-react/es/Select/interface';
import { isEmpty } from 'lodash-es';
import { type FC, useEffect, useState } from 'react';

const commonInputProps = {
  placeholder: 'Please enter',
  autoComplete: 'off' as const,
};

const commonSelectProps = {
  placeholder: 'Please select',
};

/**
 * InputGroup component wrapper
 * Provides form item wrapper functionality, supports vertical layout and other features
 */
const InputGroup: FC<
  InputGroupProps & {
    selectProps?: SelectProps;
    inputProps?: InputProps;
    value?: Record<string, string>;
    onChange?: (v?: Record<string, string>) => void;
  }
> = ({ value, selectProps, inputProps, onChange }) => {
  const [selectValue, setSelectValue] = useState<string>(
    selectProps?.options?.[0] as string,
  );
  const [inputValue, setInputValue] = useState<string>();

  useEffect(() => {
    if (!isEmpty(value)) {
      Object.keys(value).forEach((key) => {
        setSelectValue(key);
        setInputValue(value[key]);
      });
    }
  }, [value]);

  useEffect(() => {
    if (selectValue && inputValue) {
      onChange?.({
        [selectValue]: inputValue,
      });
    } else {
      onChange?.(undefined);
    }
  }, [selectValue, inputValue, onChange]);

  return (
    <FormItemWrapper>
      <div style={{ display: 'inline-block' }}>
        <Input.Group compact>
          <Select
            style={{ width: 120 }}
            {...commonSelectProps}
            {...selectProps}
            onChange={setSelectValue}
          />
          <Input
            style={{ width: 220 }}
            {...commonInputProps}
            {...inputProps}
            onChange={setInputValue}
          />
        </Input.Group>
      </div>
    </FormItemWrapper>
  );
};

export { InputGroup };
