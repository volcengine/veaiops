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
 * @name CustomTable core enum definitions
 * @description Enum values extracted from existing source code, replacing literals to improve type safety

 *
 */

/**
 * Plugin priority enum
 */
export enum PluginPriorityEnum {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Plugin priority type alias (maintain backward compatibility)
 */
export type PluginPriority = PluginPriorityEnum;

/**
 * Plugin status enum
 */
export enum PluginStatusEnum {
  INACTIVE = 'inactive',
  INSTALLING = 'installing',
  INSTALLED = 'installed',
  ACTIVE = 'active',
  ERROR = 'error',
  DISABLED = 'disabled',
  DESTROYED = 'destroyed',
}

/**
 * Plugin lifecycle phase enum
 */
export enum LifecyclePhaseEnum {
  BEFORE_MOUNT = 'beforeMount',
  AFTER_MOUNT = 'afterMount',
  BEFORE_UPDATE = 'beforeUpdate',
  AFTER_UPDATE = 'afterUpdate',
  BEFORE_UNMOUNT = 'beforeUnmount',
  AFTER_UNMOUNT = 'afterUnmount',
  ON_MOUNT = 'onMount',
  ON_UNMOUNT = 'onUnmount',
  ON_UPDATE = 'onUpdate',
  ON_DESTROY = 'onDestroy',
}

/**
 * Table action type enum
 */
export enum TableActionEnum {
  PAGINATE = 'paginate',
  SORT = 'sort',
  FILTER = 'filter',
}

/**
 * Sort direction enum
 */
export enum SortDirectionEnum {
  ASCEND = 'ascend',
  DESCEND = 'descend',
}

/**
 * Table feature enum
 */
export enum TableFeatureEnum {
  PAGINATION = 'enablePagination',
  SORTING = 'enableSorting',
  FILTERING = 'enableFilter',
  SELECTION = 'enableSelection',
  COLUMN_RESIZE = 'enableColumnResize',
  FULL_SCREEN = 'enableFullScreen',
}

/**
 * Pagination property enum
 */
export enum PaginationPropertyEnum {
  SHOW_TOTAL = 'showTotal',
  SHOW_JUMPER = 'showJumper',
  SHOW_PAGE_SIZE = 'showSizeChanger', // Note: Arco's actual property name
  PAGE_SIZE_OPTIONS = 'pageSizeOptions',
  SIZE = 'size',
}

/**
 * Column fixed position enum
 */
export enum ColumnFixedEnum {
  LEFT = 'left',
  RIGHT = 'right',
}

/**
 * Table size enum
 */
export enum TableSizeEnum {
  MINI = 'mini',
  SMALL = 'small',
  DEFAULT = 'default',
  LARGE = 'large',
}

/**
 * Alert type enum
 */
export enum AlertTypeEnum {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

/**
 * Plugin name enum
 */
export enum PluginNameEnum {
  TABLE_ALERT = 'tableAlert',
  TABLE_COLUMNS = 'tableColumns',
  TABLE_FILTER = 'tableFilter',
  TABLE_PAGINATION = 'tablePagination',
  TABLE_SORTING = 'tableSorting',
  QUERY_SYNC = 'querySync',
  DATA_SOURCE = 'dataSource',
}

/**
 * Priority mapping type
 */
export type PriorityMap = Record<PluginPriorityEnum, number>;

/**
 * Priority mapping constant
 */
export const PRIORITY_MAP: PriorityMap = {
  [PluginPriorityEnum.CRITICAL]: -1,
  [PluginPriorityEnum.HIGH]: 0,
  [PluginPriorityEnum.MEDIUM]: 1,
  [PluginPriorityEnum.LOW]: 2,
};

/**
 * Default pagination configuration
 */
export const DEFAULT_PAGINATION_CONFIG = {
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  size: TableSizeEnum.DEFAULT,
} as const;

/**
 * Default table feature configuration
 */
export const DEFAULT_FEATURE_CONFIG = {
  [TableFeatureEnum.PAGINATION]: true,
  [TableFeatureEnum.SORTING]: true,
  [TableFeatureEnum.FILTERING]: true,
  [TableFeatureEnum.SELECTION]: false,
  [TableFeatureEnum.COLUMN_RESIZE]: false,
  [TableFeatureEnum.FULL_SCREEN]: false,
} as const;
