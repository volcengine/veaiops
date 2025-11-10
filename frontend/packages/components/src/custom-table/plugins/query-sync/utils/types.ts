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

import type { QuerySyncConfig, QuerySyncContext } from '@/custom-table/types';

/**
 * Parameter interface for performing native URL updates
 */
export interface PerformNativeUrlUpdateParams {
  newUrl: string;
  expectedSearch: string;
  _beforeUpdate: string;
}

/**
 * Parameter interface for filtering empty data by specified keys
 */
export interface FilterEmptyDataByKeysParams<
  T extends Record<string, unknown>,
> {
  data: T;
  keys: string[];
}

/**
 * Parameter interface for creating query parameter synchronization utility instance
 */
export interface CreateQuerySyncUtilsParams<
  QueryType extends Record<string, unknown> = Record<string, unknown>,
> {
  config: QuerySyncConfig;
  context: QuerySyncContext<QueryType>;
}
