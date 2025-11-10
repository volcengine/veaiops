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

import { commonCascaderProps } from '@/constants';
import { Cascader } from '@arco-design/web-react';
import { useDeepCompareEffect, useMount } from 'ahooks';
import { type FC, useState } from 'react';

export interface CascaderOption {
  label: string;
  value: string | number;
  children?: CascaderOption[];
  disabled?: boolean;
}

export interface CascaderBlockProps {
  options?: CascaderOption[];
  dataSource?: (params: any) => Promise<CascaderOption[]>;
  value?: (string | string[])[];
  onChange?: (
    value: (string | string[])[],
    selectedOptions?: CascaderOption[],
  ) => void;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  loading?: boolean;
  [key: string]: any;
}

const CascaderBlock: FC<CascaderBlockProps> = (props: CascaderBlockProps) => {
  // Destructure props object, get options and dataSource properties, assign remaining properties to rest variable
  const { options: initialOptions = [], dataSource, ...rest } = props;

  const [options, setOptions] = useState<CascaderOption[]>(initialOptions);

  const [loading, setLoading] = useState<boolean>(false);

  // Define retrieveDataSource async function to fetch data source
  const retrieveDataSource = async () => {
    if (!dataSource) {
      return;
    }
    setLoading(true);
    try {
      const newOptions = await dataSource({});
      setOptions(newOptions);
    } catch (error: unknown) {
      // Log error but don't interrupt flow, cascader data loading failure should not affect overall functionality
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      console.error('[CascaderBlock] Data source loading failed:', errorObj);
    } finally {
      setLoading(false);
    }
  };

  // Use useDeepCompareEffect hook to handle deep comparison side effects for initialOptions
  useDeepCompareEffect(() => {
    if (!initialOptions) {
      return;
    }
    setOptions(initialOptions);
  }, [initialOptions]);

  // Use useMount hook to handle side effects when component mounts
  useMount(async () => {
    await retrieveDataSource();
  });

  return (
    <Cascader
      {...commonCascaderProps}
      loading={loading}
      options={options}
      {...rest}
    />
  );
};

export { CascaderBlock };
