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

import type { PerformNativeUrlUpdateParams } from './types';

/**
 * URL operation helper functions
 */

/**
 * Perform native URL update
 */
export function performNativeUrlUpdate({
  newUrl,
  expectedSearch,
  _beforeUpdate,
}: PerformNativeUrlUpdateParams): void {
  try {
    window.history.pushState(window.history.state, '', newUrl);
    window.history.replaceState(window.history.state, '', newUrl);

    // Use setTimeout to ensure URL update completes
    setTimeout(() => {
      const { search: afterUpdateSearch } = window.location;
      const updateSuccess = afterUpdateSearch === expectedSearch;

      if (!updateSuccess) {
        performLocationSearchUpdate(expectedSearch);
      }
    }, 50);
  } catch (_historyError) {
    // Silently handle errors
  }
}

/**
 * Directly modify location.search
 */
export function performLocationSearchUpdate(expectedSearch: string): void {
  try {
    // Try multiple methods to force URL update
    const { href: currentUrl } = window.location;
    const baseUrl = currentUrl.split('?')[0].split('#')[0];
    const { hash } = window.location;
    const newFullUrl = `${baseUrl}${expectedSearch}${hash}`;

    // Method 1: Directly modify location.search
    window.location.search = expectedSearch.replace('?', '');

    // Method 2: Use location.href
    setTimeout(() => {
      const { search } = window.location;
      if (search !== expectedSearch) {
        window.location.href = newFullUrl;
      }
    }, 10);

    // Method 3: Use location.replace (does not leave a record in history)
    setTimeout(() => {
      const { search } = window.location;
      if (search !== expectedSearch) {
        window.location.replace(newFullUrl);
      }
    }, 20);
  } catch (_locationError) {
    // Silently handle errors
  }
}
