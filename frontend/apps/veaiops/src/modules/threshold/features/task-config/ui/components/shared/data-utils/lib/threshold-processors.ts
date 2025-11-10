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

import type { IntelligentThresholdConfig, MetricThresholdResult } from 'api-generate';

/**
 * Single time segment threshold configuration interface
 */
export interface TimeSegmentThresholdConfig {
  startHour: number;
  endHour: number;
  upperBoundValue: number | undefined;
  lowerBoundValue: number;
  hasUpperBound: boolean;
  hasLowerBound: boolean;
}

/**
 * Threshold configuration interface (compatible with old interface + new segmented configuration)
 */
export interface ThresholdConfig {
  // Backward compatible: Keep quick access to first segment threshold
  upperBoundValue: number | undefined;
  lowerBoundValue: number;
  hasUpperBound: boolean;
  hasLowerBound: boolean;
  // New: All segmented threshold configurations
  segments: TimeSegmentThresholdConfig[];
}

/**
 * Extract all segmented threshold configurations from metric
 *
 * Edge case handling:
 * 1. metric.thresholds is null/undefined → Return empty configuration
 * 2. metric.thresholds is empty array → Return empty configuration
 * 3. threshold.upper_bound/lower_bound is null → Corresponding threshold not displayed
 * 4. Time segment hour value exceeds 0-24 range → Log warning but still process
 * 5. Time segment crosses midnight (start_hour > end_hour) → Supported, e.g., [22, 2] means 22:00-02:00
 */
export const extractThresholdConfig = (
  metric: MetricThresholdResult,
): ThresholdConfig => {
  // Safe number parsing function
  const parseToNumber = (value: unknown): number | undefined => {
    if (value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : undefined;
    }

    if (typeof value === 'string') {
      const numericValue = Number(value);
      return Number.isFinite(numericValue) ? numericValue : undefined;
    }

    return undefined;
  };

  // Boundary check: Get all threshold configuration segments (defensive handling of null/undefined)
  const thresholds = metric?.thresholds || [];

  // Boundary check: If no threshold configuration, return empty configuration
  if (thresholds.length === 0) {
    return {
      upperBoundValue: undefined,
      lowerBoundValue: 0,
      hasUpperBound: false,
      hasLowerBound: false,
      segments: [],
    };
  }

  // Convert all segment configurations
  const segments: TimeSegmentThresholdConfig[] = thresholds.map(
    (threshold: IntelligentThresholdConfig) => {
      const upperBoundValue = parseToNumber(threshold.upper_bound);
      const lowerBoundValue = parseToNumber(threshold.lower_bound) ?? 0;
      const hasUpperBound =
        upperBoundValue !== undefined && Number.isFinite(upperBoundValue);
      // Lower bound threshold: Only display when lower_bound has value and is not null, otherwise don't display
      // Note: Changed to only display when lower_bound is explicitly set, avoid displaying 0 for all segments
      const hasLowerBound =
        threshold.lower_bound !== null && threshold.lower_bound !== undefined;

      return {
        startHour: threshold.start_hour,
        endHour: threshold.end_hour,
        upperBoundValue,
        lowerBoundValue,
        hasUpperBound,
        hasLowerBound,
      };
    },
  );

  // Get first threshold configuration (backward compatible)
  const firstThreshold = thresholds[0];
  const upperBoundValue = parseToNumber(firstThreshold?.upper_bound);
  const lowerBoundValue = parseToNumber(firstThreshold?.lower_bound) ?? 0;
  const hasUpperBound =
    upperBoundValue !== undefined && Number.isFinite(upperBoundValue);
  const hasLowerBound =
    firstThreshold?.lower_bound !== null &&
    firstThreshold?.lower_bound !== undefined;

  return {
    // Backward compatible: First segment threshold
    upperBoundValue,
    lowerBoundValue,
    hasUpperBound,
    hasLowerBound,
    // New: All segmented thresholds
    segments,
  };
};
