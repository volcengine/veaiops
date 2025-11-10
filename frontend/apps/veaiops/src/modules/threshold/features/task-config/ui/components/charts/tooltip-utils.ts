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

import { formatDateTime } from '@veaiops/utils';
import type { TimeseriesDataPoint } from '../shared/types';
import { COLOR_MAP } from './constants';

/**
 * Generate tooltip index for quick data point lookup
 */
export const createTooltipIndex = (timeseriesData: TimeseriesDataPoint[]) => {
  const index = new Map<
    string,
    Array<{ name: string; value: string; color: string }>
  >();
  if (!timeseriesData || timeseriesData.length === 0) {
    return index;
  }

  // Use unified color mapping to ensure consistency between lines, legend and Tooltip
  const colorMap: Record<string, string> = COLOR_MAP;

  for (const d of timeseriesData) {
    const ts = d.timestamp;
    if (!ts) {
      continue;
    }
    if (!index.has(ts)) {
      index.set(ts, []);
    }
    const bucket = index.get(ts)!;
    if (d.value === null || d.value === undefined) {
      continue;
    }
    const name = d.type || '未知';
    const color = colorMap[name] || '#666';
    bucket.push({ name, value: Number(d.value).toFixed(2), color });
  }

  return index;
};

/**
 * Render tooltip content
 */
export const renderTooltip = (
  _event: any,
  { title }: any,
  tooltipIndex: Map<
    string,
    Array<{ name: string; value: string; color: string }>
  >,
) => {
  // title is the ISO time set above
  const key = new Date(title).toISOString();
  const items = tooltipIndex.get(key) || [];
  const displayTime = formatDateTime(title);
  if (!items.length) {
    return '';
  }
  return `
    <div style="padding:8px 12px;font-size:12px;">
      <div style="margin-bottom:8px;font-weight:500;color:#000;">${displayTime}</div>
      <div>
        ${items
          .map(
            (it: any) => `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="display:flex;align-items:center;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${it.color};margin-right:8px;"></span>
              <span>${it.name}</span>
            </span>
            <span style="margin-left:16px;font-weight:500;">${it.value}</span>
          </div>`,
          )
          .join('')}
      </div>
    </div>`;
};
