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

import { type FormItemControlProps, FormItemWrapper } from '@/form-control';
import { InputTag } from '@arco-design/web-react';
import type { InputTagProps } from '@arco-design/web-react/es/InputTag/interface';
import type { FC } from 'react';

const commonInputProps = {
  placeholder: 'Please enter',
  style: { width: '100%' },
};

/**
 * InputTag component wrapper
 * Provides form item wrapper functionality, supports vertical layout and other features
 */
const InputTagComponent: FC<FormItemControlProps<InputTagProps>> = (props) => {
  const { controlProps, ...wrapperProps } = props;

  return (
    <FormItemWrapper {...wrapperProps}>
      <InputTag {...commonInputProps} {...controlProps} />
    </FormItemWrapper>
  );
};

export { InputTagComponent };
