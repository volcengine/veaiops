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

import type { TableDataSource } from '@veaiops/types';
import { createServerPaginationDataSource } from '@veaiops/utils';
import type { IntelligentThresholdTaskVersion } from 'api-generate';
import { useMemo } from 'react';
import { createTaskVersionTableRequestWrapper } from '../lib/task-version-request';

/**
 * Task version table configuration Hook
 * Provides configuration required by CustomTable
 */
export const useTaskVersionTableConfig = (
  taskId?: string,
): {
  dataSource: TableDataSource<IntelligentThresholdTaskVersion>;
} => {
  const request = useMemo(
    () => createTaskVersionTableRequestWrapper(taskId),
    [taskId],
  );

  // 🎯 Use utility function to create data source
  const dataSource = useMemo(
    () =>
      createServerPaginationDataSource({
        request,
        ready: Boolean(taskId),
      }),
    [request, taskId],
  );

  return {
    dataSource,
  };
};
