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

import {
  Button,
  Dropdown,
  Popconfirm,
  Tooltip,
  type TooltipProps,
} from '@arco-design/web-react';
import type { BaseButtonProps } from '@arco-design/web-react/es/Button/interface';
import { IconDown } from '@arco-design/web-react/icon';
import { isEmpty } from 'lodash-es';
import React, { type CSSProperties, type FC } from 'react';

import { WithPopover } from '../popover-wrapper';

import type {
  ButtonConfiguration,
  ButtonConfigurationWithDropdown,
  DropdownMenuConfiguration,
  FinalButtonConfiguration,
} from './interface';

const ButtonGroup = Button.Group;

export type {
  ButtonConfiguration,
  ButtonConfigurationWithDropdown,
  DropdownMenuConfiguration,
  FinalButtonConfiguration,
};

/**
 * Check if button configuration array contains dropdown configuration
 * @param buttonConfigurations
 */
const isButtonConfigurationsWithDropdown = (
  buttonConfigurations: FinalButtonConfiguration,
): buttonConfigurations is ButtonConfigurationWithDropdown =>
  (buttonConfigurations as ButtonConfigurationWithDropdown).isInDropdown;

/**
 * Render button component
 * @param buttonConfigurations Button configuration array
 * @returns Rendered button component
 */
