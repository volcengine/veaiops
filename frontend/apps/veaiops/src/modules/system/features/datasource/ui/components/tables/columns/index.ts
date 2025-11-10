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
 * Monitor data source management table column configuration - Main entry file
 */

import type { DeleteHandler, EditHandler } from '@datasource/types';
import type { ModernTableColumnProps } from '@veaiops/components';
import { type DataSource, DataSourceType } from 'api-generate';
import { getActionColumn } from './action-column';
import { getBaseColumns } from './base-columns';

/**
 * Get common table column configuration
 */
export const getCommonColumns = (
  dataSourceType: DataSourceType,
  onDelete: DeleteHandler,
  onEdit?: EditHandler,
  onToggled?: () => void,
): ModernTableColumnProps<DataSource>[] => {
  return [
    ...getBaseColumns(dataSourceType),
    getActionColumn(onDelete, onEdit, onToggled),
  ];
};

/**
 * Get Zabbix-specific column configuration
 */
export const getZabbixColumns = (
  onDelete: DeleteHandler,
  onEdit?: EditHandler,
  onToggled?: () => void,
) => {
  return getCommonColumns(DataSourceType.ZABBIX, onDelete, onEdit, onToggled);
};

/**
 * Get Aliyun-specific column configuration
 */
export const getAliyunColumns = (
  onDelete: DeleteHandler,
  onEdit?: EditHandler,
  onToggled?: () => void,
) => {
  return getCommonColumns(DataSourceType.ALIYUN, onDelete, onEdit, onToggled);
};

/**
 * Get Volcengine-specific column configuration
 */
export const getVolcengineColumns = (
  onDelete: DeleteHandler,
  onEdit?: EditHandler,
  onToggled?: () => void,
) => {
  return getCommonColumns(
    DataSourceType.VOLCENGINE,
    onDelete,
    onEdit,
    onToggled,
  );
};

// Re-export types
export type {
  DeleteHandler,
  ViewHandler,
  EditHandler,
} from '@datasource/types';

// Export individual column configurations
export { getBaseColumns } from './base-columns';
export { getActionColumn } from './action-column';
