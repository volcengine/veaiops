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
 * Filter related type definitions
 * Used to unify all filter configuration scenarios
 */

import type { ModuleType } from './module';
import type { FilterValue } from './query';

/**
 * Filter query state
 */
export interface FilterQuery {
  /** Agent type */
  agentType?: string | string[];
  /** Event level */
  eventLevel?: string | string[];
  /** Other dynamic fields */
  [key: string]: FilterValue;
}

/**
 * Filter handler properties
 */
export interface FilterHandlerProps {
  /** Module type */
  moduleType?: ModuleType;
  /** Whether to show module type column */
  showModuleTypeColumn?: boolean;
  /** Other dynamic properties */
  [key: string]: unknown;
}

/**
 * Parameters for handling single field change
 */
export interface HandleChangeSingleParams {
  key: string;
  value?: FilterValue;
}

/**
 * Parameters for handling object batch update
 */
export interface HandleChangeObjectParams {
  updates: Record<string, FilterValue>;
}

/**
 * Filter configuration function parameters
 */
export interface FilterConfigParams {
  /** Current query state */
  query: FilterQuery;
  /** Handle query change */
  handleChange: (
    params: HandleChangeSingleParams | HandleChangeObjectParams,
  ) => void;
  /** Additional handler properties */
  handleFiltersProps?: FilterHandlerProps;
}
