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

import type { TimeseriesDataPoint } from '../shared/types';

/** Series alias mapping, unified for line color, legend and Tooltip */
export const SERIES_ALIAS_MAP: Record<TimeseriesDataPoint['type'], string> = {
  实际值: '历史时序数据',
  上阈值: '上限阈值线 (虚线)',
  下阈值: '下限阈值线 (虚线)',
};

/** Fixed color mapping, unified for line color, legend and Tooltip */
export const COLOR_MAP: Record<TimeseriesDataPoint['type'] | string, string> = {
  实际值: '#165DFF',
  上阈值: '#F53F3F',
  下阈值: '#00B42A',
};
