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

import { Line } from '@ant-design/plots';

import { useMemo } from 'react';

import type { TimeseriesDataPoint } from '../shared/types';
import { getChartConfig } from './config';
import { createTooltipIndex, renderTooltip } from './tooltip-utils';

export interface TimeseriesChartProps {
  timeseriesData: TimeseriesDataPoint[];
  className?: string;
  timeRange?: [Date, Date]; // Add time range parameter
}

export const TimeseriesChart: React.FC<TimeseriesChartProps> = ({
  timeseriesData,
  className = 'w-full h-[500px]',
  timeRange,
}) => {
  // Pre-build tooltip data index, aggregate by timestamp (avoid O(n) filtering on each hover)
  const tooltipIndexByTimestamp = useMemo(() => {
    return createTooltipIndex(timeseriesData);
  }, [timeseriesData]);

  const lineConfig = {
    ...getChartConfig(timeseriesData, {
      // maxXTicks: 8,
      // xLabelOptionalAngles: [0, 25, 45, 60],
      timeRange, // Pass time range
    }),
    // Use G2 v5 Tooltip API: configure content via title/items, rendered by interaction.tooltip.render
    tooltip: {
      // Title uses ISO format for easy indexing
      title: (d: any) => new Date(d.timestamp).toISOString(),
      // items use default channel, not explicitly declared here, customize by index in render
    },
    interaction: {
      tooltip: {
        shared: true,
        series: true,
        crosshairs: true,
        // Increase wait time to reduce rendering frequency
        wait: 120,
        render: (_event: any, { title }: any) => {
          return renderTooltip(_event, { title }, tooltipIndexByTimestamp);
        },
      },
    },
  };

  return (
    <div className={className}>
      <Line {...lineConfig} />
    </div>
  );
};
