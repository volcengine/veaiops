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
import type { ConversionStats, TimeseriesBackendItem } from '../types';
import { getLabelValue, parseToNumber } from '../utils';

/**
 * Process single data point
 */
export const processDataPoint = ({
  rawTimestamp,
  rawValue,
  seriesIndex,
  dataIndex,
  stats,
  data,
}: {
  rawTimestamp: string | number;
  rawValue: unknown;
  seriesIndex: number;
  dataIndex: number;
  stats: ConversionStats;
  data: TimeseriesDataPoint[];
}): void => {
  // Boundary check: Timestamp must be a number
  if (typeof rawTimestamp !== 'number' || !Number.isFinite(rawTimestamp)) {
    stats.skippedTimestampCount++;
    // ✅ Correct: Use logger to record warning
    logger.warn({
      message: `Invalid timestamp at series ${seriesIndex}, index ${dataIndex}`,
      data: { seriesIndex, index: dataIndex, rawTimestamp },
      source: 'DataUtils',
      component: 'processDataPoint',
    });
    return;
  }

  // Boundary check: Timestamp range reasonableness (between 1970-2100)
  const MIN_TIMESTAMP = 0; // 1970-01-01
  const MAX_TIMESTAMP = 4102444800; // 2100-01-01
  if (rawTimestamp < MIN_TIMESTAMP || rawTimestamp > MAX_TIMESTAMP) {
    stats.skippedTimestampCount++;
    // ✅ Correct: Use logger to record warning
    logger.warn({
      message: `Timestamp out of reasonable range at series ${seriesIndex}, index ${dataIndex}`,
      data: {
        seriesIndex,
        index: dataIndex,
        rawTimestamp,
        MIN_TIMESTAMP,
        MAX_TIMESTAMP,
      },
      source: 'DataUtils',
      component: 'processDataPoint',
    });
    return;
  }

  const timestampDate = new Date(rawTimestamp * 1000);

  // Boundary check: Date object must be valid
  if (Number.isNaN(timestampDate.getTime())) {
    stats.skippedTimestampCount++;
    return;
  }

  const timestamp = timestampDate.toISOString();
  stats.totalSamples++;

  const actualValue = parseToNumber(rawValue);

  // Boundary check: Value must be a valid number
  if (actualValue !== undefined) {
    // Boundary check: Value reasonableness (optional, based on business requirements)
    // For example: Filter out abnormally large values
    const MAX_REASONABLE_VALUE = Number.MAX_SAFE_INTEGER;
    const MIN_REASONABLE_VALUE = -Number.MAX_SAFE_INTEGER;

    if (
      actualValue >= MIN_REASONABLE_VALUE &&
      actualValue <= MAX_REASONABLE_VALUE
    ) {
      data.push({
        timestamp,
        value: actualValue,
        type: '实际值',
      });
    } else {
      stats.skippedValueCount++;
      // ✅ Correct: Use logger to record warning
      logger.warn({
        message: `Value out of reasonable range at series ${seriesIndex}, index ${dataIndex}`,
        data: { seriesIndex, index: dataIndex, actualValue },
        source: 'DataUtils',
        component: 'processDataPoint',
      });
    }
  } else {
    stats.skippedValueCount++;
  }
};

/**
 * Process time series item
 */
export const processTimeseriesItem = ({
  item,
  seriesIndex,
  stats,
  data,
  allTimestamps,
}: {
  item: TimeseriesBackendItem;
  seriesIndex: number;
  stats: ConversionStats;
  data: TimeseriesDataPoint[];
  allTimestamps: Set<string>;
}): void => {
  const { timestamps } = item;
  const { values } = item;
  const labels = item.labels || {};

  // Boundary check: timestamps and values lengths may be inconsistent, take minimum
  const loopLength = Math.min(timestamps.length, values.length);

  if (timestamps.length !== values.length) {
    // ✅ Correct: Use logger to record warning
    logger.warn({
      message: `Timestamp and value arrays have different lengths for series ${seriesIndex}`,
      data: {
        seriesIndex,
        timestampsLength: timestamps.length,
        valuesLength: values.length,
      },
      source: 'DataUtils',
      component: 'processTimeseriesItem',
    });
  }

  // Get label values
  const hostname = getLabelValue({ obj: labels, key: 'hostname' });
  const itemid = getLabelValue({ obj: labels, key: 'itemid' });
  const instanceId = getLabelValue({ obj: labels, key: 'instance_id' });

  // Boundary check: Generate meaningful series name (reserved, may be used for chart series identification in the future)
  let _seriesIdentifier = '';
  if (hostname) {
    _seriesIdentifier = hostname;
  } else if (itemid) {
    _seriesIdentifier = `ID:${itemid}`;
  } else if (instanceId) {
    _seriesIdentifier = instanceId;
  } else {
    _seriesIdentifier = `series-${seriesIndex + 1}`;
  }

  // Process each data point
  for (let i = 0; i < loopLength; i++) {
    const rawTimestamp = timestamps[i];
    const rawValue = values[i];

    processDataPoint({
      rawTimestamp,
      rawValue,
      seriesIndex,
      dataIndex: i,
      stats,
      data,
    });

    // Record timestamp to set (for adding threshold lines later)
    if (typeof rawTimestamp === 'number' && Number.isFinite(rawTimestamp)) {
      const timestampDate = new Date(rawTimestamp * 1000);
      if (!Number.isNaN(timestampDate.getTime())) {
        allTimestamps.add(timestampDate.toISOString());
      }
    }
  }
};
