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
 * CustomTable formatting utility functions
 */
import { isEmpty, snakeCase } from 'lodash-es';

/**
 * Format filter columns
 */
export const formatFilterColumns = (
  filters: Record<string, unknown>,
): Record<string, unknown> => {
  if (isEmpty(filters)) {
    return {};
  }

  return Object.keys(filters).reduce((acc: Record<string, unknown>, key) => {
    const value = filters[key];
    if (!isEmpty(value)) {
      acc[snakeCase(key)] = value;
    }
    return acc;
  }, {});
};
