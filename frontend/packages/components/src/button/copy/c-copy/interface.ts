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

import type { PopoverProps } from '@arco-design/web-react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

// Definition of copy-to-clipboard, it does not export itself
interface CopyOptions {
  debug?: boolean;
  message?: string;
  format?: string; // MIME type
  onCopy?: (clipboardData: Record<string, unknown>) => void;
}

/**
 * @title CCopyProps
 */
export interface CCopyProps {
  /** Child elements */
  children?: ReactNode;
  /** Text content to be copied */
  text?: string;
  /** Callback when copy is complete */
  onCopy?: (text: string, result: boolean) => void;
  /** Custom copy trigger icon, will default to unified c-m-icon style */
  triggerIcon?: ReactElement;
  /** Custom copy trigger element */
  triggerEle?: ReactNode;
  /**
   * @zh Visibility of trigger node (default is IconCopy)
   * @default default
   */
  showCopy?: 'default' | 'hover';
  /**
   * @zh Message content after copy success
   * @default Copy success
   */
  successMessage?: ReactNode;
  /**
   * @zh Message content after copy failure
   * @default Copy failure
   */
  failMessage?: ReactNode;
  /** Tooltip content when hovering over copy button */
  tooltip?: ReactNode;
  /** Copy button disabled */
  disabled?: boolean;
  /** Props passed through to arco popover component */
  arcoPopoverProps?: PopoverProps;
  /** Options passed through to copy-to-clipboard */
  options?: CopyOptions;
  /** Inline styles passed through to component root node */
  style?: CSSProperties;
  /** Style class name attached to component root node */
  className?: string | string[];
}

/**
 * @title CCopyHooksProps
 */
export interface CCopyHooksProps
  extends Omit<
    CCopyProps,
    'text' | 'triggerIcon' | 'triggerEle' | 'triggerVisible'
  > {
  /** Text content to be copied */
  text: string;
}
