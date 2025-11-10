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

import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { getConfigColumn } from './config';
import { getOperationColumn } from './operation';
import { getStatusColumn } from './status';
import { getCreatedAtColumn, getUpdatedAtColumn } from './time';
import type { FlattenedVersion, VersionColumnsProps } from './types';
import { getVersionColumn } from './version';
import { getWindowSizeColumn } from './window-size';

/**
 * Generate table column configuration
 */
export const handleColumns = ({
  setDetailConfigData,
  setDetailConfigVisible,
  onCreateAlarm,
  onViewCleaningResult,
  onRerunOpen,
}: VersionColumnsProps): ColumnProps<FlattenedVersion>[] => {
  return [
    getVersionColumn(),
    getConfigColumn({ setDetailConfigData, setDetailConfigVisible }),
    getWindowSizeColumn(),
    getStatusColumn(),
    getCreatedAtColumn(),
    getUpdatedAtColumn(),
    getOperationColumn({
      onCreateAlarm,
      onViewCleaningResult,
      onRerunOpen,
    }),
  ];
};

// Export types for external use
export type {
  FlattenedVersion,
  WithOptionalRowSpan,
  VersionColumnsProps,
} from './types';
