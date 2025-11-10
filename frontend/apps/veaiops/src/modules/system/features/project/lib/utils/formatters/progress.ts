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

import { PROJECT_PROGRESS_COLORS } from '../../constants';

/**
 * Format progress display
 */
export const formatProgress = (
  progress: number,
): {
  text: string;
  color: string;
  percentage: number;
} => {
  const percentage = Math.max(0, Math.min(100, progress || 0));

  let color: string = PROJECT_PROGRESS_COLORS.low;
  if (percentage > 70) {
    color = PROJECT_PROGRESS_COLORS.high;
  } else if (percentage > 30) {
    color = PROJECT_PROGRESS_COLORS.medium;
  }

  return {
    text: `${percentage}%`,
    color,
    percentage,
  };
};
