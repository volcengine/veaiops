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
 * Query parameter related type definitions
 * Used to unify all API query and filter scenarios
 */

/**
 * Filter value type
 * Supports common filter value types
 */
export type FilterValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | undefined
  | null;

/**
 * Filter parameters
 * Uses index signature to support dynamic fields
 */
export interface FilterParams {
  [key: string]: FilterValue;
}

/**
 * Complete query parameters
 */
export type QueryParams = FilterParams;

/**
 * Table query parameters
 * Includes page request and other parameters
 */
export interface TableQueryParams {
  /** Page request */
  page_req?: {
    skip: number;
    limit: number;
  };
  /** Other filter parameters */
  [key: string]: FilterValue | { skip: number; limit: number } | undefined;
}
