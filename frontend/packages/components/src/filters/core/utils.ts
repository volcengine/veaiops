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

import { omit } from 'lodash-es';
import type { FilterPluginContext } from '../plugins';
import { commonClassName, fixFilterControlCls } from './constants';
import type { FieldItem, FilterStyle } from './types';

/**
 * Hijack component props and add fixed CSS class names
 * @param componentProps - Original component props
 * @returns - Hijacked component props
 */
export const hijackComponentProps = (
  componentProps?: Record<string, unknown>,
): Record<string, unknown> => {
  // Handle empty componentProps
  if (!componentProps || typeof componentProps !== 'object') {
    return { ...fixFilterControlCls };
  }

  // Filter out props that should not be passed to DOM elements
  const { subType, ...filteredProps } = componentProps;
  return { ...filteredProps, ...fixFilterControlCls };
};

/**
 * Hijack control component props and add style class names to controlProps
 * @param componentProps - Original component props
 * @returns - Hijacked component props
 */
export const hijackControlComponentProps = (
  componentProps?: Record<string, unknown>,
): Record<string, unknown> => {
  // Handle empty componentProps
  if (!componentProps || typeof componentProps !== 'object') {
    return {
      controlProps: fixFilterControlCls,
    };
  }

  // Extract props that should be placed in controlProps
  const controlPropsKeys = [
    'addBefore',
    'maxTagCount',
    'mode',
    'dataSource',
    'renderFormat',
    'isDebouncedFetch',
    'isScrollFetching',
    'isCascadeRemoteSearch',
    'isValueEmptyTriggerOptions',
    'searchKey',
    'onChange',
    'value',
    'enumOptionConfig',
    'placeholder',
    'allowClear',
    'options',
    'showSearch',
    'fieldNames',
    'allowPasteMultiple',
  ];

  const controlPropsFromTop = Object.keys(componentProps)
    .filter((key) => controlPropsKeys.includes(key))
    .reduce(
      (obj, key) => {
        obj[key] = componentProps[key];
        return obj;
      },
      {} as Record<string, unknown>,
    );

  return {
    controlProps: {
      ...(componentProps?.controlProps || {}),
      ...controlPropsFromTop,
      ...fixFilterControlCls,
    },
    ...omit(componentProps, [
      ...controlPropsKeys,
      'controlProps',
      'isControl',
      'formItemProps',
      'subType', // Filter out subType to prevent passing to DOM elements
    ]),
  };
};

/**
 * Create plugin context
 * @param form - Form instance
 * @param finalStyle - Final style configuration
 * @param eventBus - Event bus
 * @returns - Plugin context
 */
export const createPluginContext = (
  form: unknown,
  finalStyle: FilterStyle,
  eventBus: unknown,
): FilterPluginContext => ({
  form: form as FilterPluginContext['form'],
  globalConfig: {
    filterStyle: finalStyle,
    commonClassName,
  },
  eventBus: eventBus as FilterPluginContext['eventBus'],
});

/**
 * Check if field is visible
 * @param field - Field configuration
 * @returns - Whether field is visible
 */
export const isFieldVisible = (field: FieldItem): boolean => {
  return field.visible === undefined || field.visible;
};

/**
 * Merge filter styles
 * @param defaultStyle - Default style
 * @param customStyle - Custom style
 * @returns - Merged style
 */
export const mergeFilterStyle = (
  defaultStyle: FilterStyle,
  customStyle?: Partial<FilterStyle>,
): FilterStyle => {
  if (!customStyle) {
    return defaultStyle;
  }

  return {
    ...defaultStyle,
    ...customStyle,
    style: {
      ...defaultStyle.style,
      ...customStyle.style,
    },
  };
};

/**
 * Generate CSS class name string
 * @param baseClassName - Base class name
 * @param additionalClasses - Additional class name array
 * @returns - Complete class name string
 */
export const generateClassName = (
  baseClassName: string,
  ...additionalClasses: (string | undefined)[]
): string => {
  return [baseClassName, ...additionalClasses.filter(Boolean)].join(' ').trim();
};

/**
 * Validate field configuration
 * @param field - Field configuration
 * @returns - Validation result
 */
export const validateFieldConfig = (
  field: FieldItem,
): {
  isValid: boolean;
  error?: string;
} => {
  if (!field.type) {
    return {
      isValid: false,
      error: 'Field type cannot be empty',
    };
  }

  if (!field.componentProps || typeof field.componentProps !== 'object') {
    return {
      isValid: false,
      error: 'Component props configuration is invalid',
    };
  }

  return { isValid: true };
};

