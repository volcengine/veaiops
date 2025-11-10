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
 * Schema Table preset component
 * @description Table preset based on Schema configuration

 *
 */

import type { CustomTableProps } from '@/custom-table/types/components/props';
import type { ModernTableColumnProps } from '@/shared/types';
import type { PaginationProps } from '@arco-design/web-react/es/Pagination/pagination';

/**
 * Schema Table preset configuration
 */
export interface SchemaTableConfig<RecordType = Record<string, unknown>> {
  /** Table title */
  title?: string;
  /** Data source configuration */
  dataSource?: CustomTableProps['dataSource'];
  /** Column configuration */
  columns?: ModernTableColumnProps<RecordType>[];
  /** Pagination configuration */
  pagination?: PaginationProps | boolean;
}

/**
 * Schema Table preset component
 * @param config Preset configuration
 * @returns Preset component configuration
 */
export const createSchemaTablePreset = (config: SchemaTableConfig) => {
  const paginationConfig =
    typeof config.pagination === 'object' &&
    config.pagination !== null &&
    !Array.isArray(config.pagination)
      ? config.pagination
      : {};
  return {
    ...config,
    // Default configuration
    pagination: {
      pageSize: 10,
      ...paginationConfig,
    },
  };
};

/**
 * Default Schema Table preset
 */
export const defaultSchemaTablePreset = createSchemaTablePreset({
  title: 'Schema Table',
  pagination: {
    pageSize: 10,
  },
});
