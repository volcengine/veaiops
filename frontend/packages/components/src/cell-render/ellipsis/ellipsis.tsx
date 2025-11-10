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
  Typography,
  type TypographyEllipsisProps,
} from '@arco-design/web-react';
import { isNil, isString, replace } from 'lodash-es';
import { type CSSProperties, type FC, type ReactNode, useMemo } from 'react';

import { EMPTY_CONTENT } from '@veaiops/constants';

// EMPTY_CONTENT is imported directly from constants

export interface EllipsisRenderProps {
  text: string | number | undefined;
  options?: Partial<TypographyEllipsisProps>;
  prefix?: string;
  unit?: string;
  style?: CSSProperties;
  empty?: JSX.Element;
  icon?: ReactNode;
  sensitive?: boolean;
  startFrom?: number; // Add startFrom property
  center?: boolean; // Add center property
  right?: boolean; // Add right property
  precision?: number; // Add precision property for floating point precision parameter
  onClick?: () => void;
  isLink?: boolean; // Add isLink property
  className?: string;
}

const EllipsisRender: FC<EllipsisRenderProps> = ({
  text,
  options = {},
  prefix = '',
  unit = '',
  style = {},
  onClick,
  empty,
  icon,
  center = false,
  right = false,
  sensitive = false,
  isLink = false,
  startFrom = 0, // Set default value to 0
  precision,
  className = '',
}) => {
  const iconBtn = icon ? <Button icon={icon} size="mini" /> : null;
  const emptyDom = empty || EMPTY_CONTENT;

  // Calculate justifyContent value to avoid nested ternary expressions
  let justifyContentValue: string | undefined;
  if (center) {
    justifyContentValue = 'center';
  } else if (right) {
    justifyContentValue = 'end';
  } else {
    justifyContentValue = style.justifyContent;
  }

  const flexStyle: CSSProperties = {
    display: options?.rows || center || right ? 'flex' : 'block',
    alignItems: 'center',
    justifyContent: justifyContentValue,
    ...(iconBtn ? { gap: '10px' } : {}),
    ...style,
  };

  // Move useMemo before conditional statements
  const displayText = useMemo(() => {
    if (isNil(text) || (isString(text) && text?.length === 0)) {
      return '';
    }

    const trimText = typeof text === 'string' ? text.trim() : text.toString();
    if (sensitive) {
      return (
        trimText.substring(0, startFrom) +
        replace(trimText.substring(startFrom), /\S/g, '*')
      );
    } else if (typeof text === 'number') {
      if (precision !== undefined) {
        // Smart formatting: Use scientific notation for very large/small values to avoid overly long number strings
        const absValue = Math.abs(text);
        const threshold = 1e6; // Threshold: Use scientific notation for values over 1 million or less than 0.000001

        if (
          absValue >= threshold ||
          (absValue > 0 && absValue < 1 / threshold)
        ) {
          // Use scientific notation, keep precision decimal places
          return text.toExponential(precision);
        } else {
          // Use toFixed for normal range
          return Number(text).toFixed(precision);
        }
      } else {
        return text.toString();
      }
    }
    return trimText;
  }, [text, sensitive, startFrom, precision]);

  if (isNil(text) || (isString(text) && text?.length === 0)) {
    return (
      <div style={flexStyle}>
        {emptyDom}
        {iconBtn}
      </div>
    );
  }

  const trimText = typeof text === 'string' ? text.trim() : text.toString();

  if (trimText) {
    return (
      <div
        style={flexStyle}
        onClick={onClick}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onClick) {
            e.preventDefault();
            onClick();
          }
        }}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        className={className}
      >
        <Typography.Ellipsis
          style={{
            marginBottom: 0,
            color: isLink ? 'rgb(var(--link-6))' : 'inherit',
            cursor: isLink ? 'pointer' : 'inherit',
            marginLeft: icon ? '8px' : 0,
            ...style,
          }}
          showTooltip={!options?.rows}
          {...options}
        >
          {prefix + displayText + unit}
        </Typography.Ellipsis>
        {iconBtn}
      </div>
    );
  }

  return EMPTY_CONTENT;
};

export { EllipsisRender };
