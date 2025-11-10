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
import { IconDown } from '@arco-design/web-react/icon';
import React from 'react';

import './style/index.less';

import { useSelectBlock } from './hooks/use-select-block';
import { logger } from './logger';
import type { veArchSelectBlockProps } from './types/interface';

/**
 * Refactored SelectBlock component using plugin system architecture
 * 🔧 Optimize re-renders with React.memo
 */
const SelectBlockRefactoredInner = (props: veArchSelectBlockProps) => {
  const componentTraceId = logger.generateTraceId();

  // 🔧 Use useRef to track render count, avoid log explosion
  const renderCountRef = React.useRef(0);
  renderCountRef.current++;

  // 🔧 Record dataSource information in detail (record all renders)
  const dataSourceDetail =
    props.dataSource && typeof props.dataSource === 'object'
      ? {
          api: (props.dataSource as any).api,
          hasServiceInstance: 'serviceInstance' in props.dataSource,
          responseEntityKey: (props.dataSource as any).responseEntityKey,
          hasOptionCfg: 'optionCfg' in props.dataSource,
        }
      : null;

  // 🔧 Full trace marker point 1: Component entry
  logger.info(
    'SelectBlock',
    '🔴 [Full Trace-1] Component received props',
    {
      renderCount: renderCountRef.current,
      addBefore: (props as any).addBefore,
      // 🎯 Core parameters
      defaultActiveFirstOption: props.defaultActiveFirstOption,
      value: props.value,
      hasOnChange: Boolean(props.onChange),
      mode: props.mode,
      hasOptions: Boolean(props.options?.length),
      optionsLength: props.options?.length || 0,
      // dependency detailed information
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
      dataSourceType: typeof props.dataSource,
      dataSourceDetail,
      // Other key information
      placeholder: props.placeholder,
      disabled: props.disabled,
      canFetch: props.canFetch,
      isDebouncedFetch: props.isDebouncedFetch,
      id: props.id,
    },
    'SelectBlockRefactored',
    componentTraceId,
  );

  // Only record first few renders and every 10th render
  if (renderCountRef.current <= 3 || renderCountRef.current % 10 === 0) {
    logger.info(
      'SelectBlock',
      'Component starting to render',
      {
        renderCount: renderCountRef.current,
        props: {
          ...props,
          dataSource: props.dataSource ? '[DataSource]' : undefined,
        },
        traceId: componentTraceId,
      },
      'SelectBlockRefactored',
      componentTraceId,
    );
  }

  const {
    visible = true,
    inlineSuffixDom,
    wrapperStyle,
    style: propsStyle,
    allowPasteMultiple = false,
    ...restArcoSelectProps
  } = props;

  logger.debug(
    'SelectBlock',
    'Component props parsing completed',
    {
      visible,
      hasInlineSuffixDom: Boolean(inlineSuffixDom),
      hasWrapperStyle: Boolean(wrapperStyle),
      allowPasteMultiple,
      restPropsKeys: Object.keys(restArcoSelectProps),
    },
    'SelectBlockRefactored',
    componentTraceId,
  );

  // Use main Hook to get all state and handler functions
  const hookResult = useSelectBlock(props);

  const {
    loading,
    finalOptions,
    finalDefaultValue,
    finalValue,
    onSearch,
    handlePaste,
    handleVisibleChange,
    handleClear,
    popupScrollHandler,
    filterOption,
  } = hookResult;

  // If multiple mode and allowClear is not set, default to true
  const selectProps = { ...restArcoSelectProps };
  if (
    selectProps &&
    selectProps.mode === 'multiple' &&
    selectProps.allowClear === undefined
  ) {
    selectProps.allowClear = true;
  }

  // 🔍 Wrap onChange to add logging (must be defined before conditional return, follow React Hooks rules)
  const wrappedOnChange = React.useCallback(
    (value: any, option: any) => {
      logger.info(
        'SelectBlock',
        '🟢 onChange triggered',
        {
          value,
          option,
          hasOriginalOnChange: Boolean(selectProps.onChange),
          placeholder: props.placeholder,
          addBefore: (props as any).addBefore,
          timestamp: new Date().toISOString(),
        },
        'onChange',
        componentTraceId,
      );

      // Call original onChange
      if (selectProps.onChange) {
        logger.info(
          'SelectBlock',
          '🟢 Calling original onChange',
          {
            value,
            onChangeFunctionName: selectProps.onChange.name || 'anonymous',
          },
          'onChange',
          componentTraceId,
        );
        selectProps.onChange(value, option);
        logger.info(
          'SelectBlock',
          '🟢 Original onChange execution completed',
          { value },
          'onChange',
          componentTraceId,
        );
      } else {
        logger.warn(
          'SelectBlock',
          '⚠️ onChange does not exist!',
          {
            selectPropsKeys: Object.keys(selectProps),
          },
          'onChange',
          componentTraceId,
        );
      }
    },
    [selectProps.onChange, props.placeholder, componentTraceId],
  );

  // If not visible, don't render (must be after all Hooks calls)
  if (!visible) {
    logger.debug(
      'SelectBlock',
      'Component not visible, skipping render',
      { visible },
      'SelectBlockRefactored',
      componentTraceId,
    );
    return null;
  }

  logger.debug(
    'SelectBlock',
    'Hook execution result',
    {
      loading,
      finalOptionsLength: finalOptions?.length || 0,
      finalDefaultValue,
      finalValue,
      hasOnSearch: Boolean(onSearch),
      hasHandlePaste: Boolean(handlePaste),
      hasHandleVisibleChange: Boolean(handleVisibleChange),
      hasPopupScrollHandler: Boolean(popupScrollHandler),
      hasFilterOption: Boolean(filterOption),
    },
    'SelectBlockRefactored',
    componentTraceId,
  );

  logger.debug(
    'SelectBlock',
    'Multiple mode automatically set allowClear=true',
    { mode: selectProps.mode },
    'SelectBlockRefactored',
    componentTraceId,
  );

  // 🔧 Dynamically adjust placeholder to provide search state feedback
  let dynamicPlaceholder = 'Please select';
  if (loading) {
    dynamicPlaceholder = 'Searching...';
  } else if (finalOptions?.length > 0) {
    dynamicPlaceholder = 'Please select or type to search';
  }

  logger.debug(
    'SelectBlock',
    'Dynamic placeholder calculation completed',
    {
      loading,
      finalOptionsLength: finalOptions?.length || 0,
      dynamicPlaceholder,
    },
    'SelectBlockRefactored',
    componentTraceId,
  );

  // Render Select component
  logger.debug(
    'SelectBlock',
    'Starting to render Select component',
    {
      finalOptionsLength: finalOptions?.length || 0,
      loading,
      dynamicPlaceholder,
      allowPasteMultiple,
    },
    'SelectBlockRefactored',
    componentTraceId,
  );

  const selectElement = (
    <Select
      arrowIcon={<IconDown />}
      placeholder={dynamicPlaceholder}
      maxTagCount={1}
      allowClear
      loading={loading}
      showSearch
      {...selectProps}
      onChange={wrappedOnChange}
      style={propsStyle}
      options={finalOptions}
      onSearch={onSearch}
      onPopupScroll={popupScrollHandler}
      filterOption={filterOption}
      defaultValue={finalDefaultValue as any}
      value={finalValue as any}
      onVisibleChange={handleVisibleChange}
      onClear={handleClear}
      onPaste={allowPasteMultiple ? handlePaste : undefined}
    />
  );

  logger.debug(
    'SelectBlock',
    'Select component creation completed',
    {
      hasSelectElement: Boolean(selectElement),
    },
    'SelectBlockRefactored',
    componentTraceId,
  );

  // If there's inline suffix DOM, wrap in container
  if (inlineSuffixDom) {
    logger.debug(
      'SelectBlock',
      'Rendering wrapper with inline suffix',
      {
        hasInlineSuffixDom: Boolean(inlineSuffixDom),
        hasWrapperStyle: Boolean(wrapperStyle),
      },
      'SelectBlockRefactored',
      componentTraceId,
    );

    const inlineWrapperStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      ...wrapperStyle,
    };

    const wrappedElement = (
      <div style={inlineWrapperStyle} className="select-block-inline-wrapper">
        {selectElement}
        {inlineSuffixDom}
      </div>
    );

    logger.info(
      'SelectBlock',
      'Component render completed (with inline suffix)',
      {
        renderType: 'wrapped',
        hasInlineSuffixDom: true,
      },
      'SelectBlockRefactored',
      componentTraceId,
    );

    return wrappedElement;
  }

  logger.info(
    'SelectBlock',
    'Component render completed (standard mode)',
    {
      renderType: 'standard',
      hasInlineSuffixDom: false,
    },
    'SelectBlockRefactored',
    componentTraceId,
  );

  return selectElement;
};

