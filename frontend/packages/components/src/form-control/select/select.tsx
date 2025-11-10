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

import { Select } from '@arco-design/web-react';
import type React from 'react';
import type { FC } from 'react';
import { SelectBlock as AdvancedSelectBlock } from './block';
import { WrappedSelectBlock } from './block/wrapper';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectComponentsProps {
  options?: SelectOption[];
  value?: any;
  onChange?: (value: any) => void;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

const commonSelectProps = {
  allowClear: true,
  showSearch: true,
};

// Simple Select component for basic scenarios
const SimpleSelectBlock: FC<SelectComponentsProps> = (props) => {
  const { options = [], ...rest } = props;

  return (
    <Select {...commonSelectProps} {...rest}>
      {options.map((option) => (
        <Select.Option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </Select.Option>
      ))}
    </Select>
  );
};

export interface SelectComponentsType {
  Block: typeof WrappedSelectBlock;
  Simple: typeof SimpleSelectBlock;
}

const SelectComponents: SelectComponentsType = {
  Block: WrappedSelectBlock,
  Simple: SimpleSelectBlock,
};

// Export types
export type {
  VeArchSelectBlockProps,
  SelectDataSourceProps,
  Option,
  OptionfyProps,
  FinalSelectBlockProps,
  DataSourceSetter,
  SearchKeyConfig,
} from './block/interface';

// Export wrapped components and original components
export {
  WrappedSelectBlock,
  WrappedSelectBlock as SelectBlock,
  SimpleSelectBlock,
  SelectComponents as Select,
};
