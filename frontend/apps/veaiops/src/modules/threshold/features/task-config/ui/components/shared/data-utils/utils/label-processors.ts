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

import type { TimeseriesBackendItem } from '../lib/validators';

/**
 * Get the value of the specified key from the labels object
 */
export const getLabelValue = ({
  obj,
  key,
}: {
  obj: Record<string, unknown> | undefined;
  key: string;
}): string => {
  if (!obj || !(key in obj)) {
    return '';
  }

  const value = obj[key];

  // Ensure value can be safely converted to string
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
};

/**
 * Generate series identifier
 */
export const generateSeriesIdentifier = ({
  item,
  seriesIndex,
}: {
  item: TimeseriesBackendItem;
  seriesIndex: number;
}): string => {
  const { labels } = item;

  const hostname = getLabelValue({ obj: labels, key: 'hostname' });
  const itemid = getLabelValue({ obj: labels, key: 'itemid' });
  const instanceId = getLabelValue({ obj: labels, key: 'instance_id' });

  // Boundary check: generate meaningful series name (reserved, may be used for chart series identification in the future)
  if (hostname) {
    return hostname;
  } else if (itemid) {
    return `ID:${itemid}`;
  } else if (instanceId) {
    return instanceId;
  } else {
    return `series-${seriesIndex + 1}`;
  }
};
