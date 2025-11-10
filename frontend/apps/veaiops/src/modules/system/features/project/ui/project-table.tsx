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

import {
  PROJECT_MANAGEMENT_CONFIG,
  type ProjectTableProps,
  useProjectTableConfig,
} from '@project';
import { CustomTable } from '@veaiops/components';
import React, { forwardRef } from 'react';

/**
 * Project table component
 * Standardized implementation based on CustomTable
 * Uses useBusinessTable and operationWrapper to achieve auto refresh, no need to manually manage ref
 */
export const ProjectTable = forwardRef<
  { refresh: () => Promise<void> },
  ProjectTableProps
>(({ onDelete, onImport, onCreate }, ref) => {
  // 🎯 Use useProjectTableConfig Hook to automatically handle refresh logic
  // ✅ Pass ref to useProjectTableConfig so useBusinessTable can use ref to refresh
  const { customTableProps, handleColumns, handleFilters, actions } =
    useProjectTableConfig({
      onDelete,
      onImport,
      onCreate,
      ref, // ✅ Pass ref to Hook
    });

  return (
    <CustomTable
      ref={ref}
      {...customTableProps}
      title={PROJECT_MANAGEMENT_CONFIG.title}
      handleColumns={handleColumns}
      handleFilters={handleFilters}
      actions={actions}
    />
  );
});

// Set displayName for debugging
ProjectTable.displayName = 'ProjectTable';

export default ProjectTable;
