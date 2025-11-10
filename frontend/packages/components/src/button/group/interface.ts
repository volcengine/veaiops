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

import type {
  PopconfirmProps,
  PopoverProps,
  TooltipProps,
} from '@arco-design/web-react';
import type { BaseButtonProps } from '@arco-design/web-react/es/Button/interface';
import type React from 'react';
import type { ReactNode } from 'react';

/**
 * Base button property interface
 */
export interface ButtonProps {
  text?: string; // Button text
  visible?: boolean; // Whether button is visible
  disabled?: boolean; // Whether button is disabled
  tooltip?: string | ReactNode; // Button tooltip text (supports string or ReactNode)
  tooltipProps?: TooltipProps; // Tooltip custom properties (supports custom zIndex, etc.)
  onClick?: () => void; // Button click event handler function
  enablePopoverWrapper?: boolean; // Whether to enable PopoverWrapper component
  popoverProps?: PopoverProps; // Popover properties
  buttonProps?: BaseButtonProps;
  buttonGroupProps?: ButtonGroupConfiguration;
  dataTestId?: string; // Button test ID for automated testing
}

/**
 * Button property interface with Popconfirm functionality
 */
export interface PopconfirmButtonProps {
  supportPopConfirm?: boolean; // Whether to support Popconfirm
  popConfirmTitle?: string; // Popconfirm title
  popConfirmContent?: string; // Popconfirm content
  popconfirmProps?: PopconfirmProps;
}

/**
 * DropDown property interface
 */
export interface DropDownProps {
  dropdownProps?: {
    on?: boolean;
    screen?: {
      min?: number;
      max?: number;
    };
  };
}

/**
 * Button configuration interface, extends ButtonProps, PopconfirmButtonProps, and DropDownProps
 */
export interface ButtonConfiguration
  extends ButtonProps,
    PopconfirmButtonProps,
    DropDownProps {}

/**
 * Button group configuration interface
 */
interface ButtonGroupConfiguration {
  icon: ReactNode; // Button group icon
  children: ReactNode; // Button group child elements
}

export interface ButtonConfigurationWithDropdown {
  isInDropdown: boolean;
  configs: ButtonConfiguration[];
  dropDownButtonProps?: BaseButtonProps;
  dropdownId?: string;
  dropdownClassName?: string;
}
/**
 * Final button configuration interface, can be a button configuration array or an object containing button configuration array
 */
export type FinalButtonConfiguration =
  | ButtonConfiguration[]
  | ButtonConfigurationWithDropdown;

/**
 * Dropdown menu configuration interface
 */
export interface DropdownMenuConfiguration {
  key: string | undefined;
  visible?: boolean;
  onClick: (() => void) | undefined;
  buttonProps: BaseButtonProps | undefined;
  supportPopConfirm?: boolean;
  tooltip?: string | ReactNode; // Supports string or ReactNode, consistent with ButtonConfiguration
  text?: string;
  disabled?: boolean;
  popConfirmTitle?: string;
  popConfirmContent?: string;
  popconfirmProps?: PopconfirmProps;
}
