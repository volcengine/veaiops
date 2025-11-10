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

import type { Option } from '@veaiops/types';

export const isArrayOptions = (
  options: unknown[],
): options is (string | number)[][] =>
  options.every((opt) => Array.isArray(opt));

export const isOptions = (options: unknown[]): options is Option[] =>
  options.every((opt: unknown) => opt && typeof opt === 'object');

export const isNormalOptions = (
  options: unknown[],
): options is (string | number)[] =>
  options.every(
    (opt: unknown) => typeof opt === 'string' || typeof opt === 'number',
  );

/**
 * Get array type options
 */
export const getArrayTypeOptions = (
  nextOptions: (string | number)[][],
): Option[] => {
  const optionSet: Set<string | number> = new Set();
  for (const nextOption of nextOptions) {
    for (const tag of nextOption) {
      if (tag) {
        optionSet.add(tag);
      }
    }
  }

  const options = Array.from(optionSet);
  return options.map((option) => ({ value: option, label: option }));
};
