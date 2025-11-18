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
 * @param buttonConfigurations - Button configuration array
 * @returns Rendered button component
 */
const ButtonGroupRender: FC<{
  buttonConfigurations: FinalButtonConfiguration;
  className?: string;
  style?: CSSProperties;
  wrapStyle?: CSSProperties;
  gap?: string; // 新增gap参数，支持自定义间距
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

    // 创建基础按钮内容
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

    // 处理带有 tooltip 的按钮
    const wrapWithTooltip = (button: React.ReactNode) => {
      if (tooltip && disabled) {
        // 如果 tooltip 是 ReactNode（包含错误信息），设置更高的 zIndex
        const isErrorTooltip =
          typeof tooltip !== 'string' && React.isValidElement(tooltip);

        // 合并用户自定义的 tooltipProps 和默认配置
        const defaultTooltipProps: Partial<TooltipProps> = isErrorTooltip
          ? {
              triggerProps: {
                popupStyle: {
                  zIndex: 3000, // 提高 zIndex 到 3000，确保在全局按钮之上
                },
              },
              position: 'top',
            }
          : {
              position: 'top',
            };

        // 合并用户传入的 tooltipProps 和默认配置
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

    // 这种场景是当前按钮为dropDown组件，children是一个dropList
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

    // 合并disabled状态
    const isDisabled = disabled || buttonProps?.disabled;

    if (buttonGroupProps) {
      return (
        <ButtonGroup>
          <Popconfirm
            key={text}
            focusLock
            position={'left'}
            disabled={isDisabled}
            title={popConfirmTitle || '提示'}
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
        title={popConfirmTitle || '提示'}
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

    // 如果按钮禁用且有tooltip，用Tooltip包装Popconfirm
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
    buttonConfigurations.map(({ supportPopConfirm, ...rest }, index) => {
      const buttonElement = supportPopConfirm
        ? renderPopconfirmButton(rest)
        : renderButton(rest);
      // Use dataTestId as key if available, otherwise use text, fallback to index
      const key = rest.dataTestId || rest.text || `button-${index}`;
      // Wrap in Fragment with key to ensure each list item has a unique key
      return buttonElement ? (
        <React.Fragment key={key}>{buttonElement}</React.Fragment>
      ) : null;
    });

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
            // 确保disabled状态正确传递
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
            // 确保tooltip和disabled状态正确传递
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
            const buttonConfig = item; // ButtonConfiguration 已经包含了 PopconfirmButtonProps
            return (
              <Popconfirm
                key={key}
                focusLock
                position={'left'}
                disabled={disabled || buttonProps?.disabled}
                title="提示"
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

          // 合并disabled状态，优先使用item level的disabled
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

          // 修复tooltip逻辑：当按钮禁用且有tooltip时显示tooltip
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

    // 默认的下拉按钮样式
    const defaultDropdownButtonStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '32px', // 设置最小宽度，确保dropdown按钮有合适的点击区域
    };

    // 合并用户自定义样式和默认样式
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
