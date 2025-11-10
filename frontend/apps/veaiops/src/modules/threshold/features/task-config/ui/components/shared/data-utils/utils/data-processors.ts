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

import { logger } from '@veaiops/utils';
import type { TimeseriesDataPoint } from '../../types';
import type { ThresholdConfig } from '../lib/threshold-processors';
import {
  parseToNumber,
  validateTimestamp,
  validateValueRange,
} from '../lib/validators';
import type { TimeseriesBackendItem } from '../lib/validators';
import { generateSeriesIdentifier } from './label-processors';

/**
 * Process data points for a single time series item
 */
export const processTimeseriesItem = ({
  item,
  seriesIndex,
  thresholdConfig,
  allTimestamps,
}: {
  item: TimeseriesBackendItem;
  seriesIndex: number;
  thresholdConfig: ThresholdConfig;
  allTimestamps: Set<string>;
}): TimeseriesDataPoint[] => {
  const data: TimeseriesDataPoint[] = [];
  const { upperBoundValue, lowerBoundValue, hasUpperBound, hasLowerBound } =
    thresholdConfig;

  const { timestamps } = item;
  const { values } = item;
  const loopLength = Math.min(timestamps.length, values.length);

  const seriesType: '实际值' | '上阈值' | '下阈值' = '实际值';

  // Process each data point
  for (let i = 0; i < loopLength; i++) {
    const rawTimestamp = timestamps[i];

    // Boundary check: Timestamp must be a number
    if (!validateTimestamp(rawTimestamp)) {
      logger.warn({
        message: `Invalid timestamp at series ${seriesIndex}, index ${i}`,
        data: { seriesIndex, index: i, rawTimestamp },
        source: 'DataUtils',
        component: 'processTimeseriesItem',
      });
      continue;
    }

    const timestampDate = new Date((rawTimestamp as number) * 1000);

    // Boundary check: Date object must be valid
    if (Number.isNaN(timestampDate.getTime())) {
      continue;
    }

    const timestamp = timestampDate.toISOString();
    allTimestamps.add(timestamp);

    const actualValue = parseToNumber(values[i]);

    // Boundary check: Value must be a valid number
    if (actualValue !== undefined) {
      // Boundary check: Value reasonableness
      if (validateValueRange(actualValue)) {
        data.push({
          timestamp,
          value: actualValue,
          type: seriesType as '实际值' | '上阈值' | '下阈值',
        });
      } else {
        logger.warn({
          message: `Value out of reasonable range at series ${seriesIndex}, index ${i}`,
          data: { seriesIndex, index: i, actualValue },
          source: 'DataUtils',
          component: 'processTimeseriesItem',
        });
      }
    }
  }

  return data;
};

/**
 * Get threshold configuration for the corresponding time segment based on timestamp
 *
 * Note:
 * 1. Backend uses Asia/Shanghai timezone (DEFAULT_TIMEZONE)
 * 2. Frontend timestamps are ISO strings, Date.getHours() uses local timezone
 * 3. If local timezone differs from server timezone, time segment matching may be incorrect
 * 4. Current implementation uses local timezone, assuming user is in Asia/Shanghai timezone or time difference doesn't affect segment matching
 *
 * @param timestamp - ISO timestamp string
 * @param thresholdConfig - Threshold configuration
 * @returns Threshold configuration for the corresponding time segment, or null if no match
 */
