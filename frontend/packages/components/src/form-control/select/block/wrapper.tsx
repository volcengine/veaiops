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

import type { FC } from 'react';
import { FormItemWrapper } from '../../wrapper';
import type { FormItemControlProps } from '../../wrapper/types';
import { logger } from './logger';
import { SelectBlock } from './select-block';
import type { veArchSelectBlockProps } from './types/interface';

/**
 * SelectBlock component wrapped with FormItemWrapper
 * Provides form item wrapper functionality, supports vertical layout and other features
 */
const WrappedSelectBlock: FC<FormItemControlProps<veArchSelectBlockProps>> = (
  props,
) => {
  const { controlProps, ...wrapperProps } = props;

  // 🔧 Add wrapper layer logging - focus on tracking dependency
  logger.debug(
    'WrappedSelectBlock',
    '🔵 Props received (Wrapper layer)',
    {
      hasControlProps: Boolean(controlProps),
      controlPropsKeys: controlProps ? Object.keys(controlProps) : [],
      // 🎯 Focus: dependency tracking
      hasDependency: Boolean(controlProps?.dependency),
      dependency: controlProps?.dependency,
      dependencyString: JSON.stringify(controlProps?.dependency),
      dependencyType: typeof controlProps?.dependency,
      dependencyIsArray: Array.isArray(controlProps?.dependency),
      dependencyLength: Array.isArray(controlProps?.dependency)
        ? controlProps.dependency.length
        : 0,
      dependencyFirstItem: Array.isArray(controlProps?.dependency)
        ? controlProps.dependency[0]
        : undefined,
      // dataSource information
      hasDataSource: Boolean(controlProps?.dataSource),
      dataSourceType: typeof controlProps?.dataSource,
      dataSourceKeys:
        controlProps?.dataSource && typeof controlProps?.dataSource === 'object'
          ? Object.keys(controlProps.dataSource)
          : [],
      dataSourceApi:
        controlProps?.dataSource && typeof controlProps?.dataSource === 'object'
          ? (controlProps.dataSource as any).api
          : undefined,
      // Other key props
      placeholder: controlProps?.placeholder,
      disabled: controlProps?.disabled,
      canFetch: controlProps?.canFetch,
      id: controlProps?.id,
    },
    'WrappedSelectBlock',
  );

  return (
    <FormItemWrapper {...wrapperProps}>
      <SelectBlock
        triggerProps={{
          style: {
            zIndex: 1200,
          },
        }}
        {...controlProps}
      />
    </FormItemWrapper>
  );
};

export { WrappedSelectBlock };
