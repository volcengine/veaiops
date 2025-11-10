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
import type { MetricThresholdResult } from 'api-generate';
import type { TimeseriesDataPoint } from '../types';
import { extractThresholdConfig } from './lib/threshold-processors';
import { validateTimeseriesItem } from './lib/validators';
import type { TimeseriesBackendItem } from './lib/validators';
import { addThresholdLines, processTimeseriesItem } from './utils';

/**
 * Parameter interface for converting backend-returned time series data to chart format
 */
export interface ConvertTimeseriesDataParams {
  backendData: TimeseriesBackendItem[];
  metric: MetricThresholdResult;
}

/**
 * Convert backend-returned time series data to chart format
 *
 * @param params - Parameter object containing backendData and metric
 * @returns Converted chart data point array
 */
export const convertTimeseriesData = ({
  backendData,
  metric,
}: ConvertTimeseriesDataParams): TimeseriesDataPoint[] => {
  const data: TimeseriesDataPoint[] = [];

  // Statistics (for debugging and monitoring)
  let totalSamples = 0;
  const skippedValueCount = 0;
  const skippedTimestampCount = 0;
  let invalidItemCount = 0;

  // Boundary check: metric must exist
  if (!metric) {
    // ✅ Correct: Use logger to record error
    logger.error({
      message: 'metric is required',
      data: {},
      source: 'DataUtils',
      component: 'convertTimeseriesData',
    });
    return [];
  }

  // Boundary check: backendData must be an array
  if (!Array.isArray(backendData)) {
    // ✅ Correct: Use logger to record error
    logger.error({
      message: 'backendData must be an array',
      data: { backendDataType: typeof backendData },
      source: 'DataUtils',
      component: 'convertTimeseriesData',
    });
    return [];
  }

  // Boundary check: Return empty array directly
  if (backendData.length === 0) {
    // ✅ Correct: Use logger to record info
    logger.info({
      message: 'backendData is empty',
      data: {},
      source: 'DataUtils',
      component: 'convertTimeseriesData',
    });
    return [];
  }

  // Extract threshold configuration
  const thresholdConfig = extractThresholdConfig(metric);

  // Used to store all unique timestamps for adding threshold lines
  const allTimestamps = new Set<string>();

  // Boundary check: Validate validity of each time series item
  backendData.forEach((item, seriesIndex) => {
    if (!validateTimeseriesItem(item)) {
      invalidItemCount++;
      return;
    }

    const itemData = processTimeseriesItem({
      item,
      seriesIndex,
      thresholdConfig,
      allTimestamps,
    });

    data.push(...itemData);
    totalSamples += item.timestamps.length;
  });

  // Boundary check: If all data was skipped
  if (allTimestamps.size === 0) {
    // ✅ Correct: Use logger to record warning
    logger.warn({
      message: 'All timestamps were skipped',
      data: {
        totalSamples,
        skippedTimestamps: skippedTimestampCount,
        skippedValues: skippedValueCount,
        invalidItems: invalidItemCount,
      },
      source: 'DataUtils',
      component: 'convertTimeseriesData',
    });
    return [];
  }

  // Add threshold lines for all unique timestamps
  const thresholdData = addThresholdLines({
    allTimestamps,
    thresholdConfig,
  });
  data.push(...thresholdData);

  // Boundary check: Final data should not be empty
  if (data.length === 0) {
    // ✅ Correct: Use logger to record warning
    logger.warn({
      message: 'Final data array is empty after processing',
      data: {},
      source: 'DataUtils',
      component: 'convertTimeseriesData',
    });
    return [];
  }

  // Sort by timestamp
  try {
    const sortedData = data.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();

      // Boundary check: Handle NaN during sorting
      if (Number.isNaN(timeA) || Number.isNaN(timeB)) {
        // ✅ Correct: Use logger to record error
        logger.error({
          message: 'Invalid timestamp during sorting',
          data: {
            timestampA: a.timestamp,
            timestampB: b.timestamp,
            timeA,
            timeB,
          },
          source: 'DataUtils',
          component: 'convertTimeseriesData',
        });
        return 0;
      }

      return timeA - timeB;
    });

    // Output statistics
    if (
      skippedValueCount > 0 ||
      skippedTimestampCount > 0 ||
      invalidItemCount > 0
    ) {
      // ✅ Correct: Use logger to record info
      logger.info({
        message: 'convertTimeseriesData completed with warnings',
        data: {
          totalSamples,
          skippedTimestamps: skippedTimestampCount,
          skippedValues: skippedValueCount,
          invalidItems: invalidItemCount,
          finalDataPoints: sortedData.length,
          uniqueTimestamps: allTimestamps.size,
        },
        source: 'DataUtils',
        component: 'convertTimeseriesData',
      });
    }

    return sortedData;
  } catch (sortError: unknown) {
    // ✅ Correct: Use logger to record error and expose actual error information
    const errorObj =
      sortError instanceof Error ? sortError : new Error(String(sortError));
    logger.error({
      message: 'Error during sorting',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
      },
      source: 'DataUtils',
      component: 'convertTimeseriesData',
    });
    // If sorting fails, return unsorted data
    return data;
  }
};
