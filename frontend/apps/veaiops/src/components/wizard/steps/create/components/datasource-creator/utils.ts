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
 * Data source creator utility functions
 */

import { logger } from '@veaiops/utils';

/**
 * Process API errors, convert to user-friendly error messages
 *
 * @param error - Caught error object
 * @param operation - Operation type (create/update)
 * @param component - Component name (for logging)
 * @param config - Configuration object (for logging)
 * @returns Processed user-friendly error message
 */
export const processApiError = ({
  error,
  operation,
  component,
  config,
}: {
  error: unknown;
  operation: 'create' | 'update';
  component: string;
  config?: unknown;
}): string => {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  let errorMessage =
    errorObj.message ||
    (operation === 'create' ? '创建失败，请重试' : '更新失败，请重试');

  // Log original error information
  logger.error({
    message: `[Wizard - ${component}] 捕获到错误`,
    data: {
      operation,
      originalError: errorObj.message,
      errorStack: errorObj.stack,
      errorObj,
      config,
    },
    source: 'DataSourceCreator',
    component,
  });

  // ✅ Handle common 4xx client errors
  if (
    errorMessage.includes('duplicate key') ||
    errorMessage.includes('E11000')
  ) {
    // 409 Conflict - Duplicate key error
    const nameMatch = errorMessage.match(/name.*?:\s*"([^"]+)"/);
    if (nameMatch?.[1]) {
      errorMessage = `数据源名称 "${nameMatch[1]}" 已存在，请使用其他名称`;
    } else {
      errorMessage = '数据源名称已存在，请使用其他名称';
    }
  } else if (errorMessage.includes('Conflict')) {
    errorMessage = '数据源已存在，请检查输入信息';
  } else if (errorMessage.includes('Not Found')) {
    errorMessage =
      operation === 'create'
        ? '连接配置不存在，请先创建连接'
        : '数据源不存在，无法更新';
  } else if (errorMessage.includes('Forbidden')) {
    errorMessage = `权限不足，无法${operation === 'create' ? '创建' : '更新'}数据源`;
  } else if (errorMessage.includes('Bad Request')) {
    errorMessage = '请求参数错误，请检查输入信息';
  } else if (errorMessage.includes('Unprocessable Entity')) {
    errorMessage = '数据格式错误，请检查输入信息';
  }

  // Log processed error information
  logger.error({
    message: `[Wizard - ${component}] 处理后的错误信息`,
    data: {
      processedMessage: errorMessage,
      originalMessage: errorObj.message,
    },
    source: 'DataSourceCreator',
    component,
  });

  return errorMessage;
};
