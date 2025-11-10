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
 * Monitor configuration table column configuration
 *
 * Abstract column configuration logic separately to improve code maintainability
 * Business side can customize column configuration by modifying this file
 */

import type { DataSource, DataSourceType } from 'api-generate';
import { useCallback } from 'react';
import { getCommonColumns } from './columns/index';

/**
 * Monitor table column configuration parameters
 */
export interface MonitorTableColumnsConfig {
  /** Data source type */
  dataSourceType: DataSourceType;
  /** Edit handler */
  onEdit?: (monitor: DataSource) => void;
  /** Delete handler (returns void, used for action column) */
  handleDelete?: (id: string) => Promise<boolean>;
  /** Toggle active status handler */
  handleToggle?: () => Promise<boolean>;
}

/**
 * Monitor table column configuration Hook
 *
 * @param config Column configuration parameters
 * @returns Column configuration function
 */
export const useMonitorTableColumns = ({
  dataSourceType,
  onEdit,
  handleDelete,
  handleToggle,
}: MonitorTableColumnsConfig) => {
  return useCallback(
    (_props: Record<string, unknown>) => {
      return getCommonColumns(
        dataSourceType,
        handleDelete || (() => Promise.resolve()), // Provide default delete handler
        onEdit, // ✅ Type safe
        handleToggle, // ✅ Auto refresh
      );
    },
    [dataSourceType, handleDelete, handleToggle, onEdit],
  );
};
