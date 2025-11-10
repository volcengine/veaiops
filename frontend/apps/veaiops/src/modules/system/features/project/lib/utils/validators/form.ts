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

import type { ProjectFormData } from '@project/types';
import { validateDate, validateDateRange } from './date';

/**
 * Validate project form data
 */
export const validateProjectFormData = (data: ProjectFormData): string[] => {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push('项目名称不能为空');
  }

  if (data.name.length > 100) {
    errors.push('项目名称不能超过100个字符');
  }

  if (!data.status) {
    errors.push('请选择项目状态');
  }

  if (!data.priority) {
    errors.push('请选择项目优先级');
  }

  if (data.budget && data.budget < 0) {
    errors.push('预算不能为负数');
  }

  if (data.progress && (data.progress < 0 || data.progress > 100)) {
    errors.push('进度必须在0-100之间');
  }

  if (data.start_date && !validateDate(data.start_date)) {
    errors.push('开始时间格式不正确');
  }

  if (data.end_date && !validateDate(data.end_date)) {
    errors.push('结束时间格式不正确');
  }

  if (
    data.start_date &&
    data.end_date &&
    !validateDateRange(data.start_date, data.end_date)
  ) {
    errors.push('结束时间不能早于开始时间');
  }

  if (data.description && data.description.length > 1000) {
    errors.push('描述不能超过1000个字符');
  }

  if (data.owner && data.owner.length > 50) {
    errors.push('负责人名称不能超过50个字符');
  }

  return errors;
};
