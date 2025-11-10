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

import { useEffect } from 'react';
import type { SelectBlockState } from '../../types/plugin';

interface UseSharedDatasourceParams {
  dataSourceShare: boolean;
  currentState: SelectBlockState | undefined;
  _canFetch: boolean;
  dataSource: unknown;
  shouldFetchDueToValueEmpty: boolean;
  isFirstHint: boolean;
  _fetchOptions: () => void;
  addDebugLog: (action: string, data: Record<string, unknown>) => void;
}

export const useSharedDatasource = ({
  dataSourceShare,
  currentState,
  _canFetch,
  dataSource,
  shouldFetchDueToValueEmpty,
  isFirstHint,
  _fetchOptions,
  addDebugLog,
}: UseSharedDatasourceParams) => {
  useEffect(() => {
    if (!dataSourceShare) {
      return;
    }

    const shouldFetch = Boolean(
      (currentState && !currentState.searchValue && _canFetch && dataSource) ||
        shouldFetchDueToValueEmpty,
    );

    if (!shouldFetch) {
      return;
    }

    if (isFirstHint) {
      addDebugLog('TRIGGERING_FETCH_IMMEDIATE', {
        reason: 'dataSourceShare + isFirstHint',
      });
      _fetchOptions();
    } else {
      addDebugLog('TRIGGERING_FETCH_DELAYED', {
        reason: 'dataSourceShare + !isFirstHint',
      });
      setTimeout(() => {
        _fetchOptions();
      }, 1000);
    }
  }, [
    dataSourceShare,
    isFirstHint,
    currentState?.searchValue,
    _canFetch,
    dataSource,
    shouldFetchDueToValueEmpty,
    _fetchOptions,
    addDebugLog,
  ]);
};

