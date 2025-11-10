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

// Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. and/or its affiliates
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the Apache License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Masked renderer component
 * Displays sensitive information in a masked format, with a toggle to reveal it.
 */

import { Button, Message, Tooltip, Typography } from '@arco-design/web-react';
import {
  IconCopy,
  IconEye,
  IconEyeInvisible,
  IconRefresh,
} from '@arco-design/web-react/icon';
import { logger, safeCopyToClipboard } from '@veaiops/utils';
import { useState } from 'react';

// Common utility: Safe copy (prefer Clipboard API, fallback to execCommand)
// Relative path from current file to frontend/packages/utils/src/tools/common.ts

const { Text } = Typography;

interface MaskedRendererProps {
  value: string;
  label?: string;
  maskLength?: number;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Masked renderer component
 * Provides copy, show/hide, and refresh functionality
 */
export const MaskedRenderer = ({
  value,
  label: _label = 'Secret',
  maskLength = 8,
  onRefresh,
  className = '',
}: MaskedRendererProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Generate masked string
  const generateMaskedValue = (val: string) => {
    if (!val) {
      return '';
    }
    const visibleLength = Math.min(maskLength, val.length);
    const maskedLength = Math.max(val.length - visibleLength, 4);
    const visiblePart = val.slice(0, visibleLength);
    const maskedPart = '*'.repeat(maskedLength);
    return `${visiblePart}${maskedPart}`;
  };

  // Copy to clipboard (using common utility safeCopyToClipboard), handle user prompts and logging in UI layer
  /**
   * Copy to clipboard
   *
   * @returns Returns result object in format { success: boolean; error?: Error }
   */
  const handleCopy = async (): Promise<{ success: boolean; error?: Error }> => {
    // ✅ Correct: Check the return value of safeCopyToClipboard
    const result = await safeCopyToClipboard(value);

    if (result.success) {
      Message.success('已复制到剪贴板');
      return { success: true };
    } else {
      const error = result.error || new Error('复制失败');
      // ✅ Correct: Use logger to record error and expose actual error information
      logger.error({
        message: 'safeCopyToClipboard 复制失败',
        data: {
          error: error.message,
          stack: error.stack,
          timestamp: Date.now(),
          errorObj: error,
        },
        source: 'MaskedRenderer',
        component: 'handleCopy',
      });
      // Error handling: expose error information
      const errorMessage = error.message || '复制失败';
      Message.error(errorMessage);
      return { success: false, error };
    }
  };

  // Toggle show/hide
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Refresh/regenerate
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      Message.info('刷新功能暂未实现');
    }
  };

  if (!value) {
    return <Text type="secondary">-</Text>;
  }

  const displayValue = isVisible ? value : generateMaskedValue(value);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Masked value display */}
      <div className="flex-1 min-w-0">
        <Text
          className="font-mono text-xs select-all"
          style={{
            wordBreak: 'break-all',
            lineHeight: '1.4',
          }}
        >
          {displayValue}
        </Text>
      </div>

      {/* Action button group */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Copy button */}
        <Tooltip content="复制">
          <Button
            type="text"
            size="mini"
            icon={<IconCopy />}
            onClick={handleCopy}
            className="h-6 w-6 p-0"
          />
        </Tooltip>

        {/* Show/hide toggle button */}
        <Tooltip content={isVisible ? '隐藏' : '显示'}>
          <Button
            type="text"
            size="mini"
            icon={isVisible ? <IconEyeInvisible /> : <IconEye />}
            onClick={toggleVisibility}
            className="h-6 w-6 p-0"
          />
        </Tooltip>

        {/* Refresh button */}
        {onRefresh && (
          <Tooltip content="刷新">
            <Button
              type="text"
              size="mini"
              icon={<IconRefresh />}
              onClick={handleRefresh}
              className="h-6 w-6 p-0"
            />
          </Tooltip>
        )}
      </div>
    </div>
  );
};
