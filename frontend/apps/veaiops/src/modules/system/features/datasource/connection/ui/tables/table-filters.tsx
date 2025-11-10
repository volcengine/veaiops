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
 * Data source connection table filter configuration
 */

// Note: TableFiltersProps type has been removed, using local definition
interface TableFiltersProps {
  type: string;
  onFilter: (filters: Record<string, unknown>) => void;
}

/**
 * Get table filter configuration
 */
export const getTableFilters = ({
  type: _type,
  onFilter: _onFilter,
}: TableFiltersProps) => {
  // Temporarily return empty array, can add filters as needed later
  // Can add status filter, time range filter, etc.
  return [];
};

/**
 * Status filter options
 */
export const STATUS_FILTER_OPTIONS = [
  { label: '全部', value: '' },
  { label: '正常', value: 'active' },
  { label: '禁用', value: 'inactive' },
];

/**
 * Time range filter options
 */
export const TIME_RANGE_FILTER_OPTIONS = [
  { label: '全部', value: '' },
  { label: '今天', value: 'today' },
  { label: '最近7天', value: 'week' },
  { label: '最近30天', value: 'month' },
];
