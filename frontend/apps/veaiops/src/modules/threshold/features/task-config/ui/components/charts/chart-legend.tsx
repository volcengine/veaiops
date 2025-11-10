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

import type { MetricThresholdResult } from 'api-generate';
import type React from 'react';

interface ChartLegendProps {
  metric: MetricThresholdResult;
}

/**
 * Dashed line style component
 * Note: Tailwind does not support dashed backgrounds, use repeating-linear-gradient to implement
 */
const DashedLine: React.FC<{ color: string; className?: string }> = ({
  color,
  className = '',
}) => (
  <div
    className={`w-8 h-0.5 rounded ${className}`}
    style={{
      background: `repeating-linear-gradient(to right, ${color} 0, ${color} 4px, transparent 4px, transparent 8px)`,
    }}
  />
);

export const ChartLegend: React.FC<ChartLegendProps> = ({ metric }) => {
  const thresholds = metric.thresholds || [];
  const hasMultipleSegments = thresholds.length > 1;

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
      {/* Integration: legend + metric information */}
      <div className="flex items-start justify-between gap-4 mb-2">
        {/* Left: legend */}
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-blue-500 rounded" />
            <span className="text-xs text-gray-600">实际值</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DashedLine color="#ff4d4f" className="!w-6" />
            <span className="text-xs text-gray-600">上限</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DashedLine color="#52c41a" className="!w-6" />
            <span className="text-xs text-gray-600">下限</span>
          </div>
        </div>

        {/* Right: metric information */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">指标:</span>
          <span className="font-medium text-gray-900">{metric.name}</span>
          {hasMultipleSegments && (
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
              {thresholds.length} 个时段
            </span>
          )}
        </div>
      </div>

      {/* Segmented thresholds - table format */}
      {hasMultipleSegments ? (
        <div className="bg-white rounded border border-gray-200">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-2 px-2 py-1.5 bg-gray-100 border-b border-gray-200 text-xs font-medium text-gray-700">
            <div>时段</div>
            <div className="text-right">上限</div>
            <div className="text-right">下限</div>
            <div className="text-right">Window</div>
          </div>
          {/* Table content - display at most 4 rows, scroll if exceeds */}
          <div className="max-h-20 overflow-y-auto">
            {thresholds.map((threshold, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-2 px-2 py-1.5 text-xs border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-colors"
              >
                <div className="text-gray-800 font-medium">
                  {threshold.start_hour}:00-{threshold.end_hour}:00
                </div>
                <div className="text-right text-red-500 font-mono">
                  {threshold.upper_bound ?? '-'}
                </div>
                <div className="text-right text-green-600 font-mono">
                  {threshold.lower_bound ?? '-'}
                </div>
                <div className="text-right text-gray-600">
                  {threshold.window_size}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Single segment threshold - concise display */
        <div className="px-2 py-1.5 bg-white rounded border border-gray-200 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              时段: {thresholds[0]?.start_hour ?? 0}:00-
              {thresholds[0]?.end_hour ?? 24}:00
            </span>
            <span className="text-red-500">
              上限:{' '}
              <span className="font-mono font-medium">
                {thresholds[0]?.upper_bound ?? '-'}
              </span>
            </span>
            <span className="text-green-600">
              下限:{' '}
              <span className="font-mono font-medium">
                {thresholds[0]?.lower_bound ?? '-'}
              </span>
            </span>
            <span className="text-gray-600">
              窗口: {thresholds[0]?.window_size ?? '-'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
