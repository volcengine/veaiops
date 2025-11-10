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

import {
  type OperationType,
  TASK_CONFIG_MANAGEMENT_CONFIG,
} from '@task-config/lib';

/**
 * Get drawer title
 */
export const getDrawerTitle = (operationType: OperationType): string => {
  switch (operationType) {
    case 'create':
      return '创建任务';
    case 'copy':
      return '复制任务';
    case 'rerun':
      return '重新执行任务';
    case 'versions':
      return '任务版本历史';
    case 'results':
      return '任务执行结果';
    case 'detail':
      return '任务详情';
    default:
      return '任务操作';
  }
};

/**
 * Get drawer width
 */
export const getDrawerWidth = (operationType: OperationType): number => {
  return operationType === 'detail'
    ? 1300
    : TASK_CONFIG_MANAGEMENT_CONFIG.drawer.width;
};

/**
 * Get button text
 */
export const getButtonText = (operationType: OperationType): string => {
  switch (operationType) {
    case 'create':
      return '创建';
    case 'copy':
      return '创建';
    case 'rerun':
      return '重新执行';
    default:
      return '确定';
  }
};

/**
 * Check if operation is read-only
 */
export const isReadOnlyOperation = (operationType: OperationType): boolean => {
  return operationType === 'versions' || operationType === 'results';
};

/**
 * Check if operation is form operation (needs to show loading)
 */
export const isFormOperation = (operationType: OperationType): boolean => {
  return (
    operationType === 'create' ||
    operationType === 'copy' ||
    operationType === 'rerun'
  );
};
