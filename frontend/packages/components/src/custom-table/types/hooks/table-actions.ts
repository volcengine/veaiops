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

import type {
  CustomTableHelpers,
  CustomTableState,
  PluginManager,
} from '@/custom-table/plugins';
import type React from 'react';
import type { CustomTableActionType } from '../api/action-type';
/**
 * Table actions Hook related type definitions
 */
import type { BaseQuery, BaseRecord } from '../core';

/**
 * useTableActions Hook Props
 */
export interface UseTableActionsProps<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  state: CustomTableState<RecordType, QueryType>;
  helpers: CustomTableHelpers<RecordType, QueryType>;
  pluginManager?: PluginManager;
}

/**
 * useTableActions Hook return value
 */
export interface UseTableActionsReturn<
  RecordType extends BaseRecord = BaseRecord,
> {
  actions: CustomTableActionType<RecordType>;
  actionRef: React.MutableRefObject<
    CustomTableActionType<RecordType> | undefined
  >;
}
