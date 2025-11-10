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
 * Request management related type definitions
 * Based on pro-components request cancellation mechanism
 *
 * @date 2025-12-19
 */

/**
 * @name Request manager interface
 * @description Manages HTTP request lifecycle for tables
 */
export interface RequestManager {
  /** @name Currently active AbortController */
  currentController?: AbortController;

  /** @name Abort current ongoing request */
  abort: () => void;

  /** @name Create new request controller */
  createController: () => AbortController;

  /** @name Check if request has been aborted */
  isAborted: () => boolean;
}

/**
 * @name Create request manager
 * @description Factory function to create a new request manager instance
 */
export function createRequestManager(): RequestManager {
  let currentController: AbortController | undefined;

  return {
    get currentController() {
      return currentController;
    },

    abort() {
      if (currentController && !currentController.signal.aborted) {
        currentController.abort();
      }
    },

    createController() {
      // Cancel previous request
      this.abort();

      // Create new controller
      currentController = new AbortController();
      return currentController;
    },

    isAborted() {
      return currentController?.signal.aborted ?? false;
    },
  };
}
