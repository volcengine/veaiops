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

import type { FC } from 'react';

interface FormatDurationProps {
  value?: number;
  unit?: 'ms' | 's' | 'm' | 'h' | 'd';
  precision?: number;
  duration: number | string | null | undefined;
  [key: string]: any;
}

const formatDuration = (props: FormatDurationProps): string => {
  const { value = 0, unit = 'ms', precision = 2 } = props;

  if (!value || value === 0) {
    return '0';
  }

  let milliseconds = value;
  switch (unit) {
    case 's':
      milliseconds = value * 1000;
      break;
    case 'm':
      milliseconds = value * 60 * 1000;
      break;
    case 'h':
      milliseconds = value * 60 * 60 * 1000;
      break;
    case 'd':
      milliseconds = value * 24 * 60 * 60 * 1000;
      break;
    default:
      break;
  }

  const seconds = milliseconds / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;

  if (days >= 1) {
    return `${days.toFixed(precision)}d`;
  } else if (hours >= 1) {
    return `${hours.toFixed(precision)}h`;
  } else if (minutes >= 1) {
    return `${minutes.toFixed(precision)}m`;
  } else if (seconds >= 1) {
    return `${seconds.toFixed(precision)}s`;
  } else {
    return `${milliseconds.toFixed(0)}ms`;
  }
};

/**
 * Duration rendering component
 * @param props
 * @constructor
 */
const DurationRender: FC<FormatDurationProps> = (props) => {
  const duration = formatDuration({ ...props });
  return <>{duration}</>;
};

export { DurationRender };
