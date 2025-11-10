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
 * Clipboard utilities
 *
 * Uses mature copy-to-clipboard npm package
 */

import copy from 'copy-to-clipboard';

/**
 * Safe clipboard copy utility
 * - Uses copy-to-clipboard package (battle-tested, production-ready)
 *
 * Note: This utility doesn't depend on the UI layer (e.g., Message).
 * On errors, it returns a result object, and the caller decides how to notify users.
 *
 * @param text Text to copy
 * @returns Result object of shape { success: boolean; error?: Error }
 */
export const safeCopyToClipboard = async (
  text: string,
): Promise<{ success: boolean; error?: Error }> => {
  try {
    const success = copy(text, {
      debug: false,
      format: 'text/plain',
    });

    if (success) {
      return { success: true };
    } else {
      const error = new Error('复制失败，浏览器可能不支持剪贴板操作');
      return { success: false, error };
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { success: false, error };
  }
};
