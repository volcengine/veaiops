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

import { commonInputProps } from '@/constants';
import type { FormItemControlProps } from '@/form-control';
import { FormItemWrapper } from '@/form-control';
import { Input } from '@arco-design/web-react';
import type { InputProps } from '@arco-design/web-react/es/Input/interface';
import { type FC, useEffect, useState } from 'react';

/**
 * InputBlock component wrapper
 * Provides form item wrapper functionality, supports vertical layout and other features
 */
const InputBlock: FC<FormItemControlProps<InputProps>> = (props) => {
  const { controlProps, ...wrapperProps } = props;
  const [inputType, setInputType] = useState<string>('text');

  // Set different autocomplete values and initial type based on input type
  const getAutoCompleteValue = () => {
    if (controlProps?.type === 'password') {
      return 'new-password';
    }
    return 'off';
  };

  // Handle dynamic type switching for password fields
  useEffect(() => {
    if (controlProps?.type === 'password') {
      // Initially set to text type to prevent browser from recognizing it as a password field
      setInputType('text');
    } else {
      setInputType(controlProps?.type || 'text');
    }
  }, [controlProps?.type]);

  const handleFocus = () => {
    if (controlProps?.type === 'password' && inputType === 'text') {
      // Switch to password type when focused
      setInputType('password');
    }
  };

  const handleBlur = () => {
    if (controlProps?.type === 'password' && inputType === 'password') {
      // Switch back to text type when blurred to prevent browser from saving password
      setInputType('text');
    }
  };

  return (
    <FormItemWrapper {...wrapperProps}>
      <Input
        {...commonInputProps}
        {...controlProps}
        type={inputType}
        autoComplete={getAutoCompleteValue()}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </FormItemWrapper>
  );
};

export { InputBlock };
