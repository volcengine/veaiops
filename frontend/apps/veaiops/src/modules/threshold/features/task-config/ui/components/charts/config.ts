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

import type { LineConfig } from '@ant-design/plots';
import { formatDateTime } from '@veaiops/utils';
import type { TimeseriesDataPoint } from '../shared/types';
import { COLOR_MAP, SERIES_ALIAS_MAP } from './constants';
import type { AxisDensityOptions } from './types';

/**
 * Generate time series chart configuration
 */
export const getChartConfig = (
  data: TimeseriesDataPoint[],
  options: AxisDensityOptions = {},
): LineConfig => {
  const uniqueTimestamps = Array.from(
    new Set(data.map((d) => String(d.timestamp))),
  );
  const MAX_TICKS = options.maxXTicks ?? 8;
  const MIN_TICKS = 3; // Minimum 3 ticks to display
  // Calculate actual tick count: not less than minimum, not more than maximum
  const actualTicks = Math.min(
    Math.max(uniqueTimestamps.length, MIN_TICKS),
    MAX_TICKS,
  );

  // Extract unique type values and sort in fixed order
  const uniqueTypes = [...new Set(data.map((d) => d.type))];
  // If data is empty, use default complete type list to avoid legend disappearing
  const orderedTypes =
    uniqueTypes.length > 0
      ? ['实际值', '上阈值', '下阈值'].filter((t) =>
          uniqueTypes.includes(t as TimeseriesDataPoint['type']),
        )
      : ['实际值', '上阈值', '下阈值'];
  const colorRange = orderedTypes.map(
    (type) => COLOR_MAP[type as TimeseriesDataPoint['type']],
  );

  // Large data volume rendering optimization threshold
  const LARGE_DATA_THRESHOLD = 2000;
  const isLargeDataset = data.length > LARGE_DATA_THRESHOLD;

  // Calculate x-axis domain
  const xDomain = options.timeRange
    ? [options.timeRange[0].getTime(), options.timeRange[1].getTime()]
    : undefined;

  return {
    data,
    // Explicitly convert time axis to Date, ensure using continuous time scale (time scale)
    xField: (d: any) => new Date(d.timestamp),
    yField: 'value',
    seriesField: 'type',
    // Explicitly declare color channel, ensure coloring by type and driving legend
    colorField: 'type',
    // Disable smoothing for large data volumes to reduce computation overhead
    smooth: !isLargeDataset,
    autoFit: true,
    // Add padding to reserve space for bottom x-axis labels (horizontal labels need more space)
    appendPadding: [10, 10, 40, 10], // [top, right, bottom, left]
    // Disable animation for large data volumes
    animation: isLargeDataset
      ? false
      : {
          appear: {
            animation: 'path-in',
            duration: 1000,
          },
        },
    // Use scale configuration: color mapping + x-axis continuous time scale
    scale: {
      // Force tick count at scale level and disable nice to avoid being aligned to full day with only 1 tick
      x: {
        type: 'time',
        nice: false,
        tickCount: actualTicks,
        // If time range is provided, force x-axis to display complete time range
        ...(xDomain && {
          domain: xDomain,
        }),
      },
      y: { nice: true, domainMin: 0 }, // Ensure y-axis starts from 0
      color: {
        domain: orderedTypes, // Explicitly specify domain to ensure order
        range: colorRange, // Corresponding color array
      },
    },
    // Use style callback to configure dashed line style (note: parameter is data array, not single datum)
    style: {
      lineWidth: 2,
      lineDash: (seriesData: any[]) => {
        // seriesData is all data points of current series
        if (seriesData && seriesData.length > 0) {
          const type = seriesData[0].type as TimeseriesDataPoint['type'];
          const isThreshold = type === '上阈值' || type === '下阈值';

          return isThreshold ? [4, 4] : undefined;
        }
        return undefined;
      },
    },
    legend: {
      position: 'top' as const,
      itemName: {
        formatter: (text?: string) => {
          const label =
            (text && SERIES_ALIAS_MAP[text as TimeseriesDataPoint['type']]) ||
            text ||
            '';
          return label;
        },
      },
      marker: {
        symbol: 'line',
        style: {
          lineWidth: 2,
        },
      },
    },
    axis: {
      x: {
        position: 'bottom',
        title: null,
        // Axis line configuration
        line: true,
        lineLineWidth: 1,
        lineStroke: '#e5e7eb',
        // Tick line configuration
        tick: true,
        tickLength: 4,
        tickLineWidth: 1,
        tickStroke: '#e5e7eb',
        tickCount: actualTicks,
        // Tick value (label) configuration
        label: true,
        labelFormatter: (d: string | Date) => formatDateTime(d),
        labelFontSize: 11,
        labelFill: '#4E5969',
        labelSpacing: 8, // Spacing from tick value to its corresponding tick
        labelAlign: 'horizontal', // Always keep horizontal
        labelAutoRotate: false, // Disable auto-rotation
        // Manually filter labels to avoid overlap
        labelFilter: (_datum: any, index: number, data?: any[]) => {
          // Defensive check: If data is undefined or empty, show all labels
          if (!data || !Array.isArray(data)) {
            return true;
          }

          const totalLabels = data.length;

          // Always show first and last (highest priority)
          if (index === 0 || index === totalLabels - 1) {
            return true;
          }

          // Show all when labels are few
          if (totalLabels <= 6) {
            return true;
          }

          // Dynamically calculate display interval based on total label count
          const interval = Math.ceil(totalLabels / 6);
          return index % interval === 0;
        },
        transform: [
          {
            type: 'hide', // Hide overlapping labels
            keepHeader: true, // Keep first label
            keepTail: true, // Keep last label
          },
        ],
        tickFilter: undefined,
      },
      y: {
        position: 'left',
        title: null,
        // Axis line configuration
        line: true,
        lineLineWidth: 1,
        lineStroke: '#e5e7eb',
        // Tick line configuration
        tick: true,
        tickLength: 4,
        tickLineWidth: 1,
        tickStroke: '#e5e7eb',
        // Tick value (label) configuration
        label: true,
        labelFormatter: (text: string) => {
          const numeric = Number(text);
          return Number.isFinite(numeric) ? numeric.toFixed(2) : String(text);
        },
        labelFontSize: 11,
        labelFill: '#4E5969',
      },
    },
    meta: {
      timestamp: {
        type: 'time',
        formatter: (value: string | Date) => formatDateTime(value),
      },
      value: {
        alias: '值',
        formatter: (value: number) =>
          Number.isFinite(value) ? Number(value).toFixed(2) : String(value),
      },
      type: {
        alias: '线条',
        formatter: (value: TimeseriesDataPoint['type']) =>
          SERIES_ALIAS_MAP[value] || value,
      },
    },
    // Tooltip will be configured and overridden in specific components
    // Disable points for large data volumes to reduce DOM/rendering
    point: isLargeDataset
      ? undefined
      : {
          size: 2,
          shape: 'circle',
        },
  };
};
