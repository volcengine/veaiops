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

import { logger } from '@veaiops/utils';
import { useEffect, useRef } from 'react';
import type { SelectBlockState } from '../../types/plugin';

interface UseBasicFetchParams {
  shouldFetchBasic: boolean;
  shouldFetchDueToValueEmpty: boolean;
  _fetchOptions: () => void;
  _canFetch: boolean;
  currentState: SelectBlockState | undefined;
  dataSource: unknown;
  dataSourceShare: boolean;
  dependency: unknown;
  isDependencyFetchingRef: React.MutableRefObject<boolean>;
  addDebugLog: (action: string, data: Record<string, unknown>) => void;
}

export const useBasicFetch = ({
  shouldFetchBasic,
  shouldFetchDueToValueEmpty,
  _fetchOptions,
  _canFetch,
  currentState,
  dataSource,
  dataSourceShare,
  dependency,
  isDependencyFetchingRef,
  addDebugLog,
}: UseBasicFetchParams) => {
  const prevDependencyForBasicFetchRef = useRef<string>('');

  useEffect(() => {
    const currentDependencyStr = JSON.stringify(dependency);
    const dependencyChangedForBasic =
      prevDependencyForBasicFetchRef.current !== currentDependencyStr;

    if (dependencyChangedForBasic) {
      prevDependencyForBasicFetchRef.current = currentDependencyStr;
    }

    if (isDependencyFetchingRef.current) {
      logger.warn(
        'UseFetchEffects',
        '⏸️ Skip basic data fetch - dependency is being processed',
        {
          isDependencyFetching: true,
        },
        'useEffect_basicFetch',
      );
      return;
    }

    const conditionsDetail = {
      shouldFetchBasic,
      shouldFetchDueToValueEmpty,
      _canFetch,
      hasDataSource: Boolean(dataSource),
      dataSourceShare,
    };

    if (!shouldFetchBasic && !shouldFetchDueToValueEmpty) {
      addDebugLog('SKIPPING_BASIC_FETCH', {
        reason: 'conditions not met',
        conditions: conditionsDetail,
      });
      logger.warn(
        'UseFetchEffects',
        'Skip data fetch - conditions not met',
        conditionsDetail,
        'useEffect_basicFetch',
      );
      return;
    }

    if (
      currentState?.fetchOptions?.length > 0 &&
      currentState?.mounted &&
      !shouldFetchDueToValueEmpty
    ) {
      logger.info(
        'UseFetchEffects',
        'Skip data fetch - data already exists',
        {
          fetchOptionsCount: currentState.fetchOptions.length,
          mounted: currentState.mounted,
        },
        'useEffect_basicFetch',
      );
      return;
    }

    logger.info(
      'UseFetchEffects',
      'Preparing to initiate request',
      {
        dataSourceShare,
        willFetch: !dataSourceShare,
        hasFetchOptions: Boolean(_fetchOptions),
      },
      'useEffect_basicFetch',
    );

    if (!dataSourceShare) {
      _fetchOptions();
    }
  }, [
    currentState?.searchValue,
    _canFetch,
    dataSource,
    dataSourceShare,
    shouldFetchDueToValueEmpty,
    dependency,
    isDependencyFetchingRef,
    shouldFetchBasic,
    _fetchOptions,
    addDebugLog,
    currentState?.fetchOptions?.length,
    currentState?.mounted,
  ]);
};

