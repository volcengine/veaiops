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
import { useCallback, useState } from 'react';

/**
 * Copy functionality Hook parameter interface
 */
export interface UseCopyParams {
  onSuccess?: (label: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Copy functionality Hook return value
 */
export interface UseCopyReturn {
  copiedText: string;
  handleCopy: (params: {
    text: string;
    identifier: string;
    displayLabel: string;
  }) => Promise<void>;
}

/**
 * Copy functionality Hook
 *
 * Uses safeCopyToClipboard to uniformly handle copy functionality
 * Supports success/failure prompts and copy state management
 */
export const useCopy = ({
  onSuccess,
  onError,
}: UseCopyParams = {}): UseCopyReturn => {
  const [copiedText, setCopiedText] = useState<string>('');

  const handleCopy = useCallback(
    async ({
      text,
      identifier,
      displayLabel,
    }: {
      text: string;
      identifier: string;
      displayLabel: string;
    }): Promise<void> => {
      const result = await safeCopyToClipboard(text);

      if (result.success) {
        setCopiedText(identifier);
        Message.success({
          content: `${displayLabel}已复制到剪贴板`,
          duration: 2000,
        });
        setTimeout(() => {
          setCopiedText('');
        }, 2000);

        if (onSuccess) {
          onSuccess(displayLabel);
        }
      } else if (result.error) {
        const errorMessage =
          result.error instanceof Error
            ? result.error.message
            : '复制失败，请手动复制';
        Message.error({ content: errorMessage, duration: 2000 });

        if (onError && result.error) {
          onError(result.error);
        }
      }
    },
    [onSuccess, onError],
  );

  return { copiedText, handleCopy };
};
