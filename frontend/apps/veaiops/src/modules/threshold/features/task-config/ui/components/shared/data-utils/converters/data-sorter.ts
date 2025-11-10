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
import type { ConversionStats } from '../types';

/**
 * Sort data by timestamp
 */
export const sortDataByTimestamp = ({
  data,
  stats,
}: {
  data: TimeseriesDataPoint[];
  stats: ConversionStats;
}): TimeseriesDataPoint[] => {
  try {
    const sortedData = data.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();

      // Boundary check: handle NaN during sorting
      if (Number.isNaN(timeA) || Number.isNaN(timeB)) {
        // ✅ Correct: use logger to record error
        logger.error({
          message: 'Invalid timestamp during sorting',
          data: {
            timestampA: a.timestamp,
            timestampB: b.timestamp,
            timeA,
            timeB,
          },
          source: 'DataUtils',
          component: 'sortDataByTimestamp',
        });
        return 0;
      }

      return timeA - timeB;
    });

    return sortedData;
  } catch (sortError) {
    // ✅ Correct: use logger to record error and expose actual error information
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
      component: 'sortDataByTimestamp',
    });
    // If sorting fails, return unsorted data
    return data;
  }
};
