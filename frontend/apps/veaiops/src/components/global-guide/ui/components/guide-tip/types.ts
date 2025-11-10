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

/**
 * Guide tip component type definitions
 */

export interface GuideTipOptions {
  /** Tip content */
  content: string;
  /** Target element selector */
  selector: string;
  /** Tip placement */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Whether to show arrow */
  showArrow?: boolean;
  /** Custom styles */
  customStyle?: Partial<CSSStyleDeclaration>;
  /** Button text */
  buttonText?: string;
  /** Whether to auto close */
  autoClose?: boolean;
  /** Auto close delay time (milliseconds) */
  autoCloseDelay?: number;
  /** Whether to close on outside click */
  closeOnOutsideClick?: boolean;
  /** Close callback */
  onClose?: () => void;
}

export interface Position {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface Size {
  width: number;
  height: number;
}
