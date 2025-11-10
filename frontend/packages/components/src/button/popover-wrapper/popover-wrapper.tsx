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

import { Popover } from '@arco-design/web-react';
import type { PopoverProps } from '@arco-design/web-react/es/Popover/interface';
import type { ReactNode } from 'react';

/**
 * Higher-order component that adds Popover functionality to components
 * @param {React.ComponentType} WrappedComponent - Component to wrap
 * @returns {React.ComponentType} - New component with Popover functionality
 */
const WithPopover = (
  WrappedComponent: JSX.Element,
): (({ popoverProps }: { popoverProps: PopoverProps }) => ReactNode) => {
  /**
   * Component with Popover functionality
   * @param {PopoverProps} props.popoverProps - Popover component properties
   * @returns {React.ReactNode} - Rendered component
   */
  return ({ popoverProps }: { popoverProps: PopoverProps }): ReactNode => {
    return <Popover {...popoverProps}>{WrappedComponent}</Popover>;
  };
};

export { WithPopover };
