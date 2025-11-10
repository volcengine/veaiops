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

import type { SimpleOptions } from './typing';

export const getFinallyOptions = ({
  value,
  stateValue,
  options,
}: {
  value?: string | number;
  stateValue?: string | number;
  options?: SimpleOptions[];
}) => {
  const _value = value || [];
  const _stateValue = stateValue || [];
  const _options = options || [];
  // UI optimization: only put currently selected items not in options at the top
  const valueArray = Array.isArray(_value) ? _value : [_value].filter(Boolean);
  const stateValueArray = Array.isArray(_stateValue)
    ? _stateValue
    : [_stateValue].filter(Boolean);
  const optionsArray = Array.isArray(_options) ? _options : [];

  const optionSet = new Set([
    ...valueArray,
    ...stateValueArray,
    ...optionsArray,
  ]);
  return Array.from(optionSet) as (string | number)[];
};
