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

import baseStyles from '@/custom-table/base.module.less';
import { Tip } from '@/tip';
import { Empty, Link, Message, Spin } from '@arco-design/web-react';
import { IconFilter } from '@arco-design/web-react/icon';
import { selectColor, unselectColor } from '@veaiops/constants';
import type { Option, TableColumnTitleProps } from '@veaiops/types';
import { get, isNil } from 'lodash-es';
import { type FC, useCallback, useMemo, useState } from 'react';
import { BaseSelectFooter as BaseMultiSelectFooter } from './_base-multi-select-footer';
import { BaseSelectFooter as BaseSingleSelectFooter } from './_base-single-select-footer';
import {
  getArrayTypeOptions,
  isArrayOptions,
  isNormalOptions,
  isOptions,
} from './utils';

// Get constants and components from namespace

const useFrontEnumsOptions = (_frontEnum?: unknown) => ({
  data: [],
  loading: false,
  error: null,
  options: [],
});

const TitleFilter: FC<TableColumnTitleProps> = ({
  title,
  dataIndex,
  filters,
  onChange,
  queryOptions,
  tip,
  multiple = false, // Default to single select, consistent with latest version
  style,
  showTip = false, // Default to not show Tip, maintain backward compatibility
  frontEnum, // New: Support directly passing FrontEnum
}) => {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<Option[]>();

  // Use useFrontEnumsOptions to get enum options - must be called outside conditions
  const frontEnumOptions = useFrontEnumsOptions(frontEnum);

  // Get value
  const value = get(filters, dataIndex);

  // Color
  const color = useMemo(() => {
    if (typeof value === 'string' && value !== '') {
      return selectColor;
    }
    if (typeof value === 'number') {
      return selectColor;
    }

    if (Array.isArray(value) && value.length > 0) {
      return selectColor;
    }

    return unselectColor;
  }, [value]);

  // Method to get options
  const getOptions = useCallback(async () => {
    try {
      setLoading(true);

      // ✅ Prefer using frontEnum to get options
      if (frontEnum && frontEnumOptions) {
        const enumOptions = Array.isArray(frontEnumOptions)
          ? frontEnumOptions[0]?.options
          : frontEnumOptions.options;

        if (enumOptions) {
          setOptions(enumOptions as Option[]);
          setLoading(false);
          return;
        }
      }

      // Fallback to queryOptions
      if (typeof queryOptions !== 'function') {
        throw new Error('queryOptions or frontEnum not provided');
      }

      // Current query functions do not pass parameters
      const nextOptions = await queryOptions({
        dataIndex,
      });

      if (isArrayOptions(nextOptions)) {
        setOptions(getArrayTypeOptions(nextOptions));
      } else if (isOptions(nextOptions)) {
        setOptions(nextOptions);
      } else if (isNormalOptions(nextOptions)) {
        setOptions(
          nextOptions.map((option: string | number) => ({
            value: option,
            label: String(option),
          })),
        );
      } else {
        throw new Error();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Message.error(
        `Header component title: ${
          typeof title === 'string' ? title : '[ReactNode]'
        }, dataIndex: ${dataIndex} error occurred: ${errorMessage}`,
      );
      setOptions(undefined);
    } finally {
      setLoading(false);
    }
  }, [queryOptions, dataIndex, title, frontEnum, frontEnumOptions]);

  // Change function
  const handleChange = (nextValue?: (string | number)[] | string | number) => {
    if (isNil(nextValue)) {
      onChange('filters', {
        [dataIndex]: null,
      });
    } else {
      onChange('filters', {
        [dataIndex]: nextValue,
      });
    }
  };

  // Get basic selection function
  const BaseSelectFooter = multiple
    ? BaseMultiSelectFooter
    : BaseSingleSelectFooter;

  return (
    <div className={baseStyles.columnTitle} style={style}>
      {title && (
        <span className={baseStyles.columnText}>
          {title} {showTip && tip && <Tip content={tip} />}
        </span>
      )}
      <span className={baseStyles.columnAction}>
        <BaseSelectFooter
          options={options}
          value={value}
          onChange={handleChange}
          loading={loading}
          onVisibleChange={(visible) => {
            if (visible) {
              setLoading(true);
              getOptions();
            } else {
              setOptions(undefined);
            }
          }}
          notFoundContent={
            loading ? (
              <div className={baseStyles.loading}>
                <Spin className={baseStyles.spin} />
              </div>
            ) : (
              <Empty />
            )
          }
          triggerElement={
            <Link className={baseStyles.iconBox}>
              <IconFilter className={baseStyles.icon} style={{ color }} />
            </Link>
          }
        />
      </span>
    </div>
  );
};

export { TitleFilter };