/**
 * Generate unique key for field
 * @param field - Field configuration
 * @param index - Index
 * @returns - Unique key
 */
/**
 * generateFieldKey parameters interface
 */
export interface GenerateFieldKeyParams {
  field: FieldItem;
  index: number;
}

export const generateFieldKey = ({
  field,
  index,
}: GenerateFieldKeyParams): string => {
  return field.field || `field-${index}`;
};

/**
 * Label conversion configuration type
 */
export type LabelAsType = 'addBefore' | 'addAfter' | 'prefix' | 'suffix';

/**
 * Component type to default label property mapping
 * Different Arco Design components support different prefix/suffix properties
 */
const COMPONENT_LABEL_MAPPING: Record<string, LabelAsType> = {
  // Select series components: use addBefore (display on the left side of select box)
  Select: 'addBefore',
  Cascader: 'addBefore',
  TreeSelect: 'addBefore',

  // Input series components: use addBefore (display on the left side of input box)
  Input: 'addBefore',
  InputNumber: 'addBefore',
  InputTag: 'addBefore',

  // Date time components: use addBefore
  DatePicker: 'addBefore',
  RangePicker: 'addBefore',
  TimePicker: 'addBefore',

  // Other components: default to addBefore
};

/**
 * Process label field and convert it to componentProps properties like addBefore/prefix
 *
 * Functionality:
 * 1. Support passing string in label field, automatically convert to corresponding component property (addBefore/prefix/suffix/addAfter)
 * 2. Support directly passing addBefore/prefix properties in componentProps (higher priority)
 * 3. Support customizing conversion target property through labelAs parameter
 *
 * Priority:
 * componentProps.addBefore/prefix > labelAs configuration > component type default mapping > label string
 *
 * @param field - Field configuration
 * @returns - Processed componentProps
 *
 * @example
 * // Scenario 1: label automatically converted to addBefore (Select component)
 * {
 *   field: 'agent_type',
 *   label: 'Agent',
 *   type: 'Select',
 *   componentProps: { options: [...] }
 * }
 * // => componentProps: { addBefore: 'Agent', options: [...] }
 *
 * @example
 * // Scenario 2: label automatically converted to addBefore (Input component)
 * {
 *   field: 'name',
 *   label: 'Name',
 *   type: 'Input',
 *   componentProps: { placeholder: 'Please enter' }
 * }
 * // => componentProps: { addBefore: 'Name', placeholder: 'Please enter' }
 *
 * @example
 * // Scenario 3: componentProps has higher priority
 * {
 *   field: 'name',
 *   label: 'Name',
 *   type: 'Select',
 *   componentProps: { addBefore: 'Custom prefix', options: [...] }
 * }
 * // => componentProps: { addBefore: 'Custom prefix', options: [...] }
 *
 * @example
 * // Scenario 4: Use labelAs to customize conversion property
 * {
 *   field: 'name',
 *   label: 'Name',
 *   type: 'Select',
 *   labelAs: 'suffix',
 *   componentProps: { options: [...] }
 * }
 * // => componentProps: { suffix: 'Name', options: [...] }
 */
export const processLabelAsComponentProp = (
  field: FieldItem,
): Record<string, unknown> => {
  const { label, type, componentProps = {}, labelAs } = field;

  // If no label or label is not a string, return original componentProps
  if (!label || typeof label !== 'string') {
    return componentProps;
  }

  // Parse component type (handle namespaced types like Select.Account)
  const [mainType] = (type || '').split('.');

  // Determine target property name
  let targetProp: LabelAsType;

  if (labelAs) {
    // Priority: use explicitly specified labelAs configuration
    targetProp = labelAs as LabelAsType;
  } else {
    // Use component type default mapping, if no mapping then use addBefore
    targetProp = COMPONENT_LABEL_MAPPING[mainType] || 'addBefore';
  }

  // Check if any label-related properties already exist in componentProps
  const hasLabelProp =
    componentProps.addBefore !== undefined ||
    componentProps.addAfter !== undefined ||
    componentProps.prefix !== undefined ||
    componentProps.suffix !== undefined;

  // If componentProps already has label-related properties, prioritize componentProps
  if (hasLabelProp) {
    return componentProps;
  }

  // Convert label to target property
  return {
    ...componentProps,
    [targetProp]: label,
  };
};
