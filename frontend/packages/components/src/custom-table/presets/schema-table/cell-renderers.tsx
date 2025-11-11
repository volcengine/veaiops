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

import { CellRender } from '@/cell-render';
import {
  Image,
  Link,
  Progress,
  Rate,
  Space,
  Switch,
  Tooltip,
} from '@arco-design/web-react';
import { EMPTY_CONTENT_TEXT } from '@veaiops/constants';
import { formatDateTime, safeCopyToClipboard } from '@veaiops/utils';
import type React from 'react';

import type {
  BaseRecord,
  ColumnSchema,
} from '@/custom-table/types/schema-table';
import { safeToReactNode, safeToString } from './helpers';

// Destructure CellRender component to avoid repeated calls
const { CustomOutlineTag } = CellRender;

/**
 * Render text type cell
 */
export const renderTextCell = (
  value: unknown,
  column: ColumnSchema,
): React.ReactNode => {
  const displayValue: React.ReactNode = safeToReactNode(value);

  if (column.copyable) {
    return (
      <Tooltip content="Click to copy">
        <span
          style={{ cursor: 'pointer' }}
          onClick={async () => {
            let textToCopy = '';
            if (typeof value === 'object' && value !== null) {
              textToCopy = JSON.stringify(value);
            } else if (value != null) {
              textToCopy = String(value as string | number | boolean);
            }
            await safeCopyToClipboard(textToCopy);
          }}
        >
          {displayValue}
        </span>
      </Tooltip>
    );
  }

  return displayValue;
};

/**
 * Render number type cell
 */
export const renderNumberCell = (
  value: unknown,
  format?: ColumnSchema['format'],
): React.ReactNode => {
  return typeof value === 'number'
    ? value.toLocaleString(undefined, {
        minimumFractionDigits: format?.precision || 0,
        maximumFractionDigits: format?.precision || 2,
      })
    : safeToReactNode(value);
};

/**
 * Render date type cell
 *
 * Uses formatDateTime to handle timezone conversion uniformly
 * Assumes input is UTC time, automatically converts to user's selected timezone
 */
export const renderDateCell = (value: unknown): React.ReactNode => {
  return formatDateTime(value as string | number | Date | null | undefined);
};

/**
 * Render date-time type cell
 *
 * Uses formatDateTime to handle timezone conversion uniformly
 * Assumes input is UTC time, automatically converts to user's selected timezone
 */
export const renderDateTimeCell = (value: unknown): React.ReactNode => {
  // Second parameter true means show seconds
  return formatDateTime(
    value as string | number | Date | null | undefined,
    true,
  );
};

/**
 * Render select type cell
 */
export const renderSelectCell = (
  value: unknown,
  valueEnum?: ColumnSchema['valueEnum'],
): React.ReactNode => {
  if (valueEnum && typeof value === 'string') {
    const enumItem = valueEnum[value];
    if (enumItem) {
      return <CustomOutlineTag>{enumItem.text}</CustomOutlineTag>;
    }
  }
  return safeToReactNode(value);
};

/**
 * Render multi-select type cell
 */
export const renderMultiSelectCell = (
  value: unknown,
  valueEnum?: ColumnSchema['valueEnum'],
): React.ReactNode => {
  if (Array.isArray(value) && valueEnum) {
    return (
      <Space wrap>
        {value.map((item, index) => {
          const enumItem = valueEnum[item];
          return enumItem ? (
            <CustomOutlineTag key={index}>{enumItem.text}</CustomOutlineTag>
          ) : (
            <span key={index}>{safeToReactNode(item)}</span>
          );
        })}
      </Space>
    );
  }
  return safeToReactNode(value);
};

/**
 * Render tag type cell
 */
export const renderTagCell = (value: unknown): React.ReactNode => {
  const tagValue: React.ReactNode = safeToReactNode(value);
  return Array.isArray(value) ? (
    <Space wrap>
      {value.map((item, index) => (
        <CustomOutlineTag key={index}>{safeToReactNode(item)}</CustomOutlineTag>
      ))}
    </Space>
  ) : (
    <CustomOutlineTag>{tagValue}</CustomOutlineTag>
  );
};

/**
 * Render color type cell
 */
export const renderColorCell = (value: unknown): React.ReactNode => {
  return (
    <Space>
      <div
        style={{
          width: 16,
          height: 16,
          backgroundColor: safeToString(value),
          border: '1px solid #d9d9d9',
          borderRadius: 2,
        }}
      />
      {safeToReactNode(value)}
    </Space>
  );
};

/**
 * Render cell content based on valueType
 */
export const renderCellByValueType = (
  value: unknown,
  record: BaseRecord,
  column: ColumnSchema,
): React.ReactNode => {
  if (value === null || value === undefined || value === '') {
    return EMPTY_CONTENT_TEXT;
  }

  const { valueType, valueEnum, format } = column;

  switch (valueType) {
    case 'text':
      return renderTextCell(value, column);

    case 'number':
      return renderNumberCell(value, format);

    case 'money':
      return `${format?.moneySymbol || '¥'}${Number(value).toLocaleString()}`;

    case 'percent':
      return `${(Number(value) * 100).toFixed(format?.precision || 2)}%`;

    case 'date':
      return renderDateCell(value);

    case 'dateTime':
      return renderDateTimeCell(value);

    case 'boolean':
      return <Switch checked={Boolean(value)} disabled />;

    case 'select':
      return renderSelectCell(value, valueEnum);

    case 'multiSelect':
      return renderMultiSelectCell(value, valueEnum);

    case 'tag':
      return renderTagCell(value);

    case 'status':
      return <CustomOutlineTag>{safeToString(value)}</CustomOutlineTag>;

    case 'progress':
      return <Progress percent={Number(value)} size="small" />;

    case 'rate':
      return <Rate value={Number(value)} disabled />;

    case 'image':
      return <Image src={safeToString(value)} width={60} height={40} />;

    case 'link':
      return (
        <Link href={safeToString(value)} target="_blank">
          {safeToReactNode(value)}
        </Link>
      );

    case 'color':
      return renderColorCell(value);

    case 'json':
      return (
        <Tooltip content={<pre>{JSON.stringify(value, null, 2)}</pre>}>
          <CustomOutlineTag>JSON</CustomOutlineTag>
        </Tooltip>
      );

    default:
      return safeToReactNode(value);
  }
};
