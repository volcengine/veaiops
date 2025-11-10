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

import type { SearchKeyConfig } from '../../../types/interface';
import type { SearchHandlerConfig } from '../../../types/plugin';

function isNumericString(str: string): boolean {
  return /^\d+$/.test(str);
}

export function getSearchParams(
  inputValue: string,
  config: SearchHandlerConfig,
): Record<string, any> {
  if (!inputValue) {
    return {};
  }

  const {
    searchKey,
    remoteSearchKey,
    multiSearchKeys,
    formatRemoteSearchKey = (v: string) => v,
  } = config;

  const formattedValue = formatRemoteSearchKey(inputValue);

  if (multiSearchKeys && multiSearchKeys.length > 0) {
    const params: Record<string, any> = {};

    multiSearchKeys.forEach((keyConfig: SearchKeyConfig) => {
      if (typeof keyConfig === 'object' && keyConfig.key) {
        const { key, valueType } = keyConfig;

        if (valueType === 'number' && isNumericString(formattedValue)) {
          params[key] = Number(formattedValue);
        } else if (valueType === 'string' || !valueType) {
          params[key] = formattedValue;
        }
      } else if (typeof keyConfig === 'string') {
        params[keyConfig] = formattedValue;
      }
    });

    return params;
  }

  if (remoteSearchKey) {
    return {
      [remoteSearchKey]: formattedValue,
    };
  }

  if (searchKey) {
    return {
      [searchKey]: formattedValue,
    };
  }

  return {
    search: formattedValue,
  };
}

