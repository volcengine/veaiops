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

import type { CascaderProps } from '@arco-design/web-react/es/Cascader/interface';
import type { SelectProps } from '@arco-design/web-react/es/Select/interface';
import { IconDown } from '@arco-design/web-react/icon';

// These constants have been moved to form-control/wrapper/constants.ts
// To avoid duplicate exports, please import from form-control/wrapper module

export const commonSelectProps: Partial<SelectProps> = {
  className: 'w-default-control',
  showSearch: true,
  allowClear: true,
  arrowIcon: <IconDown />,
  placeholder: 'Please select',
};

export const commonCascaderProps: Partial<CascaderProps> = {
  className: 'w-default-control',
  showSearch: true,
  allowClear: true,
  placeholder: 'Please select',
};

export const commonInputProps = {
  className: 'w-default-control',
  placeholder: 'Please enter',
  autoComplete: 'off',
  allowClear: true,
  style: { width: '100%' },
};

export const commonInputNumberProps = {
  className: 'w-default-control',
  placeholder: 'Please enter',
};

export const smallInputProps = {
  ...commonInputProps,
  style: {
    width: 200, // Value of SMALL_CONTROL_WIDTH
  },
};

export const commonInputTextAreaProps = {
  className: 'w-default-control',
  wrapperStyle: {
    width: 'inherit',
  },
  placeholder: 'Please enter',
  allowClear: true,
};

export const commonDateRangePickerProps = {
  className: 'w-default-control',
  autoComplete: 'off',
};

/**
 * Form item constant definitions
 * @description Provides form item related constant configurations
 */

/** Form item type enumeration */
export const FORM_ITEM_TYPES = {
  INPUT: 'input',
  SELECT: 'select',
  TEXTAREA: 'textarea',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  DATE_PICKER: 'datePicker',
  TIME_PICKER: 'timePicker',
  CASCADER: 'cascader',
  UPLOAD: 'upload',
  SWITCH: 'switch',
} as const;

/** Form item validation rule types */
export const VALIDATION_TYPES = {
  REQUIRED: 'required',
  EMAIL: 'email',
  URL: 'url',
  PHONE: 'phone',
  NUMBER: 'number',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  PATTERN: 'pattern',
} as const;

/** Form item size */
export const FORM_ITEM_SIZES = {
  MINI: 'mini',
  SMALL: 'small',
  DEFAULT: 'default',
  LARGE: 'large',
} as const;

/** Form layout type */
export const FORM_LAYOUTS = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  INLINE: 'inline',
} as const;

/** Form item status */
export const FORM_ITEM_STATUS = {
  DEFAULT: 'default',
  ERROR: 'error',
  WARNING: 'warning',
  SUCCESS: 'success',
} as const;

// Type exports
export type FormItemType =
  (typeof FORM_ITEM_TYPES)[keyof typeof FORM_ITEM_TYPES];
export type ValidationType =
  (typeof VALIDATION_TYPES)[keyof typeof VALIDATION_TYPES];
export type FormItemSize =
  (typeof FORM_ITEM_SIZES)[keyof typeof FORM_ITEM_SIZES];
export type FormLayout = (typeof FORM_LAYOUTS)[keyof typeof FORM_LAYOUTS];
export type FormItemStatus =
  (typeof FORM_ITEM_STATUS)[keyof typeof FORM_ITEM_STATUS];
