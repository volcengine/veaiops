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

import { useCallback, useEffect, useState } from 'react';

/**
 * URL parameter management Hook
 * Used to manage query parameters in page URL
 */
export const useUrlParams = () => {
  const [urlParams, setUrlParams] = useState<URLSearchParams>(
    new URLSearchParams(window.location.search),
  );

  // Get specific parameter value
  const getParam = useCallback(
    (key: string): string | null => {
      return urlParams.get(key);
    },
    [urlParams],
  );

  // Set parameter
  interface SetParamParams {
    key: string;
    value: string;
  }

  const setParam = useCallback(({ key, value }: SetParamParams) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.set(key, value);

    // Update URL
    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    window.history.pushState({}, '', newUrl);

    // Update state
    setUrlParams(newParams);
  }, []);

  // Remove parameter
  const removeParam = useCallback((key: string) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.delete(key);

    // Update URL
    const newUrl = newParams.toString()
      ? `${window.location.pathname}?${newParams.toString()}`
      : window.location.pathname;
    window.history.pushState({}, '', newUrl);

    // Update state
    setUrlParams(newParams);
  }, []);

  // Clear all parameters
  const clearParams = useCallback(() => {
    window.history.pushState({}, '', window.location.pathname);
    setUrlParams(new URLSearchParams());
  }, []);

  // Listen to browser forward/back navigation
  useEffect(() => {
    const handlePopState = () => {
      setUrlParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return {
    getParam,
    setParam,
    removeParam,
    clearParams,
    urlParams,
  };
};
