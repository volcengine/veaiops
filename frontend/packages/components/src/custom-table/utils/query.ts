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
 * CustomTable query parameter processing utility functions
 */

/**
 * Get URL parameter object
 */
export const getParamsObject = ({
  searchParams,
  queryFormat = {},
}: {
  searchParams: URLSearchParams;
  queryFormat?: Record<
    string,
    (params: { pre: unknown; value: unknown }) => unknown
  >;
}): Record<string, unknown> => {
  if (!searchParams || typeof searchParams.entries !== 'function') {
    return {};
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of searchParams.entries()) {
    const formatter = queryFormat[key];
    if (formatter && typeof formatter === 'function') {
      result[key] = formatter({ pre: result[key], value });
    } else {
      result[key] = value;
    }
  }

  return result;
};
