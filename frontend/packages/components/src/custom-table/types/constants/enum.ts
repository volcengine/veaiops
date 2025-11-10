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
 * CustomTable enum type definitions
 * Migrated from constants/enum.ts
 */

/**
 * Plugin name enum
 */
export enum PluginNames {
  DATA_SOURCE = 'data-source',
  TABLE_FILTER = 'table-filter',
  TABLE_COLUMNS = 'table-columns',
  TABLE_PAGINATION = 'table-pagination',
  TABLE_SORTING = 'table-sorting',
  TABLE_ALERT = 'table-alert',
  CUSTOM_LOADING = 'custom-loading',
  TABLE_SEARCH = 'table-search',
  COLUMN_WIDTH_PERSISTENCE = 'column-width-persistence',
  CUSTOM_FIELDS = 'custom-fields',
  CUSTOM_FILTER_SETTING = 'custom-filter-setting',
  ROW_SELECTION = 'row-selection',
  DRAG_SORT = 'drag-sort',
  COLUMN_FREEZE = 'column-freeze',
  TABLE_EXPAND = 'table-expand',
  VIRTUAL_SCROLL = 'virtual-scroll',
  TABLE_TOOLBAR = 'table-toolbar',
  INLINE_EDIT = 'inline-edit',
  SMART_CELL = 'smart-cell',
}

// PluginPriority is already exported via export type in core/enums.ts, removed here to avoid duplication
// If needed, import from '@/custom-table/types/core' or '@/custom-table/types'

/**
 * Plugin method name enum
 */
export enum PluginMethods {
  // data-source plugin methods
  LOAD_DATA = 'loadData',
  RESET_DATA = 'resetData',
  LOAD_MORE = 'loadMore',

  // table-filter plugin methods
  RESET_FILTERS = 'resetFilters',

  // table-columns plugin methods
  GET_COLUMNS = 'getColumns',
  RESET_COLUMNS = 'resetColumns',
  FILTER_COLUMNS = 'filterColumns',

  // table-pagination plugin methods
  GET_PAGINATION_INFO = 'getPaginationInfo',
  GET_PAGINATION_CONFIG = 'getPaginationConfig',
  RESET_PAGINATION = 'resetPagination',

  // table-sorting plugin methods
  GET_SORTER_INFO = 'getSorterInfo',
  GET_SORTER_PARAM = 'getSorterParam',
  RESET_SORTER = 'resetSorter',
  ON_SORTER_CHANGE = 'onSorterChange',

  // table-alert plugin methods
  SHOW_ALERT = 'showAlert',
  HIDE_ALERT = 'hideAlert',

  // custom-loading plugin methods
  SHOW_LOADING = 'showLoading',
  HIDE_LOADING = 'hideLoading',
  SET_LOADING_TIP = 'setLoadingTip',

  // table-toolbar plugin methods
  GET_TOOLBAR_CONFIG = 'getToolbarConfig',
  RENDER_TOOLBAR = 'renderToolbar',

  // table-search plugin methods
  SET_SEARCH_VALUE = 'setSearchValue',
  CLEAR_SEARCH = 'clearSearch',
  HANDLE_SEARCH = 'handleSearch',

  // row-selection plugin methods
  SELECT_ROW = 'selectRow',
  SELECT_ALL = 'selectAll',
  CLEAR_SELECTION = 'clearSelection',
  GET_SELECTED_ROWS = 'getSelectedRows',

  // column-width-persistence plugin methods
  GET_PERSISTENT_WIDTHS = 'getPersistentWidths',
  SET_PERSISTENT_WIDTH = 'setPersistentWidth',
  SET_BATCH_PERSISTENT_WIDTHS = 'setBatchPersistentWidths',
  CLEAR_PERSISTENT_WIDTHS = 'clearPersistentWidths',
  DETECT_COLUMN_WIDTHS = 'detectColumnWidths',
  APPLY_PERSISTENT_WIDTHS = 'applyPersistentWidths',
}

/**
 * Renderer name enum
 */
export enum RendererNames {
  // data-source renderers
  EMPTY_STATE = 'emptyState',
  ERROR_STATE = 'errorState',
  LOAD_MORE_BUTTON = 'loadMoreButton',

  // table-filter renderers
  FILTER = 'filter',

  // table-pagination renderers
  PAGINATION = 'pagination',

  // table-alert renderers
  ALERT = 'alert',

  // custom-loading renderers
  LOADING = 'loading',
  LOADING_OVERLAY = 'loadingOverlay',

  // table-toolbar renderers
  TOOLBAR = 'toolbar',
  TOOLBAR_LEFT = 'toolbarLeft',
  TOOLBAR_RIGHT = 'toolbarRight',

  // table-search renderers
  SEARCH = 'search',
  SEARCH_INPUT = 'searchInput',
  SEARCH_BUTTON = 'searchButton',

  // row-selection renderers
  SELECTION_CHECKBOX = 'selectionCheckbox',
  SELECTION_COLUMN = 'selectionColumn',
  BATCH_ACTIONS = 'batchActions',
}
