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

import { hijackControlComponentProps } from '@/filters/core/utils';
import { CascaderBlock, EnumsCheckBoxGroup } from '@/form-control';
import { SelectBlock } from '@/form-control/select';
import { Checkbox, TreeSelect } from '@arco-design/web-react';
import type { FilterPlugin } from '@veaiops/types';
import { logger } from '@veaiops/utils';
import type React from 'react';
import { useEffect } from 'react';

// Select plugin - Basic selector (enhanced: automatically select first option when defaultActiveFirstOption=true and options are ready)
export const SelectPlugin: FilterPlugin = {
  type: 'Select',
  name: 'Selector',
  description: 'Basic dropdown select component',
  version: '2.1.0',
  render: ({
    componentProps,
    hijackedProps,
  }: {
    componentProps: Record<string, unknown>;
    hijackedProps: Record<string, unknown>;
  }) => {
    const {
      value,
      mode,
      options,
      defaultActiveFirstOption,
      onChange,
      loading,
      ...rest
    } = hijackedProps || {};

    // Add log tracking
    logger.info({
      message: 'SelectPlugin render called',
      data: {
        hasOptions: Boolean(options),
        optionsLength: Array.isArray(options) ? options.length : 0,
        value,
        defaultActiveFirstOption,
        addBefore: (hijackedProps as any)?.addBefore,
      },
      source: 'SelectPlugin',
      component: 'render',
    });

    // Small renderer: fallback to automatically select first option when options are ready (only when defaultActiveFirstOption is enabled and current value is empty)
    const DefaultFirstWrapper: React.FC = () => {
      useEffect(() => {
        const isMultiple = mode === 'multiple' || mode === 'tags';
        const hasValue =
          (isMultiple &&
            Array.isArray(value) &&
            (value as unknown[]).length > 0) ||
          (!isMultiple &&
            value !== undefined &&
            value !== null &&
            value !== '');

        // Only trigger when defaultActiveFirstOption is enabled, no current value, and options exist
        if (
          defaultActiveFirstOption === true &&
          !hasValue &&
          Array.isArray(options) &&
          options.length > 0 &&
          typeof onChange === 'function'
        ) {
          const first = options[0] as unknown;
          let firstValue: unknown;
          if (
            first &&
            typeof first === 'object' &&
            'value' in (first as Record<string, unknown>)
          ) {
            firstValue = (first as { value?: unknown }).value;
          } else {
            firstValue = first;
          }

          // Output debug logs for troubleshooting
          if (process.env.NODE_ENV === 'development') {
            logger.info({
              message: 'SelectPlugin defaultActiveFirstOption applied',
              data: {
                mode,
                firstValue,
                optionsLen: options.length,
              },
              source: 'CustomTable',
              component: 'SelectPlugin',
            });
          }

          try {
            if (isMultiple) {
              (onChange as (v: unknown) => void)([firstValue]);
            } else {
              (onChange as (v: unknown) => void)(firstValue);
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              logger.warn({
                message: 'SelectPlugin apply default first failed',
                data: { error },
                source: 'CustomTable',
                component: 'SelectPlugin',
              });
            }
          }
        }
      }, [defaultActiveFirstOption, value, mode, options, onChange]);

      return (
        <SelectBlock
          {...(rest as any)}
          value={value}
          mode={mode as any}
          options={options as any}
          onChange={onChange as any}
          loading={loading as any}
          defaultActiveFirstOption={defaultActiveFirstOption}
        />
      );
    };

    return <DefaultFirstWrapper />;
  },
  validateConfig: (config: Record<string, unknown>) =>
    typeof config === 'object',
  defaultConfig: {
    placeholder: 'Please select',
    allowClear: true,
  },
};

// Cascader plugin
export const CascaderPlugin: FilterPlugin = {
  type: 'Cascader',
  name: 'Cascader',
  description: 'Cascader select component',
  version: '1.0.0',
  render: ({ hijackedProps }: { hijackedProps: Record<string, unknown> }) => (
    <CascaderBlock {...hijackedProps} />
  ),
  validateConfig: (config: Record<string, unknown>) =>
    typeof config === 'object',
  defaultConfig: {
    placeholder: 'Please select',
    allowClear: true,
  },
};

// TreeSelect plugin
export const TreeSelectPlugin: FilterPlugin = {
  type: 'TreeSelect',
  name: 'Tree Select',
  description: 'Tree select component',
  version: '1.0.0',
  render: ({ hijackedProps }: { hijackedProps: Record<string, unknown> }) => (
    <TreeSelect {...hijackedProps} />
  ),
  validateConfig: (config: Record<string, unknown>) =>
    typeof config === 'object',
  defaultConfig: {
    placeholder: 'Please select',
    allowClear: true,
  },
};

// EnumsCheckBoxGroup plugin
export const EnumsCheckBoxGroupPlugin: FilterPlugin = {
  type: 'EnumsCheckBoxGroup',
  name: 'Enum Checkbox Group',
  description: 'Enum checkbox component',
  version: '1.0.0',
  render: ({ hijackedProps }: { hijackedProps: Record<string, unknown> }) => {
    const {
      multi = true,
      enums = [],
      labels = {},
      value,
      onChange,
      ...rest
    } = hijackedProps || {};

    return (
      <EnumsCheckBoxGroup
        multi={multi as boolean}
        enums={enums as any[]}
        labels={labels as any}
        value={value}
        onChange={onChange as any}
        {...rest}
      />
    );
  },
  validateConfig: (config: Record<string, unknown>) =>
    typeof config === 'object',
  defaultConfig: {
    direction: 'horizontal',
    multi: true,
  },
};

// Checkbox plugin
// CheckboxPlugin fix
export const CheckboxPlugin: FilterPlugin = {
  type: 'Checkbox',
  name: 'Checkbox',
  description: 'Single checkbox component',
  version: '1.0.0',
  render: ({ componentProps }: { componentProps: Record<string, unknown> }) => {
    const { label, ...restProps } = componentProps;
    return <Checkbox {...restProps}>{label as React.ReactNode}</Checkbox>;
  },
  validateConfig: (config: Record<string, unknown>) =>
    typeof config === 'object',
};

// CheckboxGroup plugin
export const CheckboxGroupPlugin: FilterPlugin = {
  type: 'CheckboxGroup',
  name: 'Checkbox Group',
  description: 'Checkbox group component',
  version: '1.0.0',
  render: ({ hijackedProps }) => <Checkbox.Group {...hijackedProps} />,
  validateConfig: (config: Record<string, unknown>) =>
    typeof config === 'object',
  defaultConfig: {
    direction: 'horizontal',
  },
};