const ButtonGroupRender: FC<{
  buttonConfigurations: FinalButtonConfiguration;
  className?: string;
  style?: CSSProperties;
  wrapStyle?: CSSProperties;
  gap?: string; // New gap parameter, supports custom spacing
}> = ({
  buttonConfigurations,
  className = '',
  style = {},
  wrapStyle = {},
  gap = 'gap-2',
}) => {
  const renderButton = ({
    visible = true,
    text,
    disabled,
    onClick,
    buttonProps,
    buttonGroupProps,
    enablePopoverWrapper = false,
    popoverProps = {},
    tooltip,
    tooltipProps,
    dataTestId,
  }: ButtonConfiguration) => {
    if (!visible) {
      return null;
    }

    // Create base button content
    const createBaseButton = () => (
      <Button
        key={text}
        type="text"
        disabled={disabled}
        onClick={onClick}
        data-testid={dataTestId}
        {...buttonProps}
      >
        {text}
      </Button>
    );

    // Handle button with tooltip
    const wrapWithTooltip = (button: React.ReactNode) => {
      if (tooltip && disabled) {
        // If tooltip is ReactNode (contains error info), set higher zIndex
        const isErrorTooltip =
          typeof tooltip !== 'string' && React.isValidElement(tooltip);

        // Merge user custom tooltipProps and default configuration
        const defaultTooltipProps: Partial<TooltipProps> = isErrorTooltip
          ? {
              triggerProps: {
                popupStyle: {
                  zIndex: 3000, // Increase zIndex to 3000 to ensure it's above global buttons
                },
              },
              position: 'top',
            }
          : {
              position: 'top',
            };

        // Merge user passed tooltipProps and default configuration
        const mergedTooltipProps = tooltipProps
          ? {
              ...defaultTooltipProps,
              ...tooltipProps,
              triggerProps: {
                ...defaultTooltipProps.triggerProps,
                ...tooltipProps.triggerProps,
                popupStyle: {
                  ...defaultTooltipProps.triggerProps?.popupStyle,
                  ...tooltipProps.triggerProps?.popupStyle,
                },
              },
            }
          : defaultTooltipProps;

        return (
          <Tooltip content={tooltip} {...mergedTooltipProps}>
            {button}
          </Tooltip>
        );
      }
      return button;
    };

    // This scenario is when current button is a dropDown component, children is a dropList
    if (buttonGroupProps) {
      return (
        <ButtonGroup>
          <Dropdown
            droplist={buttonGroupProps.children}
            position="bl"
            triggerProps={{ autoAlignPopupWidth: true }}
          >
            {wrapWithTooltip(
              <Button
                key={text}
                type="text"
                disabled={disabled}
                onClick={onClick}
                data-testid={dataTestId}
                {...buttonProps}
              >
                {buttonGroupProps.icon || text}
              </Button>,
            )}
          </Dropdown>
        </ButtonGroup>
      );
    }

    const buttonContent = createBaseButton();

    if (enablePopoverWrapper) {
      return WithPopover(wrapWithTooltip(buttonContent) as JSX.Element)({
        popoverProps,
      });
    }

    return wrapWithTooltip(buttonContent);
  };

  const renderPopconfirmButton = ({
    visible = true,
    text,
    disabled,
    popConfirmTitle,
    popConfirmContent,
    onClick,
    buttonProps,
    buttonGroupProps,
    popconfirmProps = {},
    tooltip,
    tooltipProps,
    dataTestId,
  }: ButtonConfiguration) => {
    if (!visible) {
      return null;
    }

    // Merge disabled state
    const isDisabled = disabled || buttonProps?.disabled;

    if (buttonGroupProps) {
      return (
        <ButtonGroup>
          <Popconfirm
            key={text}
            focusLock
            position={'left'}
            disabled={isDisabled}
            title={popConfirmTitle || 'Tip'}
            content={popConfirmContent}
            onOk={onClick}
            {...popconfirmProps}
          >
            <Button
              key={text}
              type="text"
              disabled={isDisabled}
              data-testid={dataTestId}
              {...buttonProps}
            >
              {text}
            </Button>
          </Popconfirm>
          <Dropdown droplist={buttonGroupProps.children} position="bl">
            <Button icon={buttonGroupProps.icon} type={'primary'} />
          </Dropdown>
        </ButtonGroup>
      );
    }

    const popconfirmNode = (
      <Popconfirm
        key={text}
        focusLock
        position={'left'}
        disabled={isDisabled}
        title="Tip"
        content={popConfirmContent}
        onOk={onClick}
        {...popconfirmProps}
      >
        <Button
          type="text"
          disabled={isDisabled}
          data-testid={dataTestId}
          {...buttonProps}
        >
          {text}
        </Button>
      </Popconfirm>
    );

    // If button is disabled and has tooltip, wrap Popconfirm with Tooltip
    if (tooltip && isDisabled) {
      return (
        <Tooltip content={tooltip} {...tooltipProps}>
          {popconfirmNode}
        </Tooltip>
      );
    }
    return popconfirmNode;
  };

  const renderButtonConfiguration = (
    buttonConfigurations: ButtonConfiguration[],
  ) =>
    buttonConfigurations.map(({ supportPopConfirm, ...rest }) =>
      supportPopConfirm ? renderPopconfirmButton(rest) : renderButton(rest),
    );

  const renderButtonConfigurations = (
    buttonConfigurations: ButtonConfiguration[],
  ) => (
    <div className={`flex ${gap} flex-wrap`} style={{ ...wrapStyle }}>
      {renderButtonConfiguration(buttonConfigurations)}
    </div>
  );

  const renderDropDownConfigurations = ({
    dropDownConfigs,
    dropDownButtonProps,
    dropdownId,
    dropdownClassName,
  }: {
    dropDownConfigs: ButtonConfiguration[];
    dropDownButtonProps: BaseButtonProps;
    dropdownId?: string;
    dropdownClassName?: string;
  }): JSX.Element => {
    const droplist: Array<DropdownMenuConfiguration> = dropDownConfigs.reduce<
      Array<DropdownMenuConfiguration>
    >((total, cur) => {
      if (cur?.dropdownProps?.on) {
        return [
          ...total,
          {
            ...cur,
            key: cur.text,
            onClick: cur.onClick,
            buttonProps: cur.buttonProps,
            // Ensure disabled state is correctly passed
            disabled: cur.disabled || cur.buttonProps?.disabled,
          },
        ];
      }
      const minWidth = cur?.dropdownProps?.screen?.min;
      const maxWidth = cur?.dropdownProps?.screen?.max;
      const screenWidth = window.innerWidth;
      if (
        (minWidth && screenWidth < minWidth) ||
        (maxWidth && screenWidth > maxWidth)
      ) {
        return [
          ...total,
          {
            key: cur.text,
            onClick: cur?.onClick,
            buttonProps: cur.buttonProps,
            // Ensure tooltip and disabled state are correctly passed
            tooltip: cur.tooltip,
            disabled: cur.disabled || cur.buttonProps?.disabled,
          },
        ];
      }
      return total;
    }, []);

    const dropdownMenus = (
      <div
        className={`flex flex-col gap-[2px] bg-white ${
          dropdownClassName || ''
        }`}
      >
        {droplist.map((item) => {
          const {
            visible = true,
            tooltip,
            supportPopConfirm,
            key,
            onClick,
            buttonProps = {},
            disabled,
          } = item || {};
          if (!visible) {
            return null;
          }
          if (supportPopConfirm) {
            const buttonConfig = item; // ButtonConfiguration already contains PopconfirmButtonProps
            return (
              <Popconfirm
                key={key}
                focusLock
                position={'left'}
                disabled={disabled || buttonProps?.disabled}
                title="Tip"
                content={buttonConfig.popConfirmContent}
                onOk={onClick}
                {...buttonConfig.popconfirmProps}
              >
                <Button
                  key={key}
                  type={'text'}
                  disabled={disabled || buttonProps?.disabled}
                  style={{
                    width: '100%',
                    padding: '0 20px',
                    ...buttonProps?.style,
                  }}
                  {...buttonProps}
                >
                  {key}
                </Button>
              </Popconfirm>
            );
          }

          // Merge disabled state, prioritize item level disabled
          const isDisabled = disabled || buttonProps?.disabled;

          const buttonNode = (
            <Button
              key={key}
              onClick={onClick}
              type={'text'}
              style={{
                width: '100%',
                padding: '0 20px',
                ...buttonProps?.style,
              }}
              {...buttonProps}
              disabled={isDisabled}
            >
              {key}
            </Button>
          );

          // Fix tooltip logic: show tooltip when button is disabled and has tooltip
          return tooltip && isDisabled ? (
            <Tooltip key={`tooltip-${key}`} content={tooltip} position="top">
              {buttonNode}
            </Tooltip>
          ) : (
            buttonNode
          );
        })}
      </div>
    );

    // Default dropdown button style
    const defaultDropdownButtonStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '32px', // Set minimum width to ensure dropdown button has appropriate click area
    };

    // Merge user custom style and default style
    const mergedDropdownButtonProps = {
      type: 'text' as const,
      ...dropDownButtonProps,
      style: {
        ...defaultDropdownButtonStyle,
        ...dropDownButtonProps?.style,
      },
      icon: dropDownButtonProps?.icon || <IconDown />,
    };

    return (
      <Dropdown
        droplist={dropdownMenus}
        triggerProps={{ autoAlignPopupMinWidth: true }}
      >
        <Button id={dropdownId} {...mergedDropdownButtonProps} />
      </Dropdown>
    );
  };

  const renderButtonConfigurationsWithDropdown = ({
    buttonConfigurations,
    dropDownButtonProps = {},
    dropdownId,
    dropdownClassName,
  }: {
    buttonConfigurations: ButtonConfiguration[];
    dropDownButtonProps?: BaseButtonProps;
    dropdownId?: string;
    dropdownClassName?: string;
  }) => {
    const { buttonConfigs } = buttonConfigurations.reduce<{
      buttonConfigs: ButtonConfiguration[];
      dropDownConfigs: ButtonConfiguration[];
    }>(
      (total, config) => {
        if (!isEmpty(config?.dropdownProps)) {
          return {
            ...total,
            dropDownConfigs: [...total.dropDownConfigs, config],
          };
        }
        return { ...total, buttonConfigs: [...total.buttonConfigs, config] };
      },
      { buttonConfigs: [], dropDownConfigs: [] },
    );
    const buttonRenders = renderButtonConfiguration(buttonConfigs);
    const dropDownRenders = renderDropDownConfigurations({
      dropDownConfigs: buttonConfigurations,
      dropDownButtonProps,
      dropdownId,
      dropdownClassName,
    });
    return (
      <div
        className={`flex ${gap} flex-wrap items-center`}
        style={{ ...wrapStyle }}
      >
        {buttonRenders}
        {dropDownRenders}
      </div>
    );
  };

  return (
    <div className={`flex ${className}`} style={{ padding: '0', ...style }}>
      {isButtonConfigurationsWithDropdown(buttonConfigurations)
        ? renderButtonConfigurationsWithDropdown({
            buttonConfigurations: buttonConfigurations.configs,
            dropDownButtonProps: buttonConfigurations.dropDownButtonProps,
            dropdownId: buttonConfigurations.dropdownId,
            dropdownClassName: buttonConfigurations.dropdownClassName,
          })
        : renderButtonConfigurations(buttonConfigurations)}
    </div>
  );
};

export { ButtonGroupRender };