const getThresholdForTimestamp = (
  timestamp: string,
  thresholdConfig: ThresholdConfig,
): {
  upperBoundValue: number | undefined;
  lowerBoundValue: number;
  hasUpperBound: boolean;
  hasLowerBound: boolean;
} | null => {
  // Boundary check: timestamp must be a valid ISO string
  if (!timestamp) {
    logger.warn({
      message: 'Invalid timestamp for threshold matching',
      data: { timestamp },
      source: 'DataUtils',
      component: 'getThresholdForTimestamp',
    });
    return null;
  }

  // Parse timestamp, extract hour (0-23)
  const date = new Date(timestamp);

  // Boundary check: Date object must be valid
  if (Number.isNaN(date.getTime())) {
    logger.warn({
      message: 'Invalid date from timestamp',
      data: { timestamp },
      source: 'DataUtils',
      component: 'getThresholdForTimestamp',
    });
    return null;
  }

  const hour = date.getHours(); // 0-23 (local timezone)

  // Boundary check: segments must exist and not be empty
  if (!thresholdConfig.segments || thresholdConfig.segments.length === 0) {
    return null;
  }

  // Find matching time segment configuration
  // Time segment matching rule: hour >= start_hour && hour < end_hour (left-closed, right-open interval)
  // Special case handling:
  // 1. Segments crossing midnight (e.g., [22, 2]) need special handling: hour >= 22 || hour < 2
  // 2. Normal segments (e.g., [6, 12]): hour >= 6 && hour < 12
  const matchedSegment = thresholdConfig.segments.find((segment) => {
    const { startHour, endHour } = segment;

    // Boundary check: Segment hour values must be in 0-24 range
    if (startHour < 0 || startHour > 24 || endHour < 0 || endHour > 24) {
      logger.warn({
        message: 'Invalid segment hour range',
        data: { startHour, endHour },
        source: 'DataUtils',
        component: 'getThresholdForTimestamp',
      });
      return false;
    }

    // Handle segments crossing midnight (e.g., [22, 2])
    if (startHour > endHour) {
      // Crossing midnight: hour >= startHour || hour < endHour
      return hour >= startHour || hour < endHour;
    }

    // Normal segment (left-closed, right-open): hour >= startHour && hour < endHour
    return hour >= startHour && hour < endHour;
  });

  if (!matchedSegment) {
    // If no matching segment, return null (don't show threshold)
    // This may occur when:
    // 1. Time segment configuration has gaps (some hours not covered)
    // 2. Timestamp hour value exceeds all segment ranges
    return null;
  }

  return {
    upperBoundValue: matchedSegment.upperBoundValue,
    lowerBoundValue: matchedSegment.lowerBoundValue,
    hasUpperBound: matchedSegment.hasUpperBound,
    hasLowerBound: matchedSegment.hasLowerBound,
  };
};

/**
 * Add threshold lines for all unique timestamps (supports segmented thresholds)
 */
export const addThresholdLines = ({
  allTimestamps,
  thresholdConfig,
}: {
  allTimestamps: Set<string>;
  thresholdConfig: ThresholdConfig;
}): TimeseriesDataPoint[] => {
  const data: TimeseriesDataPoint[] = [];

  // If no segment configuration, use old logic (backward compatible)
  if (!thresholdConfig.segments || thresholdConfig.segments.length === 0) {
    const { upperBoundValue, lowerBoundValue, hasUpperBound, hasLowerBound } =
      thresholdConfig;

    allTimestamps.forEach((timestamp) => {
      if (hasUpperBound && upperBoundValue !== undefined) {
        data.push({
          timestamp,
          value: upperBoundValue,
          type: '上阈值',
        });
      }

      if (hasLowerBound) {
        data.push({
          timestamp,
          value: lowerBoundValue,
          type: '下阈值',
        });
      }
    });

    return data;
  }

  // New logic: Select corresponding threshold based on the time segment of the timestamp
  allTimestamps.forEach((timestamp) => {
    const segmentThreshold = getThresholdForTimestamp(
      timestamp,
      thresholdConfig,
    );

    if (!segmentThreshold) {
      // If no matching segment, skip this timestamp
      return;
    }

    // Add upper bound threshold
    if (
      segmentThreshold.hasUpperBound &&
      segmentThreshold.upperBoundValue !== undefined
    ) {
      data.push({
        timestamp,
        value: segmentThreshold.upperBoundValue,
        type: '上阈值',
      });
    }

    // Add lower bound threshold
    if (segmentThreshold.hasLowerBound) {
      data.push({
        timestamp,
        value: segmentThreshold.lowerBoundValue,
        type: '下阈值',
      });
    }
  });

  return data;
};