// 🔧 Use React.memo to optimize performance, custom comparison function
const SelectBlockRefactored = React.memo(
  SelectBlockRefactoredInner,
  (prevProps, nextProps) => {
    // 🔧 Key point: Compare dependency array
    const prevDependency = JSON.stringify(prevProps.dependency);
    const nextDependency = JSON.stringify(nextProps.dependency);
    if (prevDependency !== nextDependency) {
      logger.info(
        'SelectBlock',
        '🔄 dependency changed - triggering re-render',
        {
          prevDependency,
          nextDependency,
          id: nextProps.id,
        },
        'React.memo',
      );
      return false; // dependency changed, need to re-render
    }

    // 🔧 Key point: Compare dataSource object
    const prevDataSource = prevProps.dataSource;
    const nextDataSource = nextProps.dataSource;
    if (prevDataSource !== nextDataSource) {
      const prevApi =
        prevDataSource && typeof prevDataSource === 'object'
          ? (prevDataSource as any).api
          : undefined;
      const nextApi =
        nextDataSource && typeof nextDataSource === 'object'
          ? (nextDataSource as any).api
          : undefined;
      logger.info(
        'SelectBlock',
        '🔄 dataSource changed - triggering re-render',
        {
          prevApi,
          nextApi,
          id: nextProps.id,
        },
        'React.memo',
      );
      return false; // dataSource changed, need to re-render
    }

    // 🔥 Fix: Properly handle options changing from undefined/[] to having values
    const prevHasOptions = prevProps.options && prevProps.options.length > 0;
    const nextHasOptions = nextProps.options && nextProps.options.length > 0;

    // If options state changes (from none to some, or from some to none)
    if (prevHasOptions !== nextHasOptions) {
      logger.info(
        'SelectBlock',
        '🔄 options state changed - triggering re-render',
        {
          prevHasOptions,
          nextHasOptions,
          prevOptionsLength: prevProps.options?.length || 0,
          nextOptionsLength: nextProps.options?.length || 0,
          id: nextProps.id,
        },
        'React.memo',
      );
      return false;
    }

    // If both have options, compare content
    if (prevHasOptions && nextHasOptions) {
      if (prevProps.options.length !== nextProps.options.length) {
        logger.info(
          'SelectBlock',
          '🔄 options length changed - triggering re-render',
          {
            prevLength: prevProps.options.length,
            nextLength: nextProps.options.length,
            id: nextProps.id,
          },
          'React.memo',
        );
        return false;
      }
      // Simple comparison, no deep comparison
      const optionsChanged =
        JSON.stringify(prevProps.options) !== JSON.stringify(nextProps.options);
      if (optionsChanged) {
        logger.info(
          'SelectBlock',
          '🔄 options content changed - triggering re-render',
          {
            id: nextProps.id,
          },
          'React.memo',
        );
        return false;
      }
    }

    // Compare key props
    const keysToCompare: (keyof veArchSelectBlockProps)[] = [
      'value',
      'mode',
      'placeholder',
      'disabled',
      'loading',
      'visible',
      'allowClear',
      'showSearch',
      'canFetch', // 🔧 Add canFetch comparison
    ];

    for (const key of keysToCompare) {
      if (prevProps[key] !== nextProps[key]) {
        logger.debug(
          'SelectBlock',
          `🔄 ${key} changed - triggering re-render`,
          {
            prevValue: prevProps[key],
            nextValue: nextProps[key],
            id: nextProps.id,
          },
          'React.memo',
        );
        return false;
      }
    }

    // Other props are the same, don't re-render
    logger.debug(
      'SelectBlock',
      '✋ Props unchanged - skipping re-render',
      {
        id: nextProps.id,
        prevOptionsLength: prevProps.options?.length || 0,
        nextOptionsLength: nextProps.options?.length || 0,
      },
      'React.memo',
    );
    return true;
  },
);

// For backward compatibility, export refactored component as default component
export { SelectBlockRefactored as SelectBlock };
