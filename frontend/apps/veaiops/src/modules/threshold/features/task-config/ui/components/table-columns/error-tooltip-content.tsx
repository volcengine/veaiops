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

import { extractErrorSummary } from '@task-config/lib';
import type React from 'react';

/**
 * Error details Tooltip content component
 *
 * Used to uniformly render Tooltip content for task failure reasons
 * Supports:
 * - Display error summary
 * - If detailed information exists, display complete error information
 */
export const ErrorTooltipContent: React.FC<{ errorMessage: string }> = ({
  errorMessage,
}) => {
  const errorInfo = extractErrorSummary(errorMessage);
  const hasDetails =
    errorInfo.details && errorInfo.details.length > errorInfo.summary.length;

  return (
    <div className="max-w-[600px]">
      <div className="font-medium mb-2 text-white">任务失败原因:</div>
      <div className="mb-2 text-white break-words">{errorInfo.summary}</div>
      {hasDetails && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="text-xs text-gray-300 mb-1">完整错误信息:</div>
          <div
            className="max-h-[300px] overflow-y-auto overflow-x-auto bg-gray-900 rounded p-2 text-xs font-mono text-gray-300 whitespace-pre-wrap break-all"
            style={{
              fontFamily: 'Monaco, Menlo, "Courier New", monospace',
              lineHeight: '1.5',
            }}
          >
            {errorInfo.details}
          </div>
        </div>
      )}
    </div>
  );
};
