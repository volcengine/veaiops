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

import { PROJECT_BUDGET_CONFIG } from '../../constants';

/**
 * Format budget display
 */
export const formatBudget = (budget: number): string => {
  if (!budget || budget === 0) {
    return '-';
  }

  return new Intl.NumberFormat(PROJECT_BUDGET_CONFIG.locale, {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: PROJECT_BUDGET_CONFIG.minimumFractionDigits,
    maximumFractionDigits: PROJECT_BUDGET_CONFIG.maximumFractionDigits,
  }).format(budget);
};
