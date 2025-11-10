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

import { useRef } from 'react';
import { logger } from '../logger';
import type { SelectOption, veArchSelectBlockProps } from '../types/interface';

/**
 * Base configuration Hook
 * Responsible for props destructuring, base configuration calculation, render counting, etc.
 */
export function useBaseConfig(props: veArchSelectBlockProps) {
  const hookTraceId = logger.generateTraceId();

  // 🔧 Detailed dataSource information logging
  const dataSourceInfo = props.dataSource
    ? {
        type: typeof props.dataSource,
        isObject:
          typeof props.dataSource === 'object' && props.dataSource !== null,
        keys:
          typeof props.dataSource === 'object' && props.dataSource !== null
            ? Object.keys(props.dataSource)
            : [],
        api:
          typeof props.dataSource === 'object' && props.dataSource !== null
            ? (props.dataSource as any).api
            : undefined,
        hasServiceInstance:
          typeof props.dataSource === 'object' && props.dataSource !== null
            ? 'serviceInstance' in props.dataSource
            : false,
      }
    : null;

  logger.info(
    'UseSelectBlock',
    '🟡 Hook execution started (useBaseConfig)',
    {
      propsKeys: Object.keys(props),
      // 🎯 Key point: dependency tracking
      hasDependency: Boolean(props.dependency),
      dependency: props.dependency,
      dependencyString: JSON.stringify(props.dependency),
      dependencyType: typeof props.dependency,
      dependencyIsArray: Array.isArray(props.dependency),
      dependencyLength: Array.isArray(props.dependency)
        ? props.dependency.length
        : 0,
      dependencyFirstItem: Array.isArray(props.dependency)
        ? props.dependency[0]
        : undefined,
      // dataSource information
      hasDataSource: Boolean(props.dataSource),
      dataSourceInfo,
      // Other information
      hasInitialOptions: Boolean(props.options?.length),
      mode: props.mode,
      placeholder: props.placeholder,
      disabled: props.disabled,
      canFetch: props.canFetch,
      isDebouncedFetch: props.isDebouncedFetch,
      id: props.id,
    },
    'useSelectBlock',
    hookTraceId,
  );

  // Props destructuring
  const {
    options: rawInitialOptions = [],
    isDebouncedFetch = false,
    defaultActiveFirstOption = false,
    value,
    onChange,
    dataSource,
    dataSourceShare = false,
    isFirstHint = false,
    dependency,
  } = props;

  // 🔧 Check dependency and dataSource again after destructuring
  logger.debug(
    'UseSelectBlock',
    '🟡 Props destructuring completed (useBaseConfig)',
    {
      // dependency after destructuring
      hasDependencyAfterDestructure: Boolean(dependency),
      dependencyAfterDestructure: dependency,
      dependencyStringAfterDestructure: JSON.stringify(dependency),
      // dataSource after destructuring
      hasDataSourceAfterDestructure: Boolean(dataSource),
      dataSourceTypeAfterDestructure: typeof dataSource,
      dataSourceIsNull: dataSource === null,
      dataSourceIsUndefined: dataSource === undefined,
      dataSourceApiAfterDestructure:
        dataSource && typeof dataSource === 'object' && 'api' in dataSource
          ? (dataSource as any).api
          : undefined,
    },
    'useSelectBlock',
    hookTraceId,
  );

  // Ensure initialOptions is the correct SelectOption[] type
  const initialOptions = (rawInitialOptions || []) as SelectOption[];

  // Hook render counter
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  // Get limit property, use default value 100 if not exists
  const limit = props?.pageReq?.limit || 100;

  logger.debug(
    'UseSelectBlock',
    'Base configuration initialized',
    {
      limit,
      renderCount: renderCountRef.current,
    },
    'useSelectBlock',
    hookTraceId,
  );

  // 🔧 Full-chain tracking point 2: useBaseConfig
  logger.info(
    'UseBaseConfig',
    '🟠 [Full Trace-2] Props destructuring completed',
    {
      fromProps: props.defaultActiveFirstOption,
      afterDestructure: defaultActiveFirstOption,
      value,
      mode: props.mode,
      hasOnChange: Boolean(onChange),
      willPassToUseSelectBlock: {
        defaultActiveFirstOption,
        value,
        mode: props.mode,
      },
      traceId: hookTraceId,
    },
    'useBaseConfig',
    hookTraceId,
  );

  return {
    // Base configuration
    hookTraceId,
    initialOptions,
    limit,
    renderCountRef,

    // Destructured props
    isDebouncedFetch,
    defaultActiveFirstOption,
    value,
    onChange,
    dataSource,
    dataSourceShare,
    isFirstHint,
    dependency,
  };
}
