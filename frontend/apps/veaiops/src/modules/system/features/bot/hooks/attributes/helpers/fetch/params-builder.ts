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

import type { FetchAttributesParams } from '@bot/lib';
import type { LastRequestParams } from '@bot/types';
import { logger } from '@veaiops/utils';
import { AttributeKey } from 'api-generate';

/**
 * Build API request parameters
 */
export const buildFetchAttributesParams = ({
  requestParams,
  lastRequestParamsRef,
}: {
  requestParams?: FetchAttributesParams;
  lastRequestParamsRef: React.MutableRefObject<LastRequestParams>;
}) => {
  // Log function call and incoming parameters
  // Avoid circular references: only log array/object values, not entire objects
  logger.info({
    message: 'fetchAttributes called',
    data: {
      hasRequestParams: requestParams !== undefined,
      names: Array.isArray(requestParams?.names)
        ? [...requestParams.names]
        : requestParams?.names,
      value: requestParams?.value,
      savedNames: Array.isArray(lastRequestParamsRef.current.names)
        ? [...lastRequestParamsRef.current.names]
        : lastRequestParamsRef.current.names,
      savedValue: lastRequestParamsRef.current.value,
    },
    source: 'useBotAttributes',
    component: 'fetchAttributes',
  });

  // Extract filter parameters
  const { names, value, ...otherParams } = requestParams || {};

  // If new parameters are passed, update saved parameters
  // Note: Only update when requestParams is not undefined (distinguish "has params but value is empty" from "no params")
  if (requestParams !== undefined) {
    const oldParams = { ...lastRequestParamsRef.current };
    lastRequestParamsRef.current = {
      // If incoming names exists, use it; otherwise keep previous value
      names: names !== undefined ? names : lastRequestParamsRef.current.names,
      // If value is undefined, it means not passed, use previous value; if empty string, use empty string
      value: value !== undefined ? value : lastRequestParamsRef.current.value,
    };

    // Log parameter updates
    // Avoid circular references: only log array values
    logger.info({
      message: 'Update saved filter parameters',
      data: {
        oldNames: Array.isArray(oldParams.names)
          ? [...oldParams.names]
          : oldParams.names,
        oldValue: oldParams.value,
        newNames: Array.isArray(lastRequestParamsRef.current.names)
          ? [...lastRequestParamsRef.current.names]
          : lastRequestParamsRef.current.names,
        newValue: lastRequestParamsRef.current.value,
        incomingNames: Array.isArray(names) ? [...names] : names,
        incomingValue: value,
      },
      source: 'useBotAttributes',
      component: 'fetchAttributes',
    });
  } else {
    logger.info({
      message: 'No parameters passed, use saved parameters',
      data: {
        savedNames: Array.isArray(lastRequestParamsRef.current.names)
          ? [...lastRequestParamsRef.current.names]
          : lastRequestParamsRef.current.names,
        savedValue: lastRequestParamsRef.current.value,
      },
      source: 'useBotAttributes',
      component: 'fetchAttributes',
    });
  }

  // Build API request parameters
  // Prioritize incoming parameters, if not provided use saved parameters, finally use default values
  const finalNames =
    names !== undefined
      ? names
      : lastRequestParamsRef.current.names || [AttributeKey.PROJECT];
  const finalValue =
    value !== undefined ? value : lastRequestParamsRef.current.value;

  const params = {
    skip: otherParams.skip || 0,
    limit: otherParams.limit || 100,
    names: finalNames, // Category filter (multi-select), ensure always has value
    value: finalValue || undefined, // Content filter (fuzzy search)
  };

  // Log final built API request parameters
  // Avoid circular references: only log array values
  logger.info({
    message: 'Build API request parameters',
    data: {
      skip: params.skip,
      limit: params.limit,
      names: Array.isArray(finalNames) ? [...finalNames] : finalNames,
      value: finalValue,
      finalNames: Array.isArray(finalNames) ? [...finalNames] : finalNames,
      finalValue,
      namesSource:
        names !== undefined ? 'Incoming parameters' : 'Saved parameters',
      valueSource:
        value !== undefined ? 'Incoming parameters' : 'Saved parameters',
    },
    source: 'useBotAttributes',
    component: 'fetchAttributes',
  });

  return params;
};
