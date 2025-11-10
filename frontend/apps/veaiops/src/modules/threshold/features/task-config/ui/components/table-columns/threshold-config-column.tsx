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

import type { IntelligentThresholdConfig } from 'api-generate';
import type React from 'react';

/**
 * Single threshold configuration item component
 */
const ThresholdConfigItem: React.FC<{
  threshold: IntelligentThresholdConfig;
  index: number;
}> = ({ threshold, index }) => (
  <div key={index} className="p-2 bg-gray-50 rounded border">
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium">
        {threshold.start_hour}:00 - {threshold.end_hour}:00
      </span>
      <span className="text-xs text-gray-500">
        窗口: {threshold.window_size}
      </span>
    </div>
    <div className="mt-1 flex items-center gap-4">
      <div className="flex items-center gap-1">
        <span className="text-xs text-red-500">上限:</span>
        <span className="font-mono text-sm">
          {threshold.upper_bound ?? '-'}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-blue-500">下限:</span>
        <span className="font-mono text-sm">
          {threshold.lower_bound ?? '-'}
        </span>
      </div>
    </div>
    {/* Simple threshold visualization bar */}
    <div className="mt-2 h-2 bg-gray-200 rounded relative">
      {Boolean(threshold.lower_bound) && (
        <div
          className="absolute left-0 top-0 h-full bg-blue-400 rounded-l"
          style={{
            width: `${Math.max(
              0,
              Math.min(100, ((threshold.lower_bound ?? 0) / 100) * 100),
            )}%`,
          }}
        />
      )}
      {threshold.upper_bound && (
        <div
          className="absolute right-0 top-0 h-full bg-red-400 rounded-r"
          style={{
            width: `${Math.max(
              0,
              Math.min(100, ((100 - threshold.upper_bound) / 100) * 100),
            )}%`,
          }}
        />
      )}
    </div>
  </div>
);

/**
 * Threshold configuration column render component
 */
export const ThresholdConfigColumn: React.FC<{
  thresholds: IntelligentThresholdConfig[];
}> = ({ thresholds }) => {
  if (!thresholds || thresholds.length === 0) {
    return <span className="text-[#999]">-</span>;
  }

  return (
    <div className="space-y-2">
      {thresholds.map((threshold, index) => (
        <ThresholdConfigItem key={index} threshold={threshold} index={index} />
      ))}
    </div>
  );
};
