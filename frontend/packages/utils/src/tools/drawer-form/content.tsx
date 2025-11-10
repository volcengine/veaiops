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

import { Spin } from '@arco-design/web-react';
import type { PropsWithChildren, ReactNode } from 'react';
import { useMemo } from 'react';

/**
 * Drawer form content wrapper component props
 */
export interface DrawerFormContentProps {
  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Loading tip text
   * @default 'Submitting...'
   */
  loadingTip?: string;

  /**
   * Children elements
   */
  children: ReactNode;

  /**
   * Custom styles
   */
  style?: React.CSSProperties;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Drawer form content wrapper component
 *
 * Uses Arco Design's Spin component (block form) to wrap drawer form content,
 * displays loading state during form submission to prevent user operations.
 *
 * @example
 * ```tsx
 * const { submitting, handleSubmit } = useDrawerFormSubmit({
 *   form,
 *   onSubmit: async (values) => {
 *     return await api.createProject(values);
 *   },
 * });
 *
 * <Drawer>
 *   <DrawerFormContent loading={submitting}>
 *     <Form form={form}>
 *       <Form.Item field="name">...</Form.Item>
 *     </Form>
 *   </DrawerFormContent>
 * </Drawer>
 * ```
 */
export const DrawerFormContent: React.FC<
  PropsWithChildren<DrawerFormContentProps>
> = ({
  loading = false,
  loadingTip = 'Submitting...',
  children,
  style,
  className,
}) => {
  // Use useMemo to stabilize Spin component's style, avoiding unnecessary re-renders
  const spinStyle = useMemo<React.CSSProperties>(
    () => ({
      width: '100%',
      minHeight: '200px',
      ...style,
    }),
    [style],
  );

  return (
    <Spin
      block
      loading={loading}
      tip={loadingTip}
      style={spinStyle}
      className={className}
    >
      {children}
    </Spin>
  );
};
