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

import { Message } from '@arco-design/web-react';
import { safeCopyToClipboard } from '@veaiops/utils';
import { useCallback } from 'react';

/**
 * Error handler Hook
 */
export const useErrorHandler = () => {
  // Copy error message to clipboard
  const handleCopyError = useCallback(async (error: string) => {
    // ✅ Correct: Check safeCopyToClipboard return value
    const result = await safeCopyToClipboard(error);

    if (result.success) {
      Message.success('错误信息已复制到剪贴板'); // Reverted to Chinese (code string)
    } else {
      // ✅ Correct: Expose actual error information
      const errorMessage = result.error?.message || '复制失败，请手动复制'; // Reverted to Chinese (code string)
      Message.error(errorMessage);
    }
  }, []);

  return {
    handleCopyError,
  };
};
