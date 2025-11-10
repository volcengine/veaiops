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
 * Table pagination plugin type definition
 */

import type { PluginBaseConfig } from './core';

/**
 * Table pagination configuration
 */
export interface TablePaginationConfig extends PluginBaseConfig {
  enabled?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  position?:
    | 'topLeft'
    | 'topCenter'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomCenter'
    | 'bottomRight';
}

/**
 * Table pagination state
 */
export interface TablePaginationState {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  showQuickJumper: boolean;
  showTotal: boolean;
}

/**
 * Table pagination methods
 */
export interface TablePaginationMethods {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  refresh: () => void;
}
