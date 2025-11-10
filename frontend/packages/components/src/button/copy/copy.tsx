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

import { Button, Message } from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import type React from 'react';
import { CCopyComponent } from './c-copy';

export interface CCopyButtonProps {
  /**
   * Text content to copy
   */
  text: string;
  /**
   * Button text
   */
  children?: React.ReactNode;
  /**
   * Button type
   */
  type?: 'primary' | 'secondary' | 'outline' | 'dashed' | 'text';
  /**
   * Button size
   */
  size?: 'mini' | 'small' | 'default' | 'large';
  /**
   * Whether to show icon only
   */
  iconOnly?: boolean;
  /**
   * Custom style
   */
  style?: React.CSSProperties;
  /**
   * Custom class name
   */
  className?: string;
  /**
   * Copy success callback
   */
  onCopySuccess?: (text: string) => void;
  /**
   * Copy error callback
   */
  onCopyError?: (error: any) => void;
}

/**
 * Copy button component
 * @description Copy button wrapped based on CCopy component, click to copy text content
 */
export const CopyButton: React.FC<CCopyButtonProps> = ({
  text,
  children = 'Copy',
  type = 'outline',
  size = 'small',
  iconOnly = false,
  style,
  className,
  onCopySuccess,
  onCopyError,
}) => {
  const handleCopy = (copiedText: string, result: boolean) => {
    if (result) {
      Message.success('Copy successful');
      onCopySuccess?.(copiedText);
    } else {
      Message.error('Copy failed');
      onCopyError?.(new Error('Copy failed'));
    }
  };

  return (
    <CCopyComponent
      text={text}
      onCopy={handleCopy}
      triggerEle={
        <Button
          type={type}
          size={size}
          icon={<IconCopy />}
          style={style}
          className={className}
        >
          {!iconOnly && children}
        </Button>
      }
      successMessage=""
      failMessage=""
      arcoPopoverProps={{
        disabled: true,
        content: null,
        popupVisible: false,
      }}
    />
  );
};
